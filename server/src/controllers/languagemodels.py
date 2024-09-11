from fastapi import APIRouter, HTTPException
from llm.llm_manager import LlmManager
from aif_types.languagemodels import ListLanguageModelsResponse, UpdateLmProviderRequest, ListLmProvidersResponse
from aif_types.llm import LlmFeature
from consts import ADMIN_CTRL_PREFIX
from utils.exception_utils import exceptionHandler


def create_admin_routers(llm_manager: LlmManager):
    router = APIRouter()

    @router.get(ADMIN_CTRL_PREFIX + "/languagemodels/", tags=["languagemodels"])
    async def list_languagemodels() -> ListLanguageModelsResponse:
        return exceptionHandler(lambda: llm_manager.list_languagemodels(LlmFeature.ALL))


    @router.get(ADMIN_CTRL_PREFIX + "/languagemodels/filter/{filter}", tags=["languagemodels"])
    async def list_languagemodels_with_filter(filter: LlmFeature) -> ListLanguageModelsResponse:
        if filter not in LlmFeature:
            raise HTTPException(status_code=400, detail="Invalid filter")
        return exceptionHandler(lambda: llm_manager.list_languagemodels(filter))


    @router.get(ADMIN_CTRL_PREFIX + "/languagemodels/providers", tags=["languagemodels"])
    async def listLmProviders() -> ListLmProvidersResponse:
        return exceptionHandler(lambda: llm_manager.listLmProviders())


    @router.post(ADMIN_CTRL_PREFIX + "/languagemodels/providers", tags=["languagemodels"])
    async def updateLmProvider(
        request: UpdateLmProviderRequest,
    ) -> ListLmProvidersResponse:
        return exceptionHandler(lambda: llm_manager.updateLmProvider(request))


    return router
