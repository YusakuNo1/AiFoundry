import os
from typing import List, Callable
from urllib.parse import urlparse
import dotenv
from pydantic import BaseModel
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.embeddings.embeddings import Embeddings
from aif_types.languagemodels import LanguageModelInfo, LmProviderBaseModelInfo, LmProviderInfo, LmProviderProperty, UpdateLmProviderRequest
from aif_types.llm import LlmFeature, LlmProvider
from llm.i_lm_provider import ILmProvider
from llm.llm_tools_utils import create_tool
from llm.llm_uri_utils import BaseLlmInfo, getUriParams
from utils.credential_utils import maskCredential
from utils.file_utils import read_json_file
from utils.json_utils import convertListToDict
from consts import DEFAULT_MODEL_WEIGHT


class LmBaseProviderProps(BaseModel):
    id: str
    name: str
    description: str | None = None          # Shown in the provider configuration page
    llmProvider: LlmProvider                # Maybe it can be deprecated?
    jsonFileName: str | None = None
    keyPrefix: str                          # Prefix for the provider, e.g. "OPENAI_"
    apiKeyDescription: str | None = None    # Description for the API key
    apiKeyHint: str | None = None           # Hint for the API key
    supportUserDefinedModels: bool = False  # Whether the provider supports user-defined models


