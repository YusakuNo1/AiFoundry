from enum import Enum
from pydantic import BaseModel
from sqlmodel import Field, SQLModel
from fastapi import UploadFile
from io import BytesIO


class ChatRole(str, Enum):
    ASSISTANT = "assistant"
    USER = "user"

TextFormats = ["plain", "markdown", "latex"]

TextFormatPrompts = {
    "plain": "The response is in plain text format.",
    "markdown": "The response is in markdown format.",
    "latex": "The response is in LaTeX format."
}

class ChatRequestFile:
    file_name: str
    file_buffer: BytesIO
    def __init__(self, file: UploadFile):
        self.file_name = file.filename
        self.file_buffer = BytesIO(file.file.read())

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
