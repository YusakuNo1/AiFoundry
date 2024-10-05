import type { EmbeddingMetadata } from "../database/EmbeddingMetadata";

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingMetadata[];
};

export type CreateOrUpdateEmbeddingsResponse = {
	id: string,
	name: string,
};

export type DeleteEmbeddingResponse = {
	id: string,
}
