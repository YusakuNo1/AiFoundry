from typing import List
from enum import Enum
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, JSON, Column


class AifFunctionType(str, Enum):
    LOCAL = "local"
    AZURE_FUNCTIONS = "azure_functions"


class FunctionEntity(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str | None = None
    uri: str                            # uri of the function, patterns:
                                        #    aif://function/local/{functions_path}/{functions_name}
                                        #    aif://function/azure-functions/{app_name}/{functions_name}
    functions_path: str | None = None   # AifFunctionType.LOCAL. local path of the function
    functions_name: str | None = None   # AifFunctionType.LOCAL. name of the function


class CreateFunctionRequest(BaseModel):
    type: AifFunctionType
    name: str | None = None
    functions_path: str
    functions_name: str


class UpdateFunctionRequest(BaseModel):
    id: str
    name: str | None = None


class CreateOrUpdateFunctionResponse(FunctionEntity):
    pass


class DeleteFunctionResponse(BaseModel):
    id: str


class ListFunctionsResponse(BaseModel):
    functions: List[FunctionEntity]
