import { type messages } from "aifoundry-vscode-shared";
import { store } from "./store/store";
import { pageInfoSlice } from "./store/pageInfoSlice";
import {
    appendChatAssistantMessage,
    appendToLastChatAssistantMessage,
    updateLastChatAssistantMessage,
} from "./store/chatInfoSlice";
import {
    updateEmbeddings,
    updateFunctions,
    updateLmProviders,
} from "./store/serverDataSlice";


namespace AppEventUtils {
    export let isRegistered = false;

    export function registerEvents(): boolean {
        if (isRegistered) {
            return false;
        }

        isRegistered = true;
        window.addEventListener("message", (event) => {
            if (event.data?.aifMessageType === "setPageType") {
                const message: messages.MessageSetPageContext = event.data;
                store.dispatch(pageInfoSlice.actions.setPageContext(message));
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
