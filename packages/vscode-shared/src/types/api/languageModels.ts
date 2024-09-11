export const LlmFeatures = ["all", "conversational", "vision", "embedding", "tools"] as const;
export type LlmFeature = typeof LlmFeatures[number];

export type LanguageModelInfo = {
	provider: string,
	basemodel_uri: string,
	name: string,
	ready: boolean,
	weight: number,
}

export type ListLanguageModelsResponse = {
	basemodels: LanguageModelInfo[];
};

export type LmProviderBaseModelInfo = {
    // For the models with no version, this is the model name or deployment name, otherwise it's <model-name>:<version>
	id: string,
	selected: boolean,
	// ONLY for Azure OpenAI currently, we allow the users to add deployment name + version, and they can delete it
	isUserDefined: boolean,
	tags: string[],
}

export type LmProviderProperty = {
	description: string,
	hint: string,
	value: string | null,
	isCredential: boolean,
}

export type LmProviderInfo = {
	lmProviderId: string,
	name: string,
	properties: Record<string, LmProviderProperty>,
	weight: number,
	supportUserDefinedModels: boolean,
    models: LmProviderBaseModelInfo[],
}

export type ListLmProvidersResponse = {
	providers: LmProviderInfo[];
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
