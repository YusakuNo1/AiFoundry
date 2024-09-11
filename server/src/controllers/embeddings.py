from typing import Any, List
from fastapi import APIRouter, File, Header, UploadFile, HTTPException
from aif_types.embeddings import CreateEmbeddingsRequest, UpdateEmbeddingMetadataRequest
from llm.llm_manager import LlmManager
from consts import HEADER_AIF_BASEMODEL_URI, HEADER_AIF_EMBEDDING_ASSET_ID
from consts import ADMIN_CTRL_PREFIX
from utils.exception_utils import exceptionHandler


def create_admin_routers(llm_manager: LlmManager):
    router = APIRouter()

    @router.get(ADMIN_CTRL_PREFIX + "/embeddings/", tags=["embeddings"])
    async def list_embeddings():
        return exceptionHandler(llm_manager.list_embeddings)


    # @router.get("/embeddings/{id}")
    # async def get_embedding(id: str):
    #     return {"itemname": id}


    @router.put(ADMIN_CTRL_PREFIX + "/embeddings/", tags=["embeddings"])
    async def update_embedding(
        metadata: UpdateEmbeddingMetadataRequest,
        aif_embedding_asset_id: str | None = Header(None, alias=HEADER_AIF_EMBEDDING_ASSET_ID),
    ):
        return exceptionHandler(lambda: llm_manager.update_embedding_metadata(metadata, aif_embedding_asset_id))


    @router.post(ADMIN_CTRL_PREFIX + "/embeddings/files/", tags=["embeddings"])
    async def create_embedding(
        files: List[UploadFile],
        aif_basemodel_uri: str | None = Header(None, alias=HEADER_AIF_BASEMODEL_URI),
    ):
        def handler():
            # Key: file name; Value: file content
            file_dict = { file.filename: file.file.read() for file in files }
            return llm_manager.create_embedding(file_dict, aif_basemodel_uri)
        return exceptionHandler(handler)


    @router.put(ADMIN_CTRL_PREFIX + "/embeddings/files/", tags=["embeddings"])
    async def update_embedding(
        files: List[UploadFile],
        aif_embedding_asset_id: str | None = Header(None, alias=HEADER_AIF_EMBEDDING_ASSET_ID),
    ):
        def handler():
            # Key: file name; Value: file content
            file_dict = { file.filename: file.file.read() for file in files }
            return llm_manager.update_embedding(file_dict, aif_embedding_asset_id)
        return exceptionHandler(handler)


    @router.delete(ADMIN_CTRL_PREFIX + "/embeddings/{aif_embedding_asset_id}", tags=["embeddings"])
    async def delete_embedding(
        aif_embedding_asset_id: str,
    ):
        return exceptionHandler(lambda: llm_manager.delete_embedding(aif_embedding_asset_id))


    return router


def create_debug_routers(llm_manager: LlmManager):
    router = APIRouter()

    @router.post(ADMIN_CTRL_PREFIX + "/embeddings/file/", tags=["embeddings", "debug_only"])
    async def upload_file(
        file: UploadFile = File(...),
    ):
        try:
            while contents := file.file.read(1024 * 1024):
                print("contents", contents)
        except Exception:
            return {"message": "There was an error uploading the file"}
        finally:
            file.file.close()

        return {"status": "TESTING ENDPOINT, not stored in database"}


    @router.post("/embeddings/content/", tags=["embeddings", "debug_only"])
    async def create_embedding_by_content(
        request: CreateEmbeddingsRequest,
        aif_basemodel_uri: str | None = Header(None, alias=HEADER_AIF_BASEMODEL_URI),
    ):
        return exceptionHandler(lambda: llm_manager.create_embeddings_content(request, aif_basemodel_uri))

    return router
