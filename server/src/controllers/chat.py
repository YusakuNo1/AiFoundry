import io, uuid
from typing import List, Optional
from fastapi import APIRouter, Header, Cookie, Query, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
# from aif_types.chat import ChatHistoryEntity
from llm.llm_manager import LlmManager
from consts import HEADER_AIF_AGENT_URI, COOKIE_AIF_SESSION_ID
from aif_types.common import RequestFileInfo
from consts import IMAGE_EXTENSION_INFO
from utils.image_utils import convert_to_base64
from utils.request_utils import createRequestFileInfo


def create_routers(llm_manager: LlmManager):
    router = APIRouter()


    def __init__(self):
        self.llm_manager = llm_manager


    # @router.get("/chat/history/{aif_session_id}", tags=["chat"])
    # async def get_chat_history(
    #     aif_session_id: str,
    # ) -> ChatHistoryEntity:
    #     return llm_manager.get_chat_history(aif_session_id)

    @router.post("/chat/", tags=["chat"])
    async def chat(
        input: str | List[str],
        files: List[UploadFile] | None = None,
        output: Optional[str] = Query("markdown", description="Output format"),  # Optional query parameter
        aif_agent_uri: str | None = Header(None, alias=HEADER_AIF_AGENT_URI),
        aif_session_id: str | None = Cookie(None, alias=COOKIE_AIF_SESSION_ID),
    ):
        aif_session_id = aif_session_id if aif_session_id else str(uuid.uuid4())

        if isinstance(input, list):
            if len(input) > 0:
                input = input[0]
            else:
                raise HTTPException(status_code=400, detail="Input must be a string or a list of strings")

        # files = [] if not files else [RequestFileInfo(file) for file in files]

        # Only support image files for now
        requestFileInfoList: List[RequestFileInfo] = []
        if files is not None:
            try:
                for file in files:
                    requestFileInfo = await createRequestFileInfo(file)
                    if requestFileInfo:
                        requestFileInfoList.append(requestFileInfo)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))


        process_output = llm_manager.chat(
            aif_session_id=aif_session_id,
            aif_agent_uri=aif_agent_uri,
            outputFormat=output,
            input=input,
            requestFileInfoList=requestFileInfoList,
        )

        response = StreamingResponse(process_output, media_type="text/event-stream")
        response.set_cookie(key=COOKIE_AIF_SESSION_ID, value=aif_session_id)
        return response

    
    return router
