import * as vscode from 'vscode';
import { consts, types } from 'aifoundry-vscode-shared';
import AifPanelTypes from './types';
import ChatAPI from '../api/ChatAPI';
import LanguageModelsAPI from '../api/LanguageModelsAPI';
import AifPanelUtils from './AifPanelUtils';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import FunctionsAPI from '../api/FunctionsAPI';
import EmbeddingsCommands from '../commands/embeddings';
import AgentsCommands from '../commands/agents';
import FunctionsCommands from '../commands/functions';
import FileUtils from '../utils/FileUtils';


namespace AifPanelEvenHandlers {
    export function webviewHostMsgEventHandler(message: types.IMessage, postMessage: (message: types.IMessage) => void): void {
        const _message = message as types.MessageHostMsg;
        if (_message.type === 'executeCommand') {
            const _message = message as types.MessageHostMsgExecuteCommand;
            vscode.commands.executeCommand(_message.data.command);
        } else if (_message.type === 'showMessage') {
            const _message = message as types.MessageHostMsgShowMessage;
            if (_message.data.type === 'info') {
                vscode.window.showInformationMessage(_message.data.message);
            } else if (_message.data.type === 'warning') {
                vscode.window.showWarningMessage(_message.data.message);
            } else {
                vscode.window.showErrorMessage(_message.data.message);
            }
        }
    }

    export function webviewEditInfoEventHandler(message: types.IMessage, viewProviderMap: AifPanelTypes.ViewProviderMap | undefined): void {
        const _message = message as types.MessageEditInfo;
        if (viewProviderMap?.embeddings && types.MessageEditInfoEmbeddingsTypes.includes(_message.type as types.MessageEditInfoEmbeddingsType)) {
            if (_message.type === 'UpdateEmbeddingName') {
                const messageEditInfo = message as types.MessageEditInfoEmbeddingName;
                EmbeddingsCommands.startUpdateEmbeddingNameFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId, messageEditInfo.data.name);
            } else if (_message.type === 'UpdateEmbeddingDoc') {
                const messageEditInfo = message as types.MessageEditInfoEmbeddingUpdateDoc;
                EmbeddingsCommands.startUpdateEmbeddingDocumentFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId);
            } else if (_message.type === 'DeleteEmbedding') {
                const messageEditInfo = message as types.MessageEditInfoDeleteEmbedding;
                EmbeddingsCommands.startDeleteEmbeddingFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId);
            }
        } else if (viewProviderMap?.agents && types.MessageEditInfoAgentsTypes.includes(_message.type as types.MessageEditInfoAgentsType)) {
            if (_message.type === 'agent:update:name') {
                const messageEditInfo = message as types.MessageEditInfoAgentName;
                AgentsCommands.startupdateAgentNameFlow(viewProviderMap.agents, messageEditInfo.data.id, messageEditInfo.data.name);
            } else if (_message.type === 'agent:update:systemPrompt') {
                const messageEditInfo = message as types.MessageEditInfoAgentsystemPrompt;
                AgentsCommands.startupdateAgentSystemPromptFlow(viewProviderMap.agents, messageEditInfo.data.id, messageEditInfo.data.systemPrompt);
            } else if (_message.type === 'agent:delete') {
                const messageEditInfo = message as types.MessageEditInfodeleteAgent;
                AgentsCommands.startdeleteAgentFlow(viewProviderMap.agents, messageEditInfo.data.id);
            }
        } else if (viewProviderMap?.functions && types.MessageEditInfoFunctionsTypes.includes(_message.type as types.MessageEditInfoFunctionsType)) {
            if (_message.type === 'function:update:name') {
                const updateNameMessage = message as types.MessageEditInfoFunctionUpdateName;
                FunctionsCommands.startUpdateFunctionNameFlow(viewProviderMap.functions, updateNameMessage.data.id, updateNameMessage.data.name);
            } else if (_message.type === 'function:openfile') {
                const openFileMessage = message as types.MessageEditInfoFunctionOpenFile;
                vscode.window.showTextDocument(vscode.Uri.file(openFileMessage.data.uri));
            }
        }
    }

    export function webviewApiEventHandler(message: types.IMessage, postMessage: (message: types.IMessage) => void): void {
        const _message = message as types.MessageApi;
        if (_message.type === 'chat:history:get') {
            const chatHistoryApiMessage = _message as types.MessageApiGetChatHistory;
            // ChatAPI.getChatHistory(chatHistoryApiMessage.data).then((response) => {
            // TODO: Implement ChatAPI.getChatHistory
        } else if (_message.type === 'chat:sendMessage') {
            _chatSendMessage(_message, postMessage);
        } else if (_message.type === "api:updateLmProviderInfo" || _message.type === "api:updateLmProviderModel") {
            let requestPromise: Promise<any>;
            if (_message.type === "api:updateLmProviderInfo") {
                const message = _message as types.MessageApiUpdateLmProviderInfo;
                requestPromise = LanguageModelsAPI.updateLmProviderInfo(message.data as types.api.UpdateLmProviderInfoRequest);
            } else {
                const message = _message as types.MessageApiUpdateLmProviderModel;
                requestPromise = LanguageModelsAPI.updateLmProviderModel(message.data as types.api.UpdateLmProviderModelRequest);
            }

            requestPromise
                .then(LanguageModelsAPI.listLmProviders)
                .then(response => _postMessageUpdateLmProviders(response.providers, postMessage))
                .then(() => vscode.commands.executeCommand('AiFoundry.refreshMainView', 1))
                .then(() => {
                    if (_message.type === "api:updateLmProviderInfo") {
                        vscode.window.showInformationMessage("Language model provider setup successfully");
                        // const setPageMessage = AifPanelUtils.createMessageSetPageHome();
                        // postMessage(setPageMessage);
                    }
                })
                .catch((error) => {
                    vscode.window.showErrorMessage("Error updating language model provider: " + error);
                });
        } else if (_message.type === "api:listLmProviders") {
            LanguageModelsAPI.listLmProviders()
                .then(response => _postMessageUpdateLmProviders(response.providers, postMessage))
                .catch((error) => {
                    vscode.window.showErrorMessage("Error listing language model providers: " + error);
                });
        } else if (_message.type === "api:getEmbeddings") {
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
        } else if (_message.type === "api:listFunctions") {
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

    function _postMessageUpdateLmProviders(providers: types.api.LmProviderInfoResponse[], postMessage: (message: types.IMessage) => void): void {
        const message: types.MessageStoreUpdateLmProviders = {
            aifMessageType: 'store:update',
            type: 'updateLmProviders',
            data: {
                lmProviders: providers,
            },
        };
        postMessage(message);
    }

    async function _chatSendMessage(_message: types.IMessage, postMessage: (message: types.IMessage) => void) {
        const chatSendApiMessage = _message as types.MessageApiChatSendMessage;
        const files: File[] = [];

        // Convert types.api.ChatHistoryMessageFile to File
        for (const chatHistoryMessageFile of chatSendApiMessage.data.files) {
            const file = await FileUtils.convertChatHistoryMessageFileToFile(chatHistoryMessageFile);
            files.push(file);
        }

        const observable = ChatAPI.chat(
            chatSendApiMessage.data.input,
            files,
            chatSendApiMessage.data.contentTextFormat,
            chatSendApiMessage.data.aifSessionId,
            chatSendApiMessage.data.aifAgentUri,
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
    }
}

export default AifPanelEvenHandlers;
