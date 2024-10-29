import { type messages } from "aifoundry-vscode-shared";
import { store } from "../store/store";
import { pageInfoSlice } from "../store/pageInfoSlice";
import {
    appendChatAssistantMessage,
    appendToLastChatAssistantMessage,
    updateLastChatAssistantMessage,
} from "../store/chatInfoSlice";
import {
    updateAgents,
    updateEmbeddings,
    updateFunctions,
    updateLmProviders,
} from "../store/serverDataSlice";


namespace AppEventUtils {
    let isRegistered = false;

    export function registerEvents(): boolean {
        if (isRegistered) {
            return false;
        }

        isRegistered = true;
        window.addEventListener("message", (event) => {
            if (event.data?.aifMessageType === "setPageType") {
                if (event.data.pageType === "embeddings") {
                    const embeddingId = (event.data as messages.MessageSetPageContextEmbeddings).data;
                    store.dispatch(pageInfoSlice.actions.setPageUrl(`/embeddings/${embeddingId}`));
                } else if (event.data.pageType === "agents") {
                    const agentId = (event.data as messages.MessageSetPageContextAgentDetails).data;
                    store.dispatch(pageInfoSlice.actions.setPageUrl(`/agents/${agentId}`));
                } else if (event.data.pageType === "page:updateLmProvider") {
                    const lmProviderId = (event.data as messages.MessageSetPageContextUpdateLmProvider).data;
                    store.dispatch(pageInfoSlice.actions.setPageUrl(`/updateLmProvider/${lmProviderId}`));
                } else if (event.data.pageType === "functions") {
                    const functionId = (event.data as messages.MessageSetPageContextFunctions).data;
                    store.dispatch(pageInfoSlice.actions.setPageUrl(`/functions/${functionId}`));
                }
            } else if (event.data?.aifMessageType === "store:update") {
                const message: messages.IStoreUpdate = event.data;
                if (message.type === "appendChatAssistantMessage") {
                    const data = (
                        message as messages.MessageStoreAppendChatAssistantMessage
                    ).data;
                    store.dispatch(
                        appendChatAssistantMessage({
                            aifSessionId: data.aifSessionId,
                            content: data.content,
                            contentTextFormat: data.contentTextFormat,
                        })
                    );
                } else if (message.type === "appendToLastChatAssistantMessage") {
                    const data = (
                        message as messages.MessageStoreAppendToLastChatAssistantMessage
                    ).data;
                    store.dispatch(
                        appendToLastChatAssistantMessage({
                            aifSessionId: data.aifSessionId,
                            chunk: data.chunk,
                            contentTextFormat: data.contentTextFormat,
                        })
                    );
                } else if (message.type === "updateLastChatAssistantMessage") {
                    const data = (message as messages.MessageStoreAppendChatAssistantMessage).data;
                    store.dispatch(updateLastChatAssistantMessage(data));
                } else if (message.type === "updateLmProviders") {
                    const data = (message as messages.MessageStoreUpdateLmProviders).data;
                    store.dispatch(updateLmProviders(data.lmProviders));
                } else if (message.type === "updateAgents") {
                    const data = (message as messages.MessageStoreUpdateAgents).data;
                    store.dispatch(updateAgents(data.agents));
                } else if (message.type === "updateEmbeddings") {
                    const data = (message as messages.MessageStoreUpdateEmbeddings).data;
                    store.dispatch(updateEmbeddings(data.embeddings));
                } else if (message.type === "updateFunctions") {
                    const data = (message as messages.MessageStoreUpdateFunctions).data;
                    store.dispatch(updateFunctions(data.functions));
                }
            }
        });
        return true;
    }
}

export default AppEventUtils;