import { type messages } from "aifoundry-vscode-shared";
import { api } from "aifoundry-vscode-shared-client";
import { store } from "./store/store";
import { updateEmbeddings } from "./store/serverDataSlice";
import ConfigUtils from "./utils/ConfigUtils";

namespace PlatformSetup {
    export function init() {
        if (!ConfigUtils.isAifVsCodeExt()) {
            // Patch for globalThis.process if it is not defined
            globalThis.process = globalThis.process || {};
            globalThis.process.env = globalThis.process.env || {};

            // Patch VSCode extension API
            (globalThis as any).acquireVsCodeApi = () => {
                return {
                    postMessage: postMessageReact,
                };
            }
        }
    }
}

function postMessageReact(message: messages.IMessage) {
    if (message.aifMessageType === "api") {
        const _message = message as messages.MessageApi;
        if (_message.type === "api:getEmbeddings") {
            const __message = _message as messages.MessageApiGetEmbeddings;
            if (__message.type === "api:getEmbeddings") {
                api.EmbeddingsAPI.getEmbeddings().then((embeddings) => {
                    store.dispatch(updateEmbeddings(embeddings.embeddings));
                });
            }
        }
    }
}

export default PlatformSetup;
