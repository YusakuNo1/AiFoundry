import {
	LmProviderInfo as DatabaseLmProviderInfo,
	LmProviderBaseModelInfo as DatabaseLmProviderBaseModelInfo,
	LmProviderBaseModelInfoOllamaExtras,
	LmProviderProperty as DatabaseLmProviderProperty,
} from "../database/LmProviderInfo";

export const LlmFeatures = ["all", "conversational", "vision", "embedding", "tools"] as const;
export type LlmFeature = typeof LlmFeatures[number];

export type LmProviderBaseModelInfo = Omit<DatabaseLmProviderBaseModelInfo, "version" | "entityName">;
export type LmProviderBaseModelInfoOllama = LmProviderBaseModelInfo & LmProviderBaseModelInfoOllamaExtras;

export type ListLanguageModelsResponse = {
	basemodels: LmProviderBaseModelInfo[];
};

export type DeleteLanguageModelResponse = {
	uri: string;
}

export type LmProviderProperty = Omit<DatabaseLmProviderProperty, "version" | "entityName">;

export type LmProviderInfoResponse = Omit<DatabaseLmProviderInfo, "version" | "entityName"> & {
	status: string,
}

export type SetupLmProviderRequest = {
	id: string,
};

export type ListLmProvidersResponse = {
	providers: LmProviderInfoResponse[];
};

export type UpdateLmProviderInfoRequest = Pick<DatabaseLmProviderInfo, "id"> & Partial<Omit<DatabaseLmProviderInfo, "id" | "modelMap" | "properties">> & {
	properties?: Record<string, string>,
};

export type UpdateLmProviderModelRequest = {
	id: string,
	modelUri: string,
	selected: boolean,
};

export type UpdateLmProviderResponse = Omit<LmProviderInfoResponse, "status">;
