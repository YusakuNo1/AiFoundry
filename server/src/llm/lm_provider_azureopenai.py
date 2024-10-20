import os
import dotenv
from typing import List, Callable
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from aif_types.languagemodels import LanguageModelInfo, LmProviderEntity, LmProviderProperty, UpdateLmProviderRequest, LmProviderBaseModelInfo
from aif_types.llm import LlmFeature, LlmProvider
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps
from llm.llm_tools_utils import create_tool
from llm.llm_uri_utils import BaseLlmInfo
from utils.credential_utils import maskCredential


class LmProviderAzureOpenAI(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="azureopenai",
            name="Azure OpenAI",
            llmProvider=LlmProvider.AZUREOPENAI,
            keyPrefix="AZURE_OPENAI_",
            apiKeyDescription="Doc: https://learn.microsoft.com/en-us/answers/questions/1193991/how-to-get-the-value-of-openai-api-key",
            apiKeyHint="",
            supportUserDefinedModels=True,
        ))


    def getBaseEmbeddingsModel(self, aif_agent_uri: str) -> Embeddings:
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        azure_openai_api_type, azure_openai_api_key, azure_openai_api_version, azure_openai_api_endpoint_url = self._getAzureOpenAIInfo(baseLlmInfo)
        return AzureOpenAIEmbeddings(
            openai_api_type=azure_openai_api_type,
            openai_api_base=azure_openai_api_endpoint_url,
            openai_api_key=azure_openai_api_key,
            openai_api_version=azure_openai_api_version,
        )


    def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        azure_openai_api_type, azure_openai_api_key, azure_openai_api_version, azure_openai_api_endpoint_url = self._getAzureOpenAIInfo(baseLlmInfo)
        llm = AzureChatOpenAI(
            openai_api_type=azure_openai_api_type,
            openai_api_base=azure_openai_api_endpoint_url,
            openai_api_key=azure_openai_api_key,
            openai_api_version=azure_openai_api_version,
            temperature=0,
            streaming=True,
        )

        if not functions or len(functions) == 0:
            return llm
        else:
            tools = [create_tool(func) for func in functions]
            return llm.bind(functions=tools)


    def getLanguageProviderInfo(self) -> LmProviderEntity:
        properties: dict[str, LmProviderProperty] = {
            self.props.keyPrefix + "API_KEY": {
                "description": self.props.apiKeyDescription,
                "hint": self.props.apiKeyHint,
                "value": maskCredential(os.environ.get(self.props.keyPrefix + "API_KEY")),
                "isCredential": True,
            },
            self.props.keyPrefix + "API_BASE": {
                "description": "In the Azure portal under your Azure OpenAI resource",
                "hint": "[azure-openai-res-name][res-id].openai.azure.com",
                "value": maskCredential(os.environ.get(self.props.keyPrefix + "API_BASE")),
                "isCredential": True,
            },
            self.props.keyPrefix + "API_VERSION": {
                "description": "Doc: https://learn.microsoft.com/en-us/azure/ai-services/openai/api-version-deprecation#latest-preview-api-releases",
                "hint": "2024-07-01-preview",
                "value": os.environ.get(self.props.keyPrefix + "API_VERSION"),
                "isCredential": False,
            },
        }

        models = self._getModelsFromIndexes()

        return LmProviderEntity(
            lmProviderId=self.getId(),
            name=self.getName(),
            properties=properties,
            weight=os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT"),
            supportUserDefinedModels=self.props.supportUserDefinedModels,
            models=models,
            status=self._getStatus(),
        )

    def updateLmProvider(self, request: UpdateLmProviderRequest):
        super().updateLmProvider(request)

        dotenv_file = dotenv.find_dotenv()
        self._updateLmProviderIndexes(dotenv_file, request)

        if request.properties:
            if (self.props.keyPrefix + "API_BASE") in request.properties:
                self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "API_BASE", request.properties[self.props.keyPrefix + "API_BASE"])
            if (self.props.keyPrefix + "API_VERSION") in request.properties:
                self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "API_VERSION", request.properties[self.props.keyPrefix + "API_VERSION"])


    def _getAzureOpenAIInfo(self, baseLlmInfo: BaseLlmInfo):
        azure_openai_api_type = "azure"
        azure_openai_api_key = os.environ.get(self.props.keyPrefix + "API_KEY")
        azure_openai_api_version = baseLlmInfo.api_version if baseLlmInfo.api_version else os.environ.get(self.props.keyPrefix + "API_VERSION")
        azure_openai_api_base = os.environ.get(self.props.keyPrefix + "API_BASE")
        azure_openai_api_endpoint_url = f"https://{azure_openai_api_base}/openai/deployments/{baseLlmInfo.model_name}/"
        return azure_openai_api_type, azure_openai_api_key, azure_openai_api_version, azure_openai_api_endpoint_url
