import os, dotenv
from typing import List, Callable
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from langchain_community.chat_models import ChatOllama
from langchain_community.embeddings import OllamaEmbeddings
from lib.ollama_functions import OllamaFunctions
from aif_types.languagemodels import LmProviderEntity, UpdateLmProviderRequest, LmProviderProperty, LmProviderBaseModelInfo
from aif_types.llm import LlmProvider
from llm.lm_base_provider import LmBaseProvider, LmBaseProviderProps
from llm.llm_tools_utils import create_tool
from llm.llm_uri_utils import BaseLlmInfo
from .model_info.ollama_utils import download_model, get_local_model_map, get_host, health_check
from utils.file_utils import read_json_file


class LmProviderOllama(LmBaseProvider):
    def __init__(self):
        super().__init__(LmBaseProviderProps(
            id="ollama",
            name="Ollama",
            llmProvider=LlmProvider.OLLAMA,
            jsonFileName="model_info/ollama_models.json",
            keyPrefix="OLLAMA_",
        ))

    def isHealthy(self) -> bool:
        return health_check()    


    def getBaseEmbeddingsModel(self, aif_agent_uri: str) -> Embeddings:
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        self._checkLocalModel(baseLlmInfo)
        return OllamaEmbeddings(model=baseLlmInfo.model_name, base_url=get_host())


    def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        self._checkLocalModel(baseLlmInfo)

        if not functions or len(functions) == 0:
            return ChatOllama(model=baseLlmInfo.model_name, base_url=get_host())
        else:
            llm = OllamaFunctions(model=baseLlmInfo.model_name, temperature=0, base_url=get_host())
            tools = [create_tool(func) for func in functions]
            return llm.bind_tools(tools=tools)


    def getLanguageProviderInfo(self) -> LmProviderEntity:
        properties: dict[str, LmProviderProperty] = {
        }

        selectedModels = self._getModelNames(self.props.keyPrefix + "SELECTED_MODELS")
        modelCatalogItems = read_json_file(os.path.dirname(__file__), self.props.jsonFileName)
        models: List[LmProviderBaseModelInfo] = []
        for modelCatalogItem in modelCatalogItems:
            models.append(LmProviderBaseModelInfo(
                id=modelCatalogItem["title"],
                selected=modelCatalogItem["title"] in selectedModels,
                tags=modelCatalogItem["tags"],
            ))

        return LmProviderEntity(
            lmProviderId=self.getId(),
            name=self.getName(),
            properties=properties,
            weight=os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT"),
            models=models,
            status=self._getStatus(),
        )


    def updateLmProvider(self, request: UpdateLmProviderRequest):
        dotenv_file = dotenv.find_dotenv()
        self._updateLmProviderStandardFields(dotenv_file, request, self.props.keyPrefix)


    def _checkLocalModel(self, baseLlmInfo: BaseLlmInfo):
        def _get_local_model_map():
            try:
                return get_local_model_map()
            except Exception:
                return {}

        local_model_map = _get_local_model_map()
        if baseLlmInfo.model_name not in local_model_map:
            # Try to download model and retry
            download_model(baseLlmInfo.model_name)

            local_model_map = _get_local_model_map()
            if baseLlmInfo.model_name not in local_model_map:
                raise Exception("Model not downloaded")
