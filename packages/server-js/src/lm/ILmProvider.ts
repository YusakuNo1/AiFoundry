import { type Embeddings } from "@langchain/core/embeddings";
import { type BaseChatModel } from "@langchain/core/language_models/chat_models";
import { types } from 'aifoundry-vscode-shared';
import type DatabaseManager from '../database/DatabaseManager';

interface ILmProvider {
    get id(): string;
    get name(): string;
    get isHealthy(): boolean;
    canHandle(aifUri: string): boolean;
    listLanguageModels(feature: types.api.LlmFeature): types.api.LanguageModelInfo[];
    getBaseEmbeddingsModel(aif_agent_uri: string): Embeddings;
    getBaseLanguageModel(aif_agent_uri: string): BaseChatModel;
    registerProviderInfo(databaseManager: DatabaseManager): void;
    getLanguageProviderInfo(databaseManager: DatabaseManager): types.api.LmProviderInfo;
    // updateLmProvider(request: types.api.UpdateLmProviderRequest): void;


//     @abstractmethod
//     def updateLmProvider(self, request: UpdateLmProviderRequest):
//         """
//         Setup the language provider, this function can be ignored, for example, ignore for Ollama
//         """
//         pass
}

export default ILmProvider;
