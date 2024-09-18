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


    @router.get("/config/", tags=["system"])
    async def get_config():
        return llm_manager.get_system_config()
