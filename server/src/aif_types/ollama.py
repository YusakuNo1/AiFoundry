from typing import Dict
from pydantic import BaseModel

class OllamaModelInfo(BaseModel):
	name: str
	id: str
	size: int
	modified_at: str
	version: str | None = None
