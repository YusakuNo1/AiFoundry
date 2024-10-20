import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { AifUtils, api, LmProviderPropertyUtils } from 'aifoundry-vscode-shared';
import LmBaseProvider, { GetInitInfoResponse } from './LmBaseProvider';
import { HttpException } from '../exceptions';
import OpenAIModels from "../config/model_info/openai_models";
import LmProviderUtils from './LmProviderUtils';


enum CredPropKey {
    ApiKey = "ApiKey",
}

class LmProviderOpenAI extends LmBaseProvider {
    public static readonly ID = "openai";

    protected async _getInitInfo(): Promise<GetInitInfoResponse> {
        const properties: Record<string, api.LmProviderProperty> = {
            [CredPropKey.ApiKey]: {
                description: "OpenAI API key",
                hint: "",
                valueUri: null,
                isSecret: true,
            },
        }

        const modelMap = LmProviderUtils.createModelMap(OpenAIModels, LmProviderOpenAI.ID);

        return {
            id: LmProviderOpenAI.ID,
            name: "OpenAI",
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
        const { openAIApiKey } = await this._getCredentials(aifUri);
        return new OpenAIEmbeddings({
            openAIApiKey,
            maxRetries: 1,
        });
    }

    public async getBaseLanguageModel(aifUri: string): Promise<BaseChatModel> {
        const { openAIApiKey } = await this._getCredentials(aifUri);
        return new ChatOpenAI({
            openAIApiKey,
        });
    }

    private async _getCredentials(aifUri: string): Promise<{
        openAIApiKey: string,
    }> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        const openAIApiKey = await LmProviderPropertyUtils.getPropertyValue(this._info.properties[CredPropKey.ApiKey]);

        if (!openAIApiKey) {
            throw new HttpException(400, "Invalid provider properties");
        }

        return {
            openAIApiKey,
        };
    }
}

export default LmProviderOpenAI;
