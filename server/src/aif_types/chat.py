from typing import List
from enum import Enum
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, JSON, Column
from sqlalchemy.orm import relationship

class ChatRole(str, Enum):
    ASSISTANT = "assistant"
    USER = "user"

TextFormats = ["plain", "markdown", "latex"]

TextFormatPrompts = {
    "plain": "The response is in plain text format.",
    "markdown": "The response is in markdown format.",
    "latex": "The response is in LaTeX format."
}

class CreateChatRequest(BaseModel):
    system_prompt: str | None = None # mutually exclusive with header `aif-session-id`, if `aif-session-id` is present, this field will be ignored
    # rag_asset_hint: str # how to use the hint, e.g. "use the following context to answer questions"
    input: str | List[str]
    outputFormat: str = "markdown"
    name: str | None = None

class CreateChatResponse(BaseModel):
    session_id: str
    response: str

class ChatHistoryMessage(BaseModel):
    role: str
    content: str

class ChatHistory(SQLModel, table=True):
    id: str = Field(primary_key=True)
    aif_agent_uri: str
    messages: str
