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
import * as multer from "multer";
import { v4 as uuid } from "uuid";
import { types } from "aifoundry-vscode-shared";
import ILmManager from "../lm/ILmManager";

const upload = multer();

export function registerRoutes(router: express.Router, llmManager: ILmManager) {
    router.post('/chat/', upload.array('files'), (req, res) => {
        const aif_session_id = req.cookies.aif_session_id || uuid();

        const aif_agent_uri = req.headers["aif-agent-uri"];
        if (typeof aif_agent_uri !== 'string') {
            res.status(400).type('text').send('Invalid aif_session_id');
            return;
        }

        // Different cases:
        // 1. Exceptions within llmManager.chat, send HTTP 500
        // 2. Exceptions before sending the first chunk, send HTTP 500
        // 3. Exceptions after sending the first chunk, attach the error message to the response with HTTP 200
        // 4. Exceptions after completing the response, ignore the exception
        try {
            const sub = llmManager.chat(
                aif_session_id,
                aif_agent_uri,
                req.query.outputFormat as types.api.TextFormat,
                req.body.input,
                req.body.requestFileInfoList,
            )
    
            res.status(200).type('text');
            res.cookie('aif_session_id', aif_session_id);
            let streamingStarted = false;
            let streamingFinished = false;
            sub.subscribe({
                next: (chunk) => {
                    streamingStarted = true;
                    res.write(chunk);
                },
                complete: () => {
                    streamingFinished = true;
                    res.end();
                },
                error: (err) => {
                    if (!streamingStarted) {
                        // Case 2
                        res.status(500).type('text').send(err);
                    } else if (!streamingFinished) {
                        // Case 3
                        res.write(err);
                    } else {
                        // Case 4, ignore the exception
                    }
                },
            });    
        } catch (err) {
            // Case 1
            res.status(500).type('text').send(err);
        }
    });
}
