import type { EmbeddingEntity } from "../database/EmbeddingEntity";

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingEntity[];
};

export type CreateOrUpdateEmbeddingsResponse = {
	id: string,
	name: string,
};

export type DeleteEmbeddingResponse = {
	id: string,
}
