import uuid
from typing import Dict, List, Callable, AsyncIterable
from dotenv import load_dotenv
from pydantic.v1.error_wrappers import ValidationError as PydanticV1ValidationError
from fastapi import HTTPException
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.runnables import RunnablePassthrough

from llm.assets import create_or_update_embeddings, load_embeddings, delete_embedding
from aif_types.llm import LlmProvider, LlmFeature
from aif_types.chat import ChatHistoryEntity, ChatRole
# from aif_types.chat import ChatRequest, ChatHistoryEntity, ChatRole
from aif_types.agents import CreateAgentRequest, CreateOrUpdateAgentResponse, AgentEntity, ListAgentsResponse, UpdateAgentRequest
from aif_types.embeddings import CreateEmbeddingsRequest, CreateOrUpdateEmbeddingsResponse, EmbeddingEntity, ListEmbeddingsResponse, UpdateEmbeddingMetadataRequest
from aif_types.languagemodels import ListLanguageModelsResponse, LanguageModelInfo, UpdateLmProviderRequest, ListLmProvidersResponse
from aif_types.functions import AifFunctionType, ListFunctionsResponse, CreateFunctionRequest, UpdateFunctionRequest, CreateOrUpdateFunctionResponse, FunctionEntity
from llm._llm_manager_prompt_utils import get_prompt_template
from database.database_manager import DatabaseManager
from utils.aif_utils import create_aif_agent_uri
from llm.llm_function_utils import build_local_function_uri, create_func_file, delete_func_file
from llm.chat_utils import process_aif_agent_uri, ProcessAifAgentUriResponse
from llm.llm_tools_utils import processToolsResponse
from llm.i_lm_provider import ILmProvider
from llm.lm_provider_ollama import LmProviderOllama
from llm.lm_provider_azureopenai import LmProviderAzureOpenAI
from llm.lm_provider_openai import LmProviderOpenAI
from llm.lm_provider_googlegemini import LmProviderGoogleGemini
from llm.lm_provider_anthropic import LmProviderAnthropic
from llm.lm_provider_huggingface import LmProviderHuggingFace
from llm.lm_provider_aws_bedrock import LmProviderAwsBedrock
from aif_types.common import RequestFileInfo
from aif_types.system import SystemConfig
from llm.lm_rag_utils import create_context_id
from consts import RESPONSE_LINEBREAK
from utils.exception_utils import extraValidationErrorMessage


load_dotenv()  # take environment variables from .env.


