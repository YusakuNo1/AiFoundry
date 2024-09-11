export type EmbeddingInfo = {
	id: string,
	name: string,
	vs_provider: string,
	basemodel_uri: string,
}

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingInfo[];
};

export type CreateOrUpdateEmbeddingsResponse = {
	asset_id: string,
	name: string,
};
