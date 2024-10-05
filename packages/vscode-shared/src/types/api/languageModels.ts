import {
	LmProviderInfo as DatabaseLmProviderInfo,
	LmProviderBaseModelInfo as DatabaseLmProviderBaseModelInfo,
	LmProviderProperty as DatabaseLmProviderProperty,
} from "../database/LmProviderInfo";

export const LlmFeatures = ["all", "conversational", "vision", "embedding", "tools"] as const;
export type LlmFeature = typeof LlmFeatures[number];

export type LmProviderBaseModelInfo = Omit<DatabaseLmProviderBaseModelInfo, "version" | "entityName">;
export type ListLanguageModelsResponse = {
	basemodels: LmProviderBaseModelInfo[];
};

export type LmProviderProperty = Omit<DatabaseLmProviderProperty, "version" | "entityName">;

export type LmProviderInfoResponse = Omit<DatabaseLmProviderInfo, "version" | "entityName"> & {
	status: string,
}

export type ListLmProvidersResponse = {
	providers: LmProviderInfoResponse[];
};

export type UpdateLmProviderRequest = {
	lmProviderId: string,
	properties: Record<string, string> | null,
	weight: number | null,
    selectedModels: string[] | null,
	embeddingModelIndexes: number[] | null,
	visionModelIndexes: number[] | null,
	toolsModelIndexes: number[] | null,
};

export type UpdateLmProviderResponse = LmProviderInfoResponse;
