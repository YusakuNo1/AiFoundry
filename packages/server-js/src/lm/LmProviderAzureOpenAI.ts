import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import { types } from 'aifoundry-vscode-shared';
import LmBaseProvider, { GetInitInfoResponse } from './LmBaseProvider';

const DEFAULT_API_VERSION = "2024-07-01-preview";
enum CredPropKey {
    ApiBase = "ApiBase",
    ApiVerion = "ApiVersion",
    ApiKey = "ApiKey",
}

class LmProviderAzureOpenAI extends LmBaseProvider {
    public static readonly ID = "azureopenai";

    protected _getInitInfo(): GetInitInfoResponse {
        const properties: Record<string, types.api.LmProviderProperty> = {
            [CredPropKey.ApiBase]: {
                description: "Azure OpenAI API base path",
                hint: "",
                valueUri: null,
            },
            [CredPropKey.ApiVerion]: {
                description: "Azure OpenAI API version",
                hint: "",
                valueUri: null,
            },
            [CredPropKey.ApiKey]: {
                description: "Azure OpenAI API key",
                hint: "",
                valueUri: null,
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
        return [];
    }

    protected _getBaseEmbeddingsModel(deploymentName: string, apiKey: string, properties: Record<string, string>): Embeddings {
        return new AzureOpenAIEmbeddings({
            azureOpenAIBasePath: _updateAzureOpenAIBasePath(properties[CredPropKey.ApiBase]),
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiKey: apiKey,
            azureOpenAIApiVersion: properties[CredPropKey.ApiVerion] ?? DEFAULT_API_VERSION,
            maxRetries: 1,
        });
    }

    protected _getBaseChatModel(deploymentName: string, apiKey: string, properties: Record<string, string>, temperature: number = 0): BaseChatModel {
        return new AzureChatOpenAI({
            azureOpenAIBasePath: _updateAzureOpenAIBasePath(properties[CredPropKey.ApiBase]),
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiKey: apiKey,
            azureOpenAIApiVersion: properties[CredPropKey.ApiVerion] ?? DEFAULT_API_VERSION,
            temperature,
        });
    }
}

function _updateAzureOpenAIBasePath(azureOpenAIBasePath: string): string {
    if (!azureOpenAIBasePath.startsWith("https://")) {
        azureOpenAIBasePath = `https://${azureOpenAIBasePath}`;
    }

    if (!azureOpenAIBasePath.includes("openai")) {
        azureOpenAIBasePath = `${azureOpenAIBasePath}/openai/deployments/`;
    }

    return azureOpenAIBasePath;
}

export default LmProviderAzureOpenAI;
