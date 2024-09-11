from typing import List
from enum import Enum
from sqlmodel import Field, SQLModel, JSON, Column


class AifFunctionType(str, Enum):
    LOCAL = "local"
    AZURE_FUNCTIONS = "azure_functions"


class FunctionMetadata(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str | None = None
    uri: str                            # uri of the function, patterns:
                                        #    aif://function/local/{functions_path}/{functions_name}
                                        #    aif://function/azure-functions/{app_name}/{functions_name}
    functions_path: str | None = None   # AifFunctionType.LOCAL. local path of the function
    functions_name: str | None = None   # AifFunctionType.LOCAL. name of the function


class CreateFunctionRequest(SQLModel):
    type: AifFunctionType
    name: str | None = None
    functions_path: str
    functions_name: str


class UpdateFunctionRequest(SQLModel):
    id: str
    name: str | None = None


class CreateOrUpdateFunctionResponse(FunctionMetadata):
    pass


class DeleteFunctionResponse(SQLModel):
    id: str


class ListFunctionsResponse(SQLModel):
    functions: List[FunctionMetadata]
