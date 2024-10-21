import {
	LmProviderEntity as DatabaseLmProviderInfo,
	LmProviderBaseModelInfo as DatabaseLmProviderBaseModelInfo,
	LmProviderBaseModelLocalInfo as DatabaseLmProviderBaseModelLocalInfo,
	LmProviderProperty as DatabaseLmProviderProperty,
} from "../database/LmProviderEntity";

export const LlmFeatures = ["all", "conversational", "vision", "embedding", "tools"] as const;
export type LlmFeature = typeof LlmFeatures[number];

export type LmProviderBaseModelInfo = DatabaseLmProviderBaseModelInfo;
export type LmProviderBaseModelLocalInfo = DatabaseLmProviderBaseModelLocalInfo;

export type ListLanguageModelsResponse = {
	basemodels: LmProviderBaseModelInfo[];
};

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
	selected: boolean,	// This option only applies to user-defined models, selected means added to the list, otherwise removed
};

export type UpdateLmProviderResponse = Omit<LmProviderInfoResponse, "status">;
