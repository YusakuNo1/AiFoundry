import * as vscode from 'vscode';
import { AifUtils, type api, consts, messages } from 'aifoundry-vscode-shared';
import AifPanelTypes from './types';
import ChatAPI from '../api/ChatAPI';
import LanguageModelsAPI from '../api/LanguageModelsAPI';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import FunctionsAPI from '../api/FunctionsAPI';
import EmbeddingsCommands from '../commands/embeddings';
import AgentsCommands from '../commands/agents';
import FunctionsCommands from '../commands/functions';
import FileUtils from '../utils/FileUtils';
import ApiOutStreamMessageUtils from "../utils/ApiOutStreamMessageUtils";
import ApiUtils from '../utils/ApiUtils';
import AgentsAPI from '../api/AgentsAPI';


namespace AifPanelEvenHandlers {
    export function webviewHostMsgEventHandler(message: messages.IMessage, postMessage: (message: messages.IMessage) => void): void {
        const _message = message as messages.MessageHostMsg;
        if (_message.type === 'executeCommand') {
            const _message = message as messages.MessageHostMsgExecuteCommand;
            vscode.commands.executeCommand(_message.data.command);
        } else if (_message.type === 'showMessage') {
            const _message = message as messages.MessageHostMsgShowMessage;
            if (_message.data.type === 'info') {
                vscode.window.showInformationMessage(_message.data.message);
            } else if (_message.data.type === 'warning') {
                vscode.window.showWarningMessage(_message.data.message);
            } else {
                vscode.window.showErrorMessage(_message.data.message);
            }
        }
    }

