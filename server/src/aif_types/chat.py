from enum import Enum
from typing import List
from pydantic import BaseModel
from sqlmodel import Field, SQLModel
from aif_types.common import RequestFileInfo


class ChatRole(str, Enum):
    ASSISTANT = "assistant"
    USER = "user"

TextFormats = ["plain", "markdown", "latex"]

TextFormatPrompts = {
    "plain": "The response is in plain text format.",
    "markdown": "The response is in markdown format.",
    "latex": "The response is in LaTeX format."
}

class CreateChatResponse(BaseModel):
    session_id: str
    response: str

class ChatHistoryMessage(BaseModel):
    role: str
    content: str
    files: List[RequestFileInfo]

class ChatHistory(SQLModel, table=True):
    id: str = Field(primary_key=True)
    aif_agent_uri: str
    messages: str
