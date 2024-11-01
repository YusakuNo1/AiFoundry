import { type messages } from "aifoundry-vscode-shared";
import AppUrls from "./AppUrls";
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
                const _message = event.data as messages.MessageSetPageContext;
                let pageUrl: string | null = null;

                switch (_message.pageType) {
                    case "modelPlayground": {
                        pageUrl = AppUrls.buildPageUrl(AppUrls.AifRoute.ModelPlaygroundPage);
                        break;
                    }
                    case "embeddings": {
                        const embeddingId = (event.data as messages.MessageSetPageContextEmbeddings).data;
                        pageUrl = AppUrls.buildPageUrl(AppUrls.AifRoute.EmbeddingDetailsPage, [embeddingId]);
                        break;
                    }
                    case "agents": {
                        const agentId = (event.data as messages.MessageSetPageContextAgentDetails).data;
                        pageUrl = AppUrls.buildPageUrl(AppUrls.AifRoute.AgentDetailsPage, [agentId]);
                        break;
                    }
                    case "page-updateLmProvider": {
                        const lmProviderId = (event.data as messages.MessageSetPageContextUpdateLmProvider).data;
                        pageUrl = AppUrls.buildPageUrl(AppUrls.AifRoute.LmProviderUpdatePage, [lmProviderId]);
                        break;
                    }
                    case "functions": {
                        const functionId = (event.data as messages.MessageSetPageContextFunctions).data;
                        pageUrl = AppUrls.buildPageUrl(AppUrls.AifRoute.FunctionDetailsPage, [functionId]);
                        break;
                    }
                }

                if (pageUrl) {
                    store.dispatch(pageInfoSlice.actions.setPageUrl(pageUrl));
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
