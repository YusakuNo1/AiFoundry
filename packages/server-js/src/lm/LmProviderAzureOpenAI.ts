import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import { types } from 'aifoundry-vscode-shared';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import DatabaseManager from '../database/DatabaseManager';
import LmBaseProvider from './LmBaseProvider';
import { HttpException } from '../exceptions';

const DEFAULT_API_VERSION = "2024-07-01-preview";
type CredentialPropertyKeys = "API_BASE" | "API_VERSION";

class LmProviderAzureOpenAI extends LmBaseProvider {
    public static readonly ID = "azureopenai";

    constructor(databaseManager: DatabaseManager) {
        super(databaseManager, {
            id: LmProviderAzureOpenAI.ID,
            name: "Azure OpenAI",
            description: null,
            defaultWeight: 100,
            // llmProvider: "AZUREOPENAI",
            jsonFileName: null,
            keyPrefix: "AZURE_OPENAI_",
            apiKeyDescription: "Doc: https://learn.microsoft.com/en-us/answers/questions/1193991/how-to-get-the-value-of-openai-api-key",
            apiKeyHint: "",
            supportUserDefinedModels: true,
        });
    }

    public get isHealthy(): boolean {
        const credentials = this._databaseManager.getLmProviderCredentials(this.id);
        return !!credentials && credentials.apiKey.length > 0;
    }

    protected _getBaseEmbeddingsModel(deploymentName: string, apiKey: string, properties: Record<string, string>): Embeddings {
        return new AzureOpenAIEmbeddings({
            azureOpenAIBasePath: _updateAzureOpenAIBasePath(properties.API_BASE),
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiKey: apiKey,
            azureOpenAIApiVersion: properties.API_VERSION ?? DEFAULT_API_VERSION,
            maxRetries: 1,
        });
    }

    protected _getBaseChatModel(deploymentName: string, apiKey: string, properties: Record<string, string>, temperature: number = 0): BaseChatModel {
        return new AzureChatOpenAI({
            azureOpenAIBasePath: _updateAzureOpenAIBasePath(properties.API_BASE),
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiKey: apiKey,
            azureOpenAIApiVersion: properties.API_VERSION ?? DEFAULT_API_VERSION,
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
