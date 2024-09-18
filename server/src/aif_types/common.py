from pydantic import BaseModel

class RequestFileInfo(BaseModel):
    file_name: str
    mine_type: str
    file_buffer: str
