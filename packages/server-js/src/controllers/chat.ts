// @router.post("/chat/", tags=["chat"])
// async def chat(
//     request: CreateChatRequest,
//     aif_agent_uri: str | None = Header(None, alias=HEADER_AIF_AGENT_URI),
//     aif_session_id: str | None = Cookie(None, alias=COOKIE_AIF_SESSION_ID),
// ):
//     aif_session_id = aif_session_id if aif_session_id else str(uuid.uuid4())
//     process_output = llm_manager.chat(
//         request=request,
//         aif_session_id=aif_session_id,
//         aif_agent_uri=aif_agent_uri,
//     )

//     response = StreamingResponse(process_output, media_type="text/event-stream")
//     response.set_cookie(key=COOKIE_AIF_SESSION_ID, value=aif_session_id)
//     return response

import * as express from "express";
import { v4 as uuid } from "uuid";
import { consts, types } from "aifoundry-vscode-shared";
import ILmManager from "../lm/ILmManager";
import RouterUtils from "../utils/RouterUtils";
import ResponseUtils from "../utils/ResponseUtils";
import { HttpException } from "../exceptions";

export function registerRoutes(router: express.Router, llmManager: ILmManager) {
    router.post(
        '/chat/',
        RouterUtils.middlewares.jsonParser,
        RouterUtils.middlewares.uploadFiles,
        RouterUtils.fileConvertMiddleware(["txt", "pdf"]),
        (req, res) => {
            ResponseUtils.handler(res, () => chat(req, res));
        }
    );

    function chat(req, res) {
        const aif_session_id: string = req.cookies.aif_session_id as string || uuid();

        const aif_agent_uri = req.headers["aif-agent-uri"];
        if (!aif_agent_uri || typeof aif_agent_uri !== 'string') {
            throw new HttpException(400, 'Missing aif-agent-uri');
        }

        // Different cases:
        //  1. Exceptions before sending the first 
        //    1.1 Exception within `llmManager.chat`. Handle by `ResponseUtils.handler`. If it's HttpException, follow the instruction; otherwise send HTTP 500
        //    1.2 Exception within `sub.subscribe`. Handle by `ResponseUtils.handleException`. If it's HttpException, follow the instruction; otherwise send HTTP 500
        //  2. Exceptions after sending the first chunk, attach the error message to the response with HTTP 200
        //  3. Exceptions after completing the response, ignore the exception
        const sub = llmManager.chat(
            aif_session_id,
            aif_agent_uri,
            req.query.outputFormat as types.api.TextFormat ?? "plain",
            req.body.input,
            req.files as types.UploadFileInfo[],
        )

        let streamingStarted = false;
        let streamingFinished = false;
        sub.subscribe({
            next: (chunk) => {
                if (!streamingStarted) {
                    streamingStarted = true;
                    res.status(200).type('text');
                    res.cookie(consts.COOKIE_AIF_SESSION_ID, aif_session_id);
                }
                res.write(chunk);
            },
            complete: () => {
                streamingFinished = true;
                res.end();
            },
            error: (err) => {
                if (!streamingStarted) {
                    // Case 1
                    ResponseUtils.handleException(res, err);
                } else if (!streamingFinished) {
                    // Case 2
                    res.write(err);
                } else {
                    // Case 3, ignore the exception
                }
            },
        });
    }
}
