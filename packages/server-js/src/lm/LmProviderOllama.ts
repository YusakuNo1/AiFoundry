import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import DatabaseManager from '../database/DatabaseManager';
import LmBaseProvider from './LmBaseProvider';
import { HttpException } from '../exceptions';
import OllamaUtils from "../utils/OllamaUtils";

class LmProviderOllama extends LmBaseProvider {
    protected _getBaseEmbeddingsModel(modelName: string, apiKey: string, properties: Record<string, string>): Embeddings {
        return new OllamaEmbeddings({
            model: modelName,
        });
    }

    public getBaseLanguageModel(aifUri: string): BaseChatModel {
        const lmInfo = this._parseLmUri(aifUri);
        if (!lmInfo) {
            throw new HttpException(400, "Invalid uri not found");
        }

        // TODO: for function calling
        // functions: Function[] = []

        return this._getBaseChatModel(lmInfo.modelName, "", {});
    }

    protected _getBaseChatModel(modelName: string, apiKey: string, properties: Record<string, string>): BaseChatModel {
        return new ChatOllama({
            model: modelName,
        });
    }
    public static readonly ID = "ollama";

    constructor(databaseManager: DatabaseManager) {
        super(databaseManager, {
            id: LmProviderOllama.ID,
            name: "Ollama",
            description: null,
            weight: 10,
            jsonFileName: "model_info/ollama_models.json",
            keyPrefix: "OLLAMA_",
            apiKeyDescription: null,
            apiKeyHint: null,
            supportUserDefinedModels: false,
        });
    }

    public get isHealthy(): boolean {
        // return OllamaUtils.isHealthy();
        // TODO: fix it
        return true;
    }

    public getBaseEmbeddingsModel(aifUri: string): Embeddings {
        const lmInfo = this._parseLmUri(aifUri);
        if (!lmInfo) {
            throw new HttpException(400, "Invalid uri or credentials not found");
        }

        const llm = new OllamaEmbeddings({
            model: lmInfo.modelName,
        });

        return llm;
    }
}

export default LmProviderOllama;
