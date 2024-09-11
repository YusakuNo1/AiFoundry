from fastapi import APIRouter
from aif_types.functions import CreateFunctionRequest, UpdateFunctionRequest
from llm.llm_manager import LlmManager
from consts import ADMIN_CTRL_PREFIX
from utils.exception_utils import exceptionHandler


def create_admin_routers(llm_manager: LlmManager):
    router = APIRouter()


    @router.get(ADMIN_CTRL_PREFIX + "/functions/", tags=["functions"])
    async def list_functions():
        return exceptionHandler(llm_manager.list_functions)


    @router.post(ADMIN_CTRL_PREFIX + "/functions/", tags=["functions"])
    async def create_function(request: CreateFunctionRequest):
        return exceptionHandler(lambda: llm_manager.create_function(request))


    @router.put(ADMIN_CTRL_PREFIX + "/functions/", tags=["functions"])
    async def update_function(request: UpdateFunctionRequest):
        return exceptionHandler(lambda: llm_manager.update_function(request))


    @router.delete(ADMIN_CTRL_PREFIX + "/functions/{id}", tags=["functions"])
    async def delete_function(id: str):
        return exceptionHandler(lambda: llm_manager.delete_function(id))


    return router
