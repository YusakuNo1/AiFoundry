import { Observable } from 'rxjs';
import { consts, types } from 'aifoundry-vscode-shared';
import ILmProvider from './ILmProvider';
import ILmManager from './ILmManager';
import DatabaseManager from '../database/DatabaseManager';

import { runLm, runEmbedding } from '../lm/LmProviderTmpAzureOpenAI';


class LmManager implements ILmManager {
    private _lmProviderMap: Record<string, ILmProvider> = {};

    constructor(private databaseManager: DatabaseManager) {
    }

// 	async def chat(self,
//         request: CreateChatRequest,
//         aif_session_id: str,
//         aif_agent_uri: str,
//   ) -> AsyncIterable[str]:
//       try:
//           request_info = process_aif_agent_uri(self.database_manager, aif_agent_uri, request.system_prompt)

//           runnable = self._get_chat_runnable(
//               input=request.input,
//               aif_session_id=aif_session_id,
//               request_info=request_info,
//               outputFormat=request.outputFormat,
//           )

//           # if request_info has functions, invoke the request and wait for the response because LM may send back a tool call
//           if not request_info.functions:
//               response = ""

//               # iterable = runnable.astream(request.input, config={"callbacks": [DebugPromptHandler()]})	# for debugging
//               iterable = runnable.astream(request.input)
//               async for chunk in iterable:
//                   response = response + chunk.content
//                   yield chunk.content

//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.USER, content=request.input)
//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.ASSISTANT, content=response)
//           else:
//               # For function calling, we need the full response to process the tools
//               # invoke_result = runnable.invoke(request.input, config={"callbacks": [DebugPromptHandler()]})	# for debugging
//               invoke_result = runnable.invoke(request.input)

//               response = ""
//               # Special case from Anthropic response: invoke_result.content is a list, find the content from the first item
//               if type(invoke_result.content) == list and len(invoke_result.content) > 0:
//                   responseText = invoke_result.content[0]["text"]
//               elif invoke_result.content:
//                   responseText = invoke_result.content
//               else:
//                   responseText = ""

//               if len(responseText) > 0:
//                   response += responseText
//                   yield responseText + RESPONSE_LINEBREAK + RESPONSE_LINEBREAK

//               tool_result = processToolsResponse(invoke_result, request_info.functions)
//               if type(tool_result) != str:
//                   raise HTTPException(status_code=400, detail="Tool response should be a string")
//               response += tool_result
//               yield tool_result

//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.USER, content=request.input)
//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.ASSISTANT, content=response)

//       except Exception as e:
//           if isinstance(e, HTTPException):
//               yield e.detail
//           elif isinstance(e, ValueError):
//               yield str(e)
//           else:
//               yield "Sorry, something went wrong"

    chat(
        aif_session_id: string,
        aif_agent_uri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        requestFileInfoList: types.api.ChatHistoryMessageFile[],
    ): Observable<string> {
        // const lmProvider = this._lmProviderMap[aif_agent_uri];
        // if (!lmProvider) {
        //     throw new Error(`No LM provider found for aif_agent_uri: ${aif_agent_uri}`);
        // }

        runEmbedding(input).then(reponse => {
            console.log(`Embedding response: ${reponse}`);
        });


        // return lmProvider.chat(request, aif_session_id);
        return new Observable<string>((subscriber) => {
            runLm(input).then(reponse => {
                subscriber.next(reponse as any);
                subscriber.complete();
            }).catch(err => {
                subscriber.error(err);
            });
        });
    }
}

export default LmManager;
