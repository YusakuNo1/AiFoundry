import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { AifUtils, types } from 'aifoundry-vscode-shared';
import LmBaseProvider, { GetInitInfoResponse } from './LmBaseProvider';
import { HttpException } from '../exceptions';
import OllamaUtils from "../utils/OllamaUtils";
import { ModelDef } from '../config/model_info/types';
import OllamaModels from "../config/model_info/ollama_models";

class LmProviderOllama extends LmBaseProvider {
    public static readonly ID = "ollama";

    protected async _getInitInfo(): Promise<GetInitInfoResponse> {
        const modelMap: Record<string, types.api.LmProviderBaseModelInfo> = {};
        const models = (OllamaModels as ModelDef).models;
        for (const model of models) {
            const modelInfo: types.api.LmProviderBaseModelInfoOllama = {
                uri: AifUtils.createAifUri(LmProviderOllama.ID, AifUtils.AifUriCategory.Models, model.title),
                name: model.title,
                providerId: LmProviderOllama.ID,
                features: OllamaUtils.convertTagToLmFeature(model.tags),
                selected: false,
                isUserDefined: false,
                isDownloaded: false,    // setup in _updateLmProviderRuntimeInfo
            }
            modelMap[model.title] = modelInfo;
        }

        return {
            id: LmProviderOllama.ID,
            name: "Ollama",
            description: "",
            weight: 10,
            supportUserDefinedModels: false,
            modelMap,
            properties: {},
        }
    }

    protected async _updateLmProviderRuntimeInfo(lmProviderInfo: types.database.LmProviderInfo): Promise<void> {
        try {
            const listModels = await OllamaUtils.listDownloadedModels();
            const listModelNames = listModels.map((model) => model.split(":")[0]);   // format is "model:version"
    
            for (const modelName of Object.keys(lmProviderInfo.modelMap)) {
                (lmProviderInfo.modelMap[modelName] as types.database.LmProviderBaseModelInfoOllama).isDownloaded = listModelNames.includes(modelName);
            }    
        } catch (error) {
            console.error(`Failed to update Ollama models: ${error}`);
        }
    }

    public async isHealthy(): Promise<boolean> {
        return OllamaUtils.isHealthy();
    }

    public listLanguageModels(feature: types.api.LlmFeature): types.api.LmProviderBaseModelInfo[] {
        return Object.values(this._info.modelMap).filter((_model: types.database.LmProviderBaseModelInfo) => {
            const model = _model as types.database.LmProviderBaseModelInfoOllama;
            return model.selected && model.isDownloaded && (feature === "all" || model.features.includes(feature));
        });
    }

    public async getBaseEmbeddingsModel(aifUri: string): Promise<Embeddings> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        const llm = new OllamaEmbeddings({
            model: lmInfo.modelName,
        });

        return llm;
    }

    public async getBaseLanguageModel(aifUri: string): Promise<BaseChatModel> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        // TODO: for function calling
        // functions: Function[] = []

        return new ChatOllama({
            model: lmInfo.modelName,
        });
    }
}

export default LmProviderOllama;
