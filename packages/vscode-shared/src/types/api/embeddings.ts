import type { EmbeddingMetadata } from "../database/EmbeddingMetadata";

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingMetadata[];
};

export type CreateOrUpdateEmbeddingsResponse = {
	assetId: string,
	name: string,
};
