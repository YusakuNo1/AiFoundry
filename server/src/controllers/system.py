from fastapi import APIRouter, Security
from llm.llm_manager import LlmManager
from consts import ADMIN_CTRL_PREFIX
from utils.exception_utils import exceptionHandler


def create_routers(llm_manager: LlmManager):
    router = APIRouter()

    @router.get("/status/", tags=["system"])
    async def get_status():
        return { "status": "ok" }

    return router


def create_admin_routers(llm_manager: LlmManager):
    router = APIRouter()

    @router.get(ADMIN_CTRL_PREFIX + "/system/", tags=["system"])
    async def get_system_config():
        return exceptionHandler(llm_manager.getGetSystemConfig)

    return router
