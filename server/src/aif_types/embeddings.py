from typing import List
from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EmbeddingMetadata(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    vs_provider: str
    basemodel_uri: str

class CreateEmbeddingsRequest(BaseModel):
    input: str | List[str]
    name: str | None = None

class CreateOrUpdateEmbeddingsResponse(BaseModel):
    asset_id: str
    name: str

class ListEmbeddingsResponse(BaseModel):
    embeddings: List[EmbeddingMetadata]

class UpdateEmbeddingMetadataRequest(BaseModel):
    name: str
