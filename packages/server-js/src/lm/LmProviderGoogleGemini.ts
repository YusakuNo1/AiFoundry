import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { AifUtils, LmProviderPropertyUtils, types } from 'aifoundry-vscode-shared';
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
        const properties: Record<string, types.api.LmProviderProperty> = {
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
        const { apiKey } = await this._getCredentials(aifUri);
        return new GoogleGenerativeAIEmbeddings({
            apiKey,
            maxRetries: 1,
        });
    }

    public async getBaseLanguageModel(aifUri: string): Promise<BaseChatModel> {
        const { apiKey } = await this._getCredentials(aifUri);
        return new ChatGoogleGenerativeAI({
            apiKey,
        });
    }

    private async _getCredentials(aifUri: string): Promise<{
        apiKey: string,
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
        };
    }
}

export default LmProviderGoogleGemini;
