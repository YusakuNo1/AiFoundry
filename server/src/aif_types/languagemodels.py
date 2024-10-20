from typing import List, Optional
from pydantic import BaseModel
from aif_types.llm import LlmProvider


class LanguageModelInfo(BaseModel):
    provider: LlmProvider
    basemodel_uri: str
    name: str
    ready: bool # for Ollama, if it's not ready, need to download it first
    weight: int


class ListLanguageModelsResponse(BaseModel):
    basemodels: List[LanguageModelInfo]


class LmProviderBaseModelInfo(BaseModel):
    # For the models with no version, this is the model name or deployment name, otherwise it's <model-name>:<version>
    id: str
    selected: bool
	# ONLY for Azure OpenAI currently, we allow the users to add deployment name + version, and they can delete it
    isUserDefined: bool = False
    tags: List[str]


class LmProviderProperty(BaseModel):
    description: str
    hint: str
    value: str | None
    isCredential: bool


class LmProviderEntity(BaseModel):
    lmProviderId: str
    name: str
    properties: dict[str, LmProviderProperty]
    weight: int
    supportUserDefinedModels: bool = False
    models: List[LmProviderBaseModelInfo]
    status: str     # available or unavailable


class ListLmProvidersResponse(BaseModel):
    providers: List[LmProviderEntity]


class UpdateLmProviderRequest(BaseModel):
    lmProviderId: str
    properties: Optional[dict[str, str]] = None
    weight: Optional[int] = None
    selectedModels: Optional[List[str]] = None
    embeddingModelIndexes: Optional[List[int]] = None       # for LmProviderBaseModelInfo with isUserDefined, e.g. Azure OpenAI
    visionModelIndexes: Optional[List[int]] = None          # for LmProviderBaseModelInfo with isUserDefined, e.g. Azure OpenAI
    toolsModelIndexes: Optional[List[int]] = None           # for LmProviderBaseModelInfo with isUserDefined, e.g. Azure OpenAI