class LmBaseProvider(ILmProvider):
    def __init__(self, props: LmBaseProviderProps):
        self.props = props

    def getId(self) -> str:
        return self.props.id

    def getName(self) -> str:
        return self.props.name

    def isHealthy(self) -> bool:
        key = os.environ.get(self.props.keyPrefix + "API_KEY")
        return key is not None and len(key) > 0

    def canHandle(self, aif_uri: str):
        return aif_uri.startswith(f"{self.getId()}://")

    def listLanguageModels(self, feature: LlmFeature = LlmFeature.ALL) -> List[LanguageModelInfo]:
        if self.props.jsonFileName:
            return self._listLanguageModelsFromFile(feature)
        else:
            return self._listLanguageModelsFromIndexes(feature)

    def _listLanguageModelsFromFile(self, feature: LlmFeature = LlmFeature.ALL) -> List[LanguageModelInfo]:
        modelCatalogItems = read_json_file(os.path.dirname(__file__), self.props.jsonFileName)
        modelCatalogItemDict = convertListToDict(modelCatalogItems, "title")

        default_weight = os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT")
        modelInfoList: List[LanguageModelInfo] = []
        models_str = os.environ.get(self.props.keyPrefix + "SELECTED_MODELS")
        if models_str is not None and len(models_str) > 0:
            model_names = models_str.split(",")
            for model_name in model_names:
                if model_name not in modelCatalogItemDict:
                    continue

                modelCatalogItem = modelCatalogItemDict[model_name]
                modelCatalogItemTags = modelCatalogItem["tags"]

                if feature == LlmFeature.VISION and LlmFeature.VISION.value not in modelCatalogItemTags:
                    continue

                if feature == LlmFeature.EMBEDDING and LlmFeature.EMBEDDING.value not in modelCatalogItemTags:
                    continue

                if feature == LlmFeature.TOOLS and LlmFeature.TOOLS.value not in modelCatalogItemTags:
                    continue

                if feature == LlmFeature.CONVERSATIONAL and LlmFeature.EMBEDDING.value in modelCatalogItemTags:
                    # Non-embedding models are conversational
                    continue

                modelInfoList.append(LanguageModelInfo(
                    provider=self.props.llmProvider,
                    basemodel_uri=f"{self.getId()}://{model_name}",
                    name=model_name,
                    ready=True,
                    weight=default_weight,
                ))
        return modelInfoList
    
    def _listLanguageModelsFromIndexes(self, feature: LlmFeature = LlmFeature.ALL) -> List[LanguageModelInfo]:
        modelIndexesForEmbeddingTag = self._getModelTagIndexes(self.props.keyPrefix + "EMBEDDING_MODEL_INDEXES")
        modelIndexesForVisionTag = self._getModelTagIndexes(self.props.keyPrefix + "VISION_MODEL_INDEXES")
        modelIndexesForToolsTag = self._getModelTagIndexes(self.props.keyPrefix + "TOOLS_MODEL_INDEXES")

        default_weight = os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT")
        modelInfoList: List[LanguageModelInfo] = []
        embedding_models_str = os.environ.get(self.props.keyPrefix + "SELECTED_MODELS")
        if embedding_models_str is not None and len(embedding_models_str) > 0:
            embedding_models_names = embedding_models_str.split(",")
            for index, model_name in enumerate(embedding_models_names):
                if feature == LlmFeature.EMBEDDING and index not in modelIndexesForEmbeddingTag:
                    continue

                if feature == LlmFeature.VISION and index not in modelIndexesForVisionTag:
                    continue

                if feature == LlmFeature.TOOLS and index not in modelIndexesForToolsTag:
                    continue

                if feature == LlmFeature.CONVERSATIONAL and index in modelIndexesForEmbeddingTag:
                    # Non-embedding models are conversational
                    continue

                modelInfoList.append(LanguageModelInfo(
                    provider=self.props.llmProvider,
                    basemodel_uri=f"{self.getId()}://{model_name}",
                    name=model_name,
                    ready=True,
                    weight=default_weight,
                ))
        return modelInfoList


    def getBaseEmbeddingsModel(self, aif_agent_uri: str) -> Embeddings:
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        apiKey = os.environ.get(self.props.keyPrefix + "API_KEY")
        return self._getBaseEmbeddingsModel(baseLlmInfo.model_name, apiKey=apiKey)
    
    def _getBaseEmbeddingsModel(self, modelName: str, apiKey: str) -> Embeddings:
        raise NotImplementedError("Subclasses must implement this method")


    def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
        baseLlmInfo = self._parse_llm_uri(aif_agent_uri)
        api_key = os.environ.get(self.props.keyPrefix + "API_KEY")
        llm = self._getBaseLanguageModel(baseLlmInfo.model_name, api_key)

        if not functions or len(functions) == 0:
            return llm
        else:
            tools = [create_tool(func) for func in functions]
            return llm.bind(functions=tools)
        
    def _getBaseLanguageModel(self, modelName: str, apiKey: str) -> BaseLanguageModel:
        raise NotImplementedError("Subclasses must implement this method")


    def _getStatus(self) -> str:
        return "available" if self.isHealthy() else "unavailable"


    def getLanguageProviderInfo(self) -> LmProviderInfo:
        properties: dict[str, LmProviderProperty] = {
            self.props.keyPrefix + "API_KEY": {
                "description": self.props.apiKeyDescription,
                "hint": self.props.apiKeyHint,
                "value": maskCredential(os.environ.get(self.props.keyPrefix + "API_KEY")),
                "isCredential": True,
            },
        }

        models = self._getModelsFromFile() if self.props.jsonFileName else self._getModelsFromIndexes()
        weight = os.environ.get(self.props.keyPrefix + "MODELS_DEFAULT_WEIGHT")

        return LmProviderInfo(
            lmProviderId=self.getId(),
            name=self.getName(),
            properties=properties,
            weight= weight if weight else DEFAULT_MODEL_WEIGHT,
            models=models,
            supportUserDefinedModels=self.props.supportUserDefinedModels,
            status=self._getStatus(),
        )

    def _getModelsFromFile(self) -> LmProviderInfo:
        models: List[LmProviderBaseModelInfo] = []
        selectedModels = self._getModelNames(self.props.keyPrefix + "SELECTED_MODELS")
        modelCatalogItems = read_json_file(os.path.dirname(__file__), self.props.jsonFileName)
        for modelCatalogItem in modelCatalogItems:
            models.append(LmProviderBaseModelInfo(
                id=modelCatalogItem["title"],
                selected=modelCatalogItem["title"] in selectedModels,
                tags=modelCatalogItem["tags"],
            ))
        return models

    def _getModelsFromIndexes(self) -> LmProviderInfo:
        modelNames = self._getModelNames(self.props.keyPrefix + "SELECTED_MODELS")
        modelIndexesForEmbeddingTag = self._getModelTagIndexes(self.props.keyPrefix + "EMBEDDING_MODEL_INDEXES")
        modelIndexesForVisionTag = self._getModelTagIndexes(self.props.keyPrefix + "VISION_MODEL_INDEXES")
        modelIndexesForToolsTag = self._getModelTagIndexes(self.props.keyPrefix + "TOOLS_MODEL_INDEXES")

        models: List[LmProviderBaseModelInfo] = []
        for index, model in enumerate(modelNames):
            tags = []
            if index in modelIndexesForEmbeddingTag:
                tags.append(LlmFeature.EMBEDDING)
            if index in modelIndexesForVisionTag:
                tags.append(LlmFeature.VISION)
            if index in modelIndexesForToolsTag:
                tags.append(LlmFeature.TOOLS)
            models.append(LmProviderBaseModelInfo(
                id=model,
                selected=True,
                isUserDefined=True,
                tags=tags,
            ))
        return models


    def updateLmProvider(self, request: UpdateLmProviderRequest):
        dotenv_file = dotenv.find_dotenv()
        self._updateLmProviderStandardFields(dotenv_file, request, self.props.keyPrefix)

        if request.properties:
            if (self.props.keyPrefix + "API_KEY") in request.properties:
                self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "API_KEY", request.properties[self.props.keyPrefix + "API_KEY"])


    def _parse_llm_uri(self, aif_uri: str) -> BaseLlmInfo:
        parsed_aif_model_uri = urlparse(aif_uri)
        uriParams = getUriParams(parsed_aif_model_uri)
        return BaseLlmInfo(
            provider=self.props.llmProvider,
            model_name=parsed_aif_model_uri.netloc,
            api_version=uriParams.get("api-version"),
        )


    def _updateLmProviderIndexes(self, dotenv_file: str, request: UpdateLmProviderRequest):
        if request.embeddingModelIndexes is not None:
            self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "EMBEDDING_MODEL_INDEXES", self._filterAndCombineIndexes(request, request.embeddingModelIndexes))
        if request.visionModelIndexes is not None:
            self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "VISION_MODEL_INDEXES", self._filterAndCombineIndexes(request, request.visionModelIndexes))
        if request.toolsModelIndexes is not None:
            self._updateLmProviderField(dotenv_file, self.props.keyPrefix + "TOOLS_MODEL_INDEXES", self._filterAndCombineIndexes(request, request.toolsModelIndexes))


    def _filterAndCombineIndexes(self, request: UpdateLmProviderRequest, indexes: List[int]) -> str:
        # Filter request.embeddingModelIndexes, if it's equal or greater than the number of models, ignore it
        _indexeStrings = []
        for index in indexes:
            if index < len(request.selectedModels):
                _indexeStrings.append(str(index))
        return ",".join(_indexeStrings)
