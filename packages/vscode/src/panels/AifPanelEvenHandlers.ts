import * as vscode from 'vscode';
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import ChatAPI from '../api/ChatAPI';
import LanguageModelsAPI from '../api/LanguageModelsAPI';
import AifPanelUtils from './AifPanelUtils';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import FunctionsAPI from '../api/FunctionsAPI';


namespace AifPanelEvenHandlers {
    export function webviewApiEventHandler(message: types.IMessage, postMessage: (message: types.IMessage) => void): void {
        const apiMessage = message as types.MessageApi;
        if (apiMessage.type === 'chat:history:get') {
            const chatHistoryApiMessage = apiMessage as types.MessageApiGetChatHistory;
            // ChatAPI.getChatHistory(chatHistoryApiMessage.data).then((response) => {
            // TODO: Implement ChatAPI.getChatHistory
        } else if (apiMessage.type === 'chat:sendMessage') {
            const chatSendApiMessage = apiMessage as types.MessageApiChatSendMessage;
            const observable = ChatAPI.chat(
                chatSendApiMessage.data.isStream,
                chatSendApiMessage.data.aifSessionId,
                chatSendApiMessage.data.aifAgentUri,
                chatSendApiMessage.data.content,
                chatSendApiMessage.data.contentTextFormat,
            );

            let aifSessionId: string | null = null;
            observable.subscribe({
                next: (content) => {
                    if (!aifSessionId) {
                        const result = consts.Markup.Varialbe.GetKeyValue(content);
                        if (result && result.key === consts.COOKIE_AIF_SESSION_ID) {
                            aifSessionId = result.value;
                        }
                    } else {
                        const messsage: types.MessageStoreAppendToLastChatAssistantMessage = {
                            aifMessageType: 'store:update',
                            type: 'appendToLastChatAssistantMessage',
                            data: {
                                aifSessionId,
                                chunk: content,
                                contentTextFormat: chatSendApiMessage.data.contentTextFormat,
                            },
                        };
                        postMessage(messsage);	
                    }
                },
                error: (error) => {
                    // TODO: show error in UI
                    // console.error('* * ChatAPI error:', error);
                },
                complete: () => {
                    // console.log('* * ChatAPI complete');
                },
            });
        } else if (apiMessage.type === "api:updateLmProvider" || apiMessage.type === "api:updateLmProvider:modelSelection") {
            const message = apiMessage as types.MessageApiUpdateLmProvider;
            LanguageModelsAPI.updateLmProvider(message.data as types.api.UpdateLmProviderRequest)
                .then(response => _postMessageUpdateLmProviders(response, postMessage))
                .then(() => vscode.commands.executeCommand('AiFoundry.refreshMainView', 1))
                .then(() => {
                    if (apiMessage.type === "api:updateLmProvider") {
                        vscode.window.showInformationMessage("Language model provider setup successfully");
                        const setPageMessage = AifPanelUtils.createMessageSetPageHome();
                        postMessage(setPageMessage);
                    }
                })
                .catch((error) => {
                    vscode.window.showErrorMessage("Error updating language model provider: " + error);
                });
        } else if (apiMessage.type === "api:listLmProviders") {
            LanguageModelsAPI.listLmProviders()
                .then(response => _postMessageUpdateLmProviders(response, postMessage))
                .catch((error) => {
                    vscode.window.showErrorMessage("Error listing language model providers: " + error);
                });
        } else if (apiMessage.type === "api:getEmbeddings") {
            EmbeddingsAPI.getEmbeddings()
                .then(response => {
                    const message: types.MessageStoreUpdateEmbeddings = {
                        aifMessageType: 'store:update',
                        type: 'updateEmbeddings',
                        data: {
                            embeddings: response.embeddings,
                        },
                    };
                    postMessage(message);
                })
                .catch((error) => {
                    vscode.window.showErrorMessage("Error getting embeddings: " + error);
                });
        } else if (apiMessage.type === "api:listFunctions") {
            FunctionsAPI.listFunctions()
                .then(response => {
                    const message: types.MessageStoreUpdateFunctions = {
                        aifMessageType: 'store:update',
                        type: 'updateFunctions',
                        data: {
                            functions: response.functions,
                        },
                    };
                    postMessage(message);
                })
                .catch((error) => {
                    vscode.window.showErrorMessage("Error listing functions: " + error);
                });
        }
    }

    function _postMessageUpdateLmProviders(response: types.api.ListLmProvidersResponse, postMessage: (message: types.IMessage) => void): void {
        const message: types.MessageStoreUpdateLmProviders = {
            aifMessageType: 'store:update',
            type: 'updateLmProviders',
            data: {
                lmProviders: response.providers,
            },
        };
        postMessage(message);
    }
}

export default AifPanelEvenHandlers;
