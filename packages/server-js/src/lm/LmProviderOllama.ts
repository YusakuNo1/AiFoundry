import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { AifUtils, types } from 'aifoundry-vscode-shared';
import DatabaseManager from '../database/DatabaseManager';
import LmBaseProvider from './LmBaseProvider';
import { HttpException } from '../exceptions';
import OllamaUtils from "../utils/OllamaUtils";
import { ModelDef } from '../config/model_info/types';
import OllamaModels from "../config/model_info/ollama_models";

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
        const modelMap: Record<string, types.api.LmProviderBaseModelInfo> = {};
        const models = (OllamaModels as ModelDef).models;
        for (const model of models) {
            const modelInfo: types.api.LmProviderBaseModelInfo = {
                uri: AifUtils.createAifUri(AifUtils.AifUriCategory.Models, model.title),
                name: model.title,
                providerId: LmProviderOllama.ID,
                types: OllamaUtils.convertTagToLmFeature(model.tags),
                selected: false,
                isUserDefined: false,
                tags: model.tags,
            }
            modelMap[model.title] = modelInfo;
        }

        super(databaseManager, {
            id: LmProviderOllama.ID,
            name: "Ollama",
            description: null,
            weight: 10,
            keyPrefix: "OLLAMA_",
            apiKeyDescription: null,
            apiKeyHint: null,
            supportUserDefinedModels: false,
            modelMap,
        });
    }

    public async isHealthy(): Promise<boolean> {
        return OllamaUtils.isHealthy();
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