class LlmManager:
	def __init__(self, database_manager: DatabaseManager):
		# self.chat_agent_map = {}
		self.database_manager = database_manager
		self.lmProviderMap: Dict[str, ILmProvider] = {}
		self.lmProviderMap[LlmProvider.OLLAMA] = LmProviderOllama()
		self.lmProviderMap[LlmProvider.AZUREOPENAI] = LmProviderAzureOpenAI()
		self.lmProviderMap[LlmProvider.OPENAI] = LmProviderOpenAI()
		self.lmProviderMap[LlmProvider.GOOGLEGEMINI] = LmProviderGoogleGemini()
		self.lmProviderMap[LlmProvider.ANTHROPIC] = LmProviderAnthropic()
		self.lmProviderMap[LlmProvider.HUGGINGFACE] = LmProviderHuggingFace()
		self.lmProviderMap[LlmProvider.AWS_BEDROCK] = LmProviderAwsBedrock()


	def getLmProviderHealthMap(self):
		healthMap = {}
		for provider in self.lmProviderMap.values():
			healthMap[provider.getId()] = provider.isHealthy()
		return healthMap


	def get_system_config(self) -> SystemConfig:
		raise NotImplementedError("Not implemented")


	async def chat(self,
		aif_session_id: str,
		aif_agent_uri: str,
		outputFormat: str,
		input: str,
		requestFileInfoList: List[RequestFileInfo],
	) -> AsyncIterable[str]:
		try:
			request_info = process_aif_agent_uri(self.database_manager, aif_agent_uri)
			runnable = self._get_chat_runnable(
				input=input,
				requestFileInfoList=requestFileInfoList,
				outputFormat=outputFormat,
				aif_session_id=aif_session_id,
				request_info=request_info,
			)

			# if request_info has functions, invoke the request and wait for the response because LM may send back a tool call
			if not request_info.functions:
				response = ""

				# iterable = runnable.astream(request.input, config={"callbacks": [DebugPromptHandler()]})	# for debugging
				iterable = runnable.astream(input)
				async for chunk in iterable:
					response = response + chunk.content
					yield chunk.content

				self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.USER, content=input, files=requestFileInfoList)
				self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.ASSISTANT, content=response)
			else:
				# For function calling, we need the full response to process the tools
				# invoke_result = runnable.invoke(request.input, config={"callbacks": [DebugPromptHandler()]})	# for debugging
				invoke_result = runnable.invoke(input)

				response = ""
				# Special case from Anthropic response: invoke_result.content is a list, find the content from the first item
				if type(invoke_result.content) == list and len(invoke_result.content) > 0:
					responseText = invoke_result.content[0]["text"]
				elif invoke_result.content:
					responseText = invoke_result.content
				else:
					responseText = ""

				if len(responseText) > 0:
					response += responseText
					yield responseText + RESPONSE_LINEBREAK + RESPONSE_LINEBREAK

				tool_result = processToolsResponse(invoke_result, request_info.functions)
				if type(tool_result) != str:
					raise HTTPException(status_code=400, detail="Tool response should be a string")
				response += tool_result
				yield tool_result

				self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.USER, content=input, files=requestFileInfoList)
				self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.ASSISTANT, content=response)

		except Exception as e:
			if isinstance(e, HTTPException):
				yield e.detail
			elif isinstance(e, ValueError):
				yield str(e)
			else:
				yield "Sorry, something went wrong"


	def get_chat_history(self, aif_session_id: str) -> ChatHistoryEntity:
		chat_history = self.database_manager.get_chat_history(aif_session_id)
		if chat_history is None:
			raise HTTPException(status_code=404, detail="Chat session not found")
		else:
			return chat_history


	def _get_chat_runnable(
		self,
		aif_session_id: str,
		request_info: ProcessAifAgentUriResponse,
		outputFormat: str,
		input: str,
		requestFileInfoList: List[RequestFileInfo],
	):
		input_chain = { "input": RunnablePassthrough() }
		ragRetrieverList = []
		if len(request_info.aif_rag_asset_ids) > 0:
			for index, aif_rag_asset_id in enumerate(request_info.aif_rag_asset_ids):
				vectorstore = load_embeddings(asset_id=aif_rag_asset_id, llm=None, get_llm=self._get_llm, database_manager=self.database_manager)
				ragRetriever = vectorstore.as_retriever()
				input_chain[create_context_id(index)] = ragRetriever
				ragRetrieverList.append(ragRetriever)

		model = self._get_llm(request_info.agent_uri, request_info.functions)

		review_prompt_template = get_prompt_template(
			database_manager=self.database_manager,
			ragRetrieverList=ragRetrieverList,
			system_prompt_str=request_info.system_prompt,
			aif_session_id=aif_session_id,
			input=input,
			requestFileInfoList=requestFileInfoList,
			outputFormat=outputFormat,
		)

		return (
			input_chain
			| review_prompt_template
			| model
		)


	def list_embeddings(self):
		embedding_metadata_list = self.database_manager.list_embeddings_metadata()
		return ListEmbeddingsResponse(embeddings=embedding_metadata_list)


	def create_embedding(self, file_dict: Dict[str, str], aif_basemodel_uri: str, name: str | None) -> CreateOrUpdateEmbeddingsResponse:
		llm: Embeddings = self._get_llm(aif_basemodel_uri, is_embedding=True)
		document_strs = list(file_dict.values())
		documents = [Document(page_content=x, metadata={"source": "local"}) for x in document_strs]
		name = name if name else '-'.join(list(file_dict.keys()))
		return create_or_update_embeddings(asset_id=None, name=name, basemodel_uri=aif_basemodel_uri, llm=llm, documents=documents, database_manager=self.database_manager)


	def update_embedding(self, file_dict: Dict[str, str], aif_embedding_asset_id: str, name: str | None) -> CreateOrUpdateEmbeddingsResponse:
		embedding = self.database_manager.load_embeddings_metadata(aif_embedding_asset_id)
		if not embedding:
			raise HTTPException(status_code=404, detail="Embedding not found")
		
		llm: Embeddings = self._get_llm(embedding.basemodel_uri, is_embedding=True)

		document_strs = list(file_dict.values())
		if len(document_strs) == 0:
			documents = None
		else:
			documents = [Document(page_content=x, metadata={"source": "local"}) for x in document_strs]

		return create_or_update_embeddings(
			asset_id=embedding.id,
			name=name if name else embedding.name,
			basemodel_uri=embedding.basemodel_uri,
			llm=llm,
			documents=documents,
			database_manager=self.database_manager
		)		


	def update_embedding_metadata(self, request: UpdateEmbeddingMetadataRequest, aif_embedding_asset_id: str) -> EmbeddingEntity:
		embedding_metadata = self.database_manager.load_embeddings_metadata(asset_id=aif_embedding_asset_id)

		if not embedding_metadata:
			raise HTTPException(status_code=404, detail="Embedding not found")
		else:
			embedding_metadata.name = request.name
			self.database_manager.save_db_model(embedding_metadata)
			return embedding_metadata
	

	def delete_embedding(self, aif_embedding_asset_id: str):
		embedding_metadata = self.database_manager.load_embeddings_metadata(asset_id=aif_embedding_asset_id)
		if not embedding_metadata:
			raise HTTPException(status_code=404, detail="Embedding not found")
		
		return delete_embedding(asset_id=embedding_metadata.id, database_manager=self.database_manager)		


	def create_embeddings_content(self, request: CreateEmbeddingsRequest, aif_basemodel_uri: str) -> CreateOrUpdateEmbeddingsResponse:
		llm: Embeddings = self._get_llm(aif_basemodel_uri, is_embedding=True)
		document_strs = [request.input] if isinstance(request.input, str) else request.input
		documents = [Document(page_content=x, metadata={"source": "local"}) for x in document_strs]
		name = request.name if request.name else ""
		return create_or_update_embeddings(asset_id=None, name=name, basemodel_uri=aif_basemodel_uri, llm=llm, documents=documents, database_manager=self.database_manager)


	def list_languagemodels(self, llm_feature: LlmFeature) -> ListLanguageModelsResponse:
		basemodels: List[LanguageModelInfo] = []

		for provider in self.lmProviderMap.values():
			if not provider.isHealthy():
				continue
			basemodels.extend(provider.listLanguageModels(llm_feature))

		return ListLanguageModelsResponse(basemodels=basemodels)


	def listLmProviders(self):
		providers = [self.lmProviderMap[provider].getLanguageProviderInfo() for provider in self.lmProviderMap]
		return ListLmProvidersResponse(providers=providers)


	def updateLmProvider(self, request: UpdateLmProviderRequest):
		for provider in self.lmProviderMap.values():
			if provider.getId() == request.lmProviderId:
				provider.updateLmProvider(request)
				return self.listLmProviders()
		raise HTTPException(status_code=404, detail="Unknown language model provider")

	def list_agents(self) -> ListAgentsResponse:
		return ListAgentsResponse(agents=self.database_manager.list_agents())


	def create_agent(self, request: CreateAgentRequest) -> CreateOrUpdateAgentResponse:
		uuid_value = str(uuid.uuid4())
		agent_uri = create_aif_agent_uri(uuid_value)
		model = AgentEntity(
			id=uuid_value,
			agent_uri=agent_uri,
			name=request.name if request.name else uuid_value,
			base_model_uri=request.base_model_uri,
			system_prompt=request.system_prompt,
			rag_asset_ids=request.rag_asset_ids if request.rag_asset_ids else [],
			function_asset_ids=request.function_asset_ids if request.function_asset_ids else [],
		)
		self.database_manager.save_db_model(model)
		return CreateOrUpdateAgentResponse(agent_uri=agent_uri)


	def update_agent(self, id: str, request: UpdateAgentRequest) -> CreateOrUpdateAgentResponse:
		if not id:
			raise HTTPException(status_code=400, detail="Model id is required")
		return self.database_manager.update_agent(id=id, request=request)


	def delete_agent(self, id: str):
		return self.database_manager.delete_agent(id=id)


	def list_functions(self):
		functions = self.database_manager.list_functions()
		return ListFunctionsResponse(functions=functions)


	def create_function(self, request: CreateFunctionRequest) -> CreateOrUpdateFunctionResponse:
		if request.type == AifFunctionType.LOCAL:
			id = str(uuid.uuid4())
			create_func_file(request.functions_path, request.functions_name)
			uri = build_local_function_uri(request.functions_path, request.functions_name)
			function = FunctionEntity(
				id=id,
				uri=uri,
				name=request.name,
				functions_path=request.functions_path,
				functions_name=request.functions_name,
			)
			self.database_manager.save_db_model(function)
			return CreateOrUpdateFunctionResponse(
				id=id,
				uri=uri,
				name=request.name,
				functions_path=request.functions_path,
				functions_name=request.functions_name,
			)
		elif request.type == AifFunctionType.AZURE_FUNCTIONS:
			raise Exception("Not implemented")
		else:
			raise HTTPException(status_code=404, detail="Invalid function type")
		
	
	def update_function(self, request: UpdateFunctionRequest) -> CreateOrUpdateFunctionResponse:
		return self.database_manager.update_function(request=request)


	def delete_function(self, id: str):
		func_metadata = self.database_manager.get_function(id=id)
		delete_func_file(func_metadata.functions_path, func_metadata.functions_name)
		return self.database_manager.delete_function(id=id)


	def _get_llm(self, aif_agent_uri: str, functions: List[Callable] = [], is_embedding = False):
		try:
			for provider in self.lmProviderMap.values():
				if provider.canHandle(aif_agent_uri):
					if is_embedding:
						return provider.getBaseEmbeddingsModel(aif_agent_uri)
					else:
						return provider.getBaseLanguageModel(aif_agent_uri, functions)
		except Exception as e:
			if isinstance(e, PydanticV1ValidationError):
				# Very likely come from AWS Bedrock, which includes information for the credentials
				errorMessage = extraValidationErrorMessage(e)
				raise HTTPException(status_code=400, detail=errorMessage)
			else:
				raise HTTPException(status_code=400, detail=f"Failed to load model {aif_agent_uri}")

		raise HTTPException(status_code=404, detail="Model not found")
