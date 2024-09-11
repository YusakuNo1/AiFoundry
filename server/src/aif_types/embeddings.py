from typing import List
from sqlmodel import Field, SQLModel


class EmbeddingMetadata(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    vs_provider: str
    basemodel_uri: str

class CreateEmbeddingsRequest(SQLModel):
    input: str | List[str]
    name: str | None = None

class CreateOrUpdateEmbeddingsResponse(SQLModel):
    asset_id: str
    name: str

class ListEmbeddingsResponse(SQLModel):
    embeddings: List[EmbeddingMetadata]

class UpdateEmbeddingMetadataRequest(SQLModel):
    name: str
