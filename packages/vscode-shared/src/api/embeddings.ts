import type { SplitterParams, UploadFileInfo } from "../misc/common";
import type { EmbeddingEntity as DatabaseEmbeddingEntity } from "../database/EmbeddingEntity";

export type EmbeddingEntity = Omit<DatabaseEmbeddingEntity, "ENTITY_NAME" | "version">;

export type ListEmbeddingsResponse = {
	embeddings: EmbeddingEntity[];
};

export type CreateEmbeddingRequest = {
	basemodelUri: string,
	files: UploadFileInfo[],
	name: string | undefined,
	description: string,
	splitterParams: SplitterParams | undefined,
};

export type UpdateEmbeddingRequest = Omit<CreateEmbeddingRequest, "basemodelUri" | "splitterParams" | "splitterParams" | "description"> &{
	id: string,
	description: string | undefined,
	searchTopK: number | undefined,
};

export type CreateOrUpdateEmbeddingsResponse = {
	id: string,
	name: string,
};

export type DeleteEmbeddingResponse = {
	id: string,
}
