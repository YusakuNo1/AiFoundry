// import os, dotenv
// from typing import List, Callable
// from abc import ABCMeta, abstractmethod
// from langchain_core.language_models.base import BaseLanguageModel
// from langchain_core.embeddings.embeddings import Embeddings
// from aif_types.languagemodels import LanguageModelInfo, LmProviderInfo, UpdateLmProviderRequest
// from llm.llm_uri_utils import BaseLlmInfo
// from aif_types.llm import LlmFeature
// from aif_types.system import LmProviderStatus

import { types } from 'aifoundry-vscode-shared';
import { type Embeddings } from "@langchain/core/embeddings";

interface ILmProvider {
    get id(): string;
    get name(): string;
    get isHealthy(): boolean;
    getLmProviderStatus(): types.api.LmProviderInfo;
    canHandle(aifUri: string): boolean;
    listLanguageModels(feature: types.api.LlmFeature): types.api.LanguageModelInfo[];
    getBaseEmbeddingsModel(aif_agent_uri: string): Embeddings;
    // // getBaseLanguageModel(aif_agent_uri: string, functions: Callable[]): BaseLanguageModel;
    // getLanguageProviderInfo(): types.api.LmProviderInfo;
    // updateLmProvider(request: types.api.UpdateLmProviderRequest): void;





// class ILmProvider(metaclass=ABCMeta):
//     @abstractmethod
//     def getId(self) -> str:
//         """
//         Get the id of the provider
//         """
//         pass

//     @abstractmethod
//     def getName(self) -> str:
//         """
//         Get the name of the provider
//         """
//         pass

//     @abstractmethod
//     def isHealthy(self) -> bool:
//         """
//         Check if the provider is healthy
//         """
//         pass


//     @abstractmethod
//     def getLmProviderStatus(self) -> LmProviderStatus:
//         """
//         Get the status of language model providers
//         """
//         pass

//     @abstractmethod
//     def canHandle(self, aif_uri: str):
//         """
//         Check if the provider can handle the given uri
//         """
//         pass

//     @abstractmethod
//     def listLanguageModels(self, feature: LlmFeature = LlmFeature.ALL) -> List[LanguageModelInfo]:
//         """
//         List all the language models available for the provider
//         """
//         pass

//     @abstractmethod
//     def getBaseEmbeddingsModel(self, aif_agent_uri: str) -> Embeddings:
//         """
//         Get the base model for the given base model uri
//         """
//         pass

//     @abstractmethod
//     def getBaseLanguageModel(self, aif_agent_uri: str, functions: List[Callable] = []) -> BaseLanguageModel:
//         """
//         Get the base model for the given base model uri
//         """
//         pass

//     @abstractmethod
//     def getLanguageProviderInfo(self) -> LmProviderInfo:
//         """
//         Get the language provider info
//         """
//         pass

//     @abstractmethod
//     def updateLmProvider(self, request: UpdateLmProviderRequest):
//         """
//         Setup the language provider, this function can be ignored, for example, ignore for Ollama
//         """
//         pass


//     def _getModelNames(self, envVarName: str) -> List[str]:
//         value = os.environ.get(envVarName)
//         return value.split(",") if value else []

//     def _getModelTagIndexes(self, envVarName: str) -> List[int]:
//         value = os.environ.get(envVarName)
//         if not value:
//             return []
//         tokens = value.split(",")
//         if not tokens:
//             return []
//         return [int(token) for token in tokens]

//     def _updateLmProviderField(self, dotenv_file: str, key: str, value: str = None):
//         os.environ[key] = value
//         dotenv.set_key(dotenv_file, key, os.environ[key], quote_mode="never")

//     def _updateLmProviderStandardFields(self, dotenv_file: str, request: UpdateLmProviderRequest, prefix: str):
//         if request.weight is not None:
//             self._updateLmProviderField(dotenv_file, prefix + "MODELS_DEFAULT_WEIGHT", str(request.weight))
//         if request.selectedModels is not None:
//             # TODO: Verify that the selected models are valid

//             self._updateLmProviderField(dotenv_file, prefix + "SELECTED_MODELS", ",".join(request.selectedModels))

//         # if request.embeddingModels is not None:
//         #     self._updateLmProviderField(dotenv_file, prefix + "EMBEDDING", ",".join(request.embeddingModels))
//         # if request.conversationalModels is not None:
//         #     self._updateLmProviderField(dotenv_file, prefix + "CONVERSATIONAL", ",".join(request.conversationalModels))
//         # if request.visionModels is not None:
//         #     self._updateLmProviderField(dotenv_file, prefix + "VISION", ",".join(request.visionModels))
//         # if request.toolsModels is not None:
//         #     self._updateLmProviderField(dotenv_file, prefix + "TOOLS", ",".join(request.toolsModels))


}

export default ILmProvider;
