import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { AifUtils, api, LmProviderPropertyUtils } from 'aifoundry-vscode-shared';
import LmBaseProvider, { GetInitInfoResponse } from './LmBaseProvider';
import { HttpException } from '../exceptions';
import GoogleGeminiModels from "../config/model_info/googlegemini_models";
import LmProviderUtils from './LmProviderUtils';


enum CredPropKey {
    ApiKey = "ApiKey",
}

class LmProviderGoogleGemini extends LmBaseProvider {
    public static readonly ID = "googlegemini";

    protected async _getInitInfo(): Promise<GetInitInfoResponse> {
        const properties: Record<string, api.LmProviderProperty> = {
            [CredPropKey.ApiKey]: {
                description: "Google Gemini API key",
                hint: "",
                valueUri: null,
                isSecret: true,
            },
        }

        const modelMap = LmProviderUtils.createModelMap(GoogleGeminiModels, LmProviderGoogleGemini.ID);

        return {
            id: LmProviderGoogleGemini.ID,
            name: "Google Gemini",
            description: "",
            weight: 100,
            supportUserDefinedModels: false,
            modelMap,
            properties,
        };
    }

    public async isHealthy(): Promise<boolean> {
        const apiKey = this._databaseManager.getLmProviderInfo(this.id)?.properties[CredPropKey.ApiKey]?.valueUri as string;
        return !!apiKey && apiKey.length > 0;
    }

    public async getBaseEmbeddingsModel(aifUri: string): Promise<Embeddings> {
        const { apiKey, modelName } = await this._getCredentials(aifUri);
        return new GoogleGenerativeAIEmbeddings({
            apiKey,
            model: modelName,
            maxRetries: 1,
        });
    }

    public async getBaseLanguageModel(aifUri: string): Promise<BaseChatModel> {
        const { apiKey, modelName } = await this._getCredentials(aifUri);
        return new ChatGoogleGenerativeAI({
            apiKey,
            model: modelName,
        });
    }

    private async _getCredentials(aifUri: string): Promise<{
        apiKey: string,
        modelName: string,
    }> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        const apiKey = await LmProviderPropertyUtils.getPropertyValue(this._info.properties[CredPropKey.ApiKey]);

        if (!apiKey) {
            throw new HttpException(400, "Invalid provider properties");
        }

        return {
            apiKey,
            modelName: lmInfo.modelName,
        };
    }
}

export default LmProviderGoogleGemini;
