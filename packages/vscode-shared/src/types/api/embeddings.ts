import type { EmbeddingMetadata } from "../database/embeddings";

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingMetadata[];
};

export type CreateOrUpdateEmbeddingsResponse = {
	asset_id: string,
	name: string,
};
