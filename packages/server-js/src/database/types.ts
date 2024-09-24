namespace DatabaseTypes {
    export type lmProviderInfo = {
        defaultWeight: number;
        selectedEmbeddingModels: string[];
        selectedVisionModels: string[];
        selectedToolsModels: string[];
    }

    export type lmProviderCredentials = {
    }

    export type lmProviderAzureOpenAICredentials = lmProviderCredentials & {
        apiKey: string;
        baseUrl: string;
    }

    export type lmProviderOpenAICredentials = lmProviderCredentials & {
        apiKey: string;
    }
}

export default DatabaseTypes;
