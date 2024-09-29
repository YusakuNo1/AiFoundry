// Mock the VSCode extension API when running in a non-VSCode environment, e.g. HTML
export function mockVSCodeExt() {
    const aifMode = document.getElementById("root")?.getAttribute("aif-config-mode");
    if (aifMode !== "vscodeext") {
        (globalThis as any).acquireVsCodeApi = () => {
            return {
                postMessage: (message: any) => {
                    // Test: if a editInfo message is sent, response with a message of page update
                    if (message.aifMessageType === "editInfo" && message.type === "UpdateEmbeddingName") {
                        const data = {
                            id: "13d2c85da52e4225b81c788859b429ad",
                            agentUri: "ollama://mxbai-embed-large-david-test",
                            name: "david-test-name",
                            vs_provider: "faiss",
                        }
                        window.postMessage({ aifMessageType: "setPageType", pageType: "embeddings", data }, "*");
                    }
                }
            };
        }
    }
}
