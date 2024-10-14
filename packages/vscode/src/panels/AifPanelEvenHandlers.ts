import * as vscode from 'vscode';
import { AifUtils, consts, types } from 'aifoundry-vscode-shared';
import AifPanelTypes from './types';
import ChatAPI from '../api/ChatAPI';
import LanguageModelsAPI from '../api/LanguageModelsAPI';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import FunctionsAPI from '../api/FunctionsAPI';
import EmbeddingsCommands from '../commands/embeddings';
import AgentsCommands from '../commands/agents';
import FunctionsCommands from '../commands/functions';
import FileUtils from '../utils/FileUtils';
import ApiOutputMessageUtils from "../utils/ApiOutputMessageUtils";


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

            const successMessage = _message.type === "api:updateLmProviderInfo" ? "Language model provider setup successfully" : undefined;
            requestPromise.then(() => _updateLmProviders(successMessage, postMessage));
        } else if (_message.type === "api:listLmProviders") {
            LanguageModelsAPI.listLmProviders(false)
                .then(response => postMessageUpdateLmProviders(response.providers, postMessage))
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
        } else if (_message.type === "api:download:model") {
            const message = _message as types.MessageApiDownloadModel;
            const uriInfo = AifUtils.extractAiUri(null, message.data.modelUri);
            if (uriInfo && uriInfo.parts.length === 1) {
                const lmProviderId = uriInfo.protocol;
                const id = uriInfo.parts[0];

                vscode.window.showInformationMessage(`Start downloading model ${message.data.modelUri}...`);
                LanguageModelsAPI.downloadLanguageModel(lmProviderId, id).then(() => {
                    return _updateLmProviders("Model downloaded successfully", postMessage);
                }).then(() => {
                    vscode.window.showInformationMessage(`Model ${message.data.modelUri} is downloaded.`);
                }).catch((error) => {
                    vscode.window.showErrorMessage(error);
                });
            }
        } else if (_message.type === "api:delete:model") {
            const message = _message as types.MessageApiDeleteModel;
            const uriInfo = AifUtils.extractAiUri(null, message.data.modelUri);
            if (uriInfo && uriInfo.parts.length === 1) {
                const lmProviderId = uriInfo.protocol;
                const id = uriInfo.parts[0];
                LanguageModelsAPI.deleteLanguageModel(lmProviderId, id).then(() => {
                    _updateLmProviders("Model deleted successfully", postMessage);
                }).catch((error) => {
                    vscode.window.showErrorMessage("Error deleting model: " + error);
                });
            }
        } else if (_message.type === "api:setup:lmProvider") {
            const message = _message as types.MessageApiSetupLmProvider;
            LanguageModelsAPI.setupLmProvider(message.data.id).then((sub) => {
                sub.subscribe({
                    next: (message) => {
                        const msgObj = JSON.parse(message) as types.api.ApiOutputMessage;
                        ApiOutputMessageUtils.show(msgObj);

                        if (msgObj.type === "success") {
                            _updateLmProviders(undefined, postMessage);
                        }
                    },
                });
            });
        }
    }

    export function postMessageUpdateLmProviders(providers: types.api.LmProviderInfoResponse[], postMessage: (message: types.IMessage) => void): void {
        const message: types.MessageStoreUpdateLmProviders = {
            aifMessageType: 'store:update',
            type: 'updateLmProviders',
            data: {
                lmProviders: providers,
            },
        };
        postMessage(message);
    }

    async function _updateLmProviders(successMessage: string | undefined, postMessage: (message: types.IMessage) => void) {
        return LanguageModelsAPI.listLmProviders(true)
            .then(response => postMessageUpdateLmProviders(response.providers, postMessage))
            .then(() => vscode.commands.executeCommand('AiFoundry.refreshMainView', 1))
            .then(() => successMessage && vscode.window.showInformationMessage(successMessage))
            .catch((error) => {
                vscode.window.showErrorMessage("Error updating language model provider: " + error);
            });
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
