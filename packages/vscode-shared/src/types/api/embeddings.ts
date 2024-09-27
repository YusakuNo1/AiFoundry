import type { EmbeddingMetadata } from "../database/EmbeddingMetadata";

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingMetadata[];
};

export type CreateOrUpdateEmbeddingsResponse = {
	asset_id: string,
	name: string,
};
