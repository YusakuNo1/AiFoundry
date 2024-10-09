import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import { AifUtils, LmProviderPropertyUtils, types } from 'aifoundry-vscode-shared';
import LmBaseProvider, { GetInitInfoResponse } from './LmBaseProvider';
import { HttpException } from '../exceptions';

const DEFAULT_API_VERSION = "2024-07-01-preview";
enum CredPropKey {
    ApiBase = "ApiBase",
    ApiVerion = "ApiVersion",
    ApiKey = "ApiKey",
}

class LmProviderAzureOpenAI extends LmBaseProvider {
    public static readonly ID = "azureopenai";

    protected async _getInitInfo(): Promise<GetInitInfoResponse> {
        const properties: Record<string, types.api.LmProviderProperty> = {
            [CredPropKey.ApiBase]: {
                description: "Azure OpenAI API base path",
                hint: "",
                valueUri: null,
                isSecret: false,
            },
            [CredPropKey.ApiVerion]: {
                description: "Azure OpenAI API version",
                hint: "",
                valueUri: null,
                isSecret: false,
            },
            [CredPropKey.ApiKey]: {
                description: "Azure OpenAI API key",
                hint: "",
                valueUri: null,
                isSecret: true,
            },
        }

        return {
            id: LmProviderAzureOpenAI.ID,
            name: "Azure OpenAI",
            description: "",
            weight: 100,
            supportUserDefinedModels: true,
            modelMap: {},
            properties,
        };
    }

    public async isHealthy(): Promise<boolean> {
        const apiKey = this._databaseManager.getLmProviderInfo(this.id)?.properties[CredPropKey.ApiKey]?.valueUri as string;
        return !!apiKey && apiKey.length > 0;
    }

    public listLanguageModels(feature: types.api.LlmFeature): types.api.LmProviderBaseModelInfo[] {
        return Object.values(this._info.modelMap).filter((model) => model.selected && (feature === "all" || model.features.includes(feature)));
    }

    public async getBaseEmbeddingsModel(aifUri: string): Promise<Embeddings> {
        const { azureOpenAIBasePath, azureOpenAIApiKey, azureOpenAIApiVersion, azureOpenAIApiDeploymentName } = await this._getCredentials(aifUri);
        return new AzureOpenAIEmbeddings({
            azureOpenAIBasePath,
            azureOpenAIApiDeploymentName,
            azureOpenAIApiKey,
            azureOpenAIApiVersion,
            maxRetries: 1,
        });
    }

    public async getBaseLanguageModel(aifUri: string): Promise<BaseChatModel> {
        const { azureOpenAIBasePath, azureOpenAIApiKey, azureOpenAIApiVersion, azureOpenAIApiDeploymentName } = await this._getCredentials(aifUri);
        return new AzureChatOpenAI({
            azureOpenAIBasePath,
            azureOpenAIApiDeploymentName,
            azureOpenAIApiKey,
            azureOpenAIApiVersion,
        });
    }

    private async _getCredentials(aifUri: string): Promise<{
        azureOpenAIBasePath: string,
        azureOpenAIApiKey: string,
        azureOpenAIApiVersion: string,
        azureOpenAIApiDeploymentName: string,
    }> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        const azureOpenAIBasePath = await LmProviderPropertyUtils.getPropertyValue(this._info.properties[CredPropKey.ApiBase]);
        const azureOpenAIApiKey = await LmProviderPropertyUtils.getPropertyValue(this._info.properties[CredPropKey.ApiKey]);
        const azureOpenAIApiVersion = await LmProviderPropertyUtils.getPropertyValue(this._info.properties[CredPropKey.ApiVerion]) ?? DEFAULT_API_VERSION;
        const azureOpenAIApiDeploymentName = lmInfo.modelName;

        if (!azureOpenAIBasePath || !azureOpenAIApiKey || !azureOpenAIApiVersion || !azureOpenAIApiDeploymentName) {
            throw new HttpException(400, "Invalid provider properties");
        }

        return {
            azureOpenAIBasePath: _updateAzureOpenAIBasePath(azureOpenAIBasePath),
            azureOpenAIApiDeploymentName,
            azureOpenAIApiKey,
            azureOpenAIApiVersion,
        };
    }
}

function _updateAzureOpenAIBasePath(azureOpenAIBasePath: string): string {
    if (!azureOpenAIBasePath.startsWith("https://")) {
        azureOpenAIBasePath = `https://${azureOpenAIBasePath}`;
    }

    // Special patch for `cognitive.microsoft.com` domain base path
    if (azureOpenAIBasePath.includes("cognitive.microsoft.com") && !azureOpenAIBasePath.includes("openai")) {
        azureOpenAIBasePath = `${azureOpenAIBasePath}/openai/deployments/`;
    }

    return azureOpenAIBasePath;
}

export default LmProviderAzureOpenAI;