    export function webviewEditInfoEventHandler(message: messages.IMessage, viewProviderMap: AifPanelTypes.ViewProviderMap | undefined): void {
        const _message = message as messages.MessageEditInfo;
        if (viewProviderMap?.embeddings && messages.MessageEditInfoEmbeddingsTypes.includes(_message.type as messages.MessageEditInfoEmbeddingsType)) {
            if (_message.type === 'UpdateEmbeddingName') {
                const messageEditInfo = message as messages.MessageEditInfoEmbeddingName;
                EmbeddingsCommands.startUpdateEmbeddingNameFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId, messageEditInfo.data.name);
            } else if (_message.type === 'UpdateEmbeddingDoc') {
                const messageEditInfo = message as messages.MessageEditInfoEmbeddingUpdateDoc;
                EmbeddingsCommands.startUpdateEmbeddingDocumentFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId);
            } else if (_message.type === 'DeleteEmbedding') {
                const messageEditInfo = message as messages.MessageEditInfoDeleteEmbedding;
                EmbeddingsCommands.startDeleteEmbeddingFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId);
            } else if (_message.type === 'UpdateEmbeddingSearchTopK') {
                const messageEditInfo = message as messages.MessageEditInfoEmbeddingSearchTopK;
                EmbeddingsCommands.startUpdateEmbeddingSearchTopKFlow(viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId, messageEditInfo.data.searchTopK);
            }
        } else if (viewProviderMap?.agents && messages.MessageEditInfoAgentsTypes.includes(_message.type as messages.MessageEditInfoAgentsType)) {
            if (_message.type === 'agent:update:name') {
                const messageEditInfo = message as messages.MessageEditInfoAgentName;
                AgentsCommands.startupdateAgentNameFlow(viewProviderMap.agents, messageEditInfo.data.id, messageEditInfo.data.name);
            } else if (_message.type === 'agent:update:systemPrompt') {
                const messageEditInfo = message as messages.MessageEditInfoAgentsystemPrompt;
                AgentsCommands.startupdateAgentSystemPromptFlow(viewProviderMap.agents, messageEditInfo.data.id, messageEditInfo.data.systemPrompt);
            } else if (_message.type === 'agent:delete') {
                const messageEditInfo = message as messages.MessageEditInfodeleteAgent;
                AgentsCommands.startdeleteAgentFlow(viewProviderMap.agents, messageEditInfo.data.id);
            }
        } else if (viewProviderMap?.functions && messages.MessageEditInfoFunctionsTypes.includes(_message.type as messages.MessageEditInfoFunctionsType)) {
            if (_message.type === 'function:update:name') {
                const updateNameMessage = message as messages.MessageEditInfoFunctionUpdateName;
                FunctionsCommands.startUpdateFunctionNameFlow(viewProviderMap.functions, updateNameMessage.data.id, updateNameMessage.data.name);
            } else if (_message.type === 'function:openfile') {
                const openFileMessage = message as messages.MessageEditInfoFunctionOpenFile;
                vscode.window.showTextDocument(vscode.Uri.file(openFileMessage.data.uri));
            }
        }
    }

    export function webviewApiEventHandler(message: messages.IMessage, postMessage: (message: messages.IMessage) => void): void {
        const _message = message as messages.MessageApi;
        if (_message.type === 'chat:history:get') {
            const chatHistoryApiMessage = _message as messages.MessageApiGetChatHistory;
            // ChatAPI.getChatHistory(chatHistoryApiMessage.data).then((response) => {
            // TODO: Implement ChatAPI.getChatHistory
        } else if (_message.type === 'chat:sendMessage') {
            _chatSendMessage(_message, postMessage);
        } else if (_message.type === "api:updateLmProviderInfo" || _message.type === "api:updateLmProviderModel") {
            let requestPromise: Promise<any>;
            if (_message.type === "api:updateLmProviderInfo") {
                const message = _message as messages.MessageApiUpdateLmProviderInfo;
                requestPromise = LanguageModelsAPI.updateLmProviderInfo(message.data as api.UpdateLmProviderInfoRequest);
            } else {
                const message = _message as messages.MessageApiUpdateLmProviderModel;
                requestPromise = LanguageModelsAPI.updateLmProviderModel(message.data as api.UpdateLmProviderModelRequest);
            }

            const successMessage = _message.type === "api:updateLmProviderInfo" ? "Language model provider setup successfully" : undefined;
            requestPromise.then(() => _updateLmProviders(successMessage, postMessage));
        } else if (_message.type === "api:listLmProviders") {
            LanguageModelsAPI.listLmProviders(false)
                .then(response => postMessageUpdateLmProviders(response.providers, postMessage))
                .catch((error) => {
                    vscode.window.showErrorMessage("Error listing language model providers: " + error);
                });
        } else if (_message.type === "api:getAgents") {
            AgentsAPI.list()
                .then(response => {
                    const message: messages.MessageStoreUpdateAgents = {
                        aifMessageType: 'store:update',
                        type: 'updateAgents',
                        data: {
                            agents: response.agents,
                        },
                    };
                    postMessage(message);
                })
                .catch((error) => {
                    vscode.window.showErrorMessage("Error getting agents: " + error);
                });
        } else if (_message.type === "api:getEmbeddings") {
            EmbeddingsAPI.getEmbeddings()
                .then(response => {
                    const message: messages.MessageStoreUpdateEmbeddings = {
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
                    const message: messages.MessageStoreUpdateFunctions = {
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
            const message = _message as messages.MessageApiDownloadModel;
            const uriInfo = AifUtils.extractAiUri(null, message.data.modelUri);
            if (uriInfo && uriInfo.parts.length === 1) {
                const lmProviderId = uriInfo.protocol;
                const id = uriInfo.parts[0];

                vscode.window.showInformationMessage(`Start downloading model ${message.data.modelUri}...`);
                LanguageModelsAPI.downloadLocalLanguageModel(lmProviderId, id).then(() => {
                    return _updateLmProviders(undefined, postMessage);
                }).then(() => {
                    vscode.window.showInformationMessage(`Model ${message.data.modelUri} is downloaded.`);
                }).catch((error) => {
                    vscode.window.showErrorMessage(error);
                });
            }
        } else if (_message.type === "api:delete:model") {
            const message = _message as messages.MessageApiDeleteModel;
            const uriInfo = AifUtils.extractAiUri(null, message.data.modelUri);
            if (uriInfo && uriInfo.parts.length === 1) {
                const lmProviderId = uriInfo.protocol;
                const id = uriInfo.parts[0];
                LanguageModelsAPI.deleteLocalLanguageModel(lmProviderId, id).then(() => {
                    return _updateLmProviders(undefined, postMessage);
                }).catch((error) => {
                    vscode.window.showErrorMessage("Error deleting model: " + error);
                });
            }
        } else if (_message.type === "api:setup:lmProvider") {
            const message = _message as messages.MessageApiSetupLmProvider;
            const sub = LanguageModelsAPI.setupLmProvider(message.data.id);
            sub.subscribe({
                next: (message) => {
                    const msgObj = JSON.parse(message) as api.ApiOutStreamMessage;
                    ApiOutStreamMessageUtils.show(msgObj);
                },
                complete: () => {
                    ApiUtils.apiPoller(
                        () => LanguageModelsAPI.getLmProvider(message.data.id, true),
                        (response) => response.status === "available",
                        2000,   // 2 seconds
                        10,     // 10 attempts
                    ).then(() => {
                        _updateLmProviders(undefined, postMessage);
                    }).catch((error) => {
                        vscode.window.showErrorMessage("Error setting up language model provider: " + error);
                    });
                },
                error: (error) => {
                    vscode.window.showErrorMessage("Error setting up language model provider: " + error);
                },
            });
        }
    }

    export function postMessageUpdateLmProviders(providers: api.LmProviderInfoResponse[], postMessage: (message: messages.IMessage) => void): void {
        const message: messages.MessageStoreUpdateLmProviders = {
            aifMessageType: 'store:update',
            type: 'updateLmProviders',
            data: {
                lmProviders: providers,
            },
        };
        postMessage(message);
    }

    async function _updateLmProviders(successMessage: string | undefined, postMessage: (message: messages.IMessage) => void) {
        return LanguageModelsAPI.listLmProviders(true)
            .then(response => postMessageUpdateLmProviders(response.providers, postMessage))
            .then(() => vscode.commands.executeCommand('AiFoundry.refreshMainView', 1))
            .then(() => successMessage && vscode.window.showInformationMessage(successMessage))
            .catch((error) => {
                vscode.window.showErrorMessage("Error updating language model provider: " + error);
            });
    }
    
    async function _chatSendMessage(_message: messages.IMessage, postMessage: (message: messages.IMessage) => void) {
        const chatSendApiMessage = _message as messages.MessageApiChatSendMessage;
        const files: File[] = [];

        // Convert api.ChatHistoryMessageFile to File
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
                    const messsage: messages.MessageStoreAppendToLastChatAssistantMessage = {
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
