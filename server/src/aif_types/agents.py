from typing import List
from sqlmodel import Field, SQLModel, JSON, Column


class AgentMetadata(SQLModel, table=True):
    id: str = Field(primary_key=True)
    agent_uri: str
    name: str | None = None
    base_model_uri: str
    system_prompt: str | None = None
    rag_asset_ids: List[str] = Field(sa_column=Column(JSON))
    function_asset_ids: List[str] = Field(sa_column=Column(JSON))

class CreateAgentRequest(SQLModel):
    base_model_uri: str
    name: str | None = None
    system_prompt: str | None = None
    rag_asset_ids: List[str] | None = None
    function_asset_ids: List[str] | None = None

class UpdateAgentRequest(SQLModel):
    # agent_uri: str
    base_model_uri: str | None = None
    name: str | None = None
    system_prompt: str | None = None
    rag_asset_ids: List[str] | None = None
    function_asset_ids: List[str] | None = None

class CreateOrUpdateAgentResponse(SQLModel):
    agent_uri: str

class ListAgentsResponse(SQLModel):
    agents: List[AgentMetadata]
