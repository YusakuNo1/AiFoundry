from fastapi import APIRouter
from aif_types.agents import CreateAgentRequest, CreateOrUpdateAgentResponse, UpdateAgentRequest
from llm.llm_manager import LlmManager
from consts import ADMIN_CTRL_PREFIX
from utils.exception_utils import exceptionHandler


def create_admin_routers(llm_manager: LlmManager):
    router = APIRouter()


    @router.get(ADMIN_CTRL_PREFIX + "/agents/", tags=["agents"])
    async def list_agents():
        return exceptionHandler(llm_manager.list_agents)

    # @router.get(f"{ADMIN_CTRL_PREFIX}/agents/{id}")
    # async def get_agent(id: str):
    #     raise NotImplementedError("Not implemented yet")

    @router.post(ADMIN_CTRL_PREFIX + "/agents/", tags=["agents"])
    async def create_agent(request: CreateAgentRequest) -> CreateOrUpdateAgentResponse:
        return exceptionHandler(lambda: llm_manager.create_agent(request))
    

    @router.put(ADMIN_CTRL_PREFIX + "/agents/{id}", tags=["agents"])
    async def update_agent(
        id: str,
        request: UpdateAgentRequest,
    ) -> CreateOrUpdateAgentResponse:
        return exceptionHandler(lambda: llm_manager.update_agent(id, request))


    @router.delete(ADMIN_CTRL_PREFIX + "/agents/{id}", tags=["agents"])
    async def delete_agent(id: str):
        return exceptionHandler(lambda: llm_manager.delete_agent(id))


    return router
