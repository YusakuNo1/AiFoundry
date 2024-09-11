/* eslint-disable no-undef */
let pageType = 'home';

function _showEmbeddingDetailsPage() {
    pageType = 'embeddings';
    window.postMessage({
        aifMessageType: 'setPageType',
        pageType,
        data: {
            id: 'embedding-id',
            name: 'embedding-name',
            vs_provider: 'vs-provider',
            agent_uri: 'model-uri',
        },
    });
}

function _showModelDetailsPage(emptyRags, emptyFunctions) {
    pageType = 'models';
    window.postMessage({
        aifMessageType: 'setPageType',
        pageType,
        data: {
            id: 'model-id',
            agent_uri: 'model-uri',
            name: 'model-name',
            base_model_uri: 'base-model-uri',
            system_prompts: 'system-prompts',
            rag_asset_ids: emptyRags ? [] : ['rag-asset-id1', 'rag-asset-id2', 'rag-asset-id3'],
            function_asset_ids: emptyFunctions ? [] : ['func-call-asset-id1', 'func-call-asset-id2', 'func-call-asset-id3'],
        },
    });
}

function _showModelPlaygroundPage() {
    pageType = 'modelPlayground';
    window.postMessage({
        aifMessageType: 'setPageType',
        pageType,
        data: {
            id: '13d2c85da52e4225b81c788859b429ad',
            name: 'fake name',
            vs_provider: 'fake provider',
            agent_uri: 'fake model uri',
        },
    });
}

function _showFunctionDetailsPage() {
    pageType = 'functions';
    window.postMessage({
        aifMessageType: 'setPageType',
        pageType,
        data: {
            id: '13d2c85da52e4225b81c788859b429ad',
            uri: 'mock function uri',
            name: 'mock function',
            functions_path: 'mock functions path',
            functions_name: 'mock functions name',
        },
    });
}

function _showHomePage() {
    pageType = 'home';
    window.postMessage({
        aifMessageType: 'setPageType',
        pageType,
    });
}

function onClick() {
    _showHomePage();

    // _showModelPlaygroundPage();

    // _showModelDetailsPage(false, false);
    // _showModelDetailsPage(true, false);
    // _showModelDetailsPage(false, true);
    // _showModelDetailsPage(true, true);

    // _showEmbeddingDetailsPage();
    // _showFunctionDetailsPage();
}

function onClickButton1() {
    // globalThis.__aifoundry__ only available local debugging with REACT_APP_AIF_DEBUG=true
    if (globalThis.__aifoundry__) {
        if (pageType === 'modelPlayground') {
            _setModelPlaygroundMessages();
        } else if (pageType === "home") {
            _setHomeStatus("checking");
        }
    }
}

function onClickButton2() {
    // globalThis.__aifoundry__ only available local debugging with REACT_APP_AIF_DEBUG=true
    if (globalThis.__aifoundry__) {
        if (pageType === 'modelPlayground') {
            _appendToLastChatAssistantMessage();
        } else if (pageType === "home") {
            _setHomeStatus("unavailable", "unavailable");
        }
    }
}

function _appendToLastChatAssistantMessage() {
    globalThis.__aifoundry__.store.dispatch({
        type: 'chatInfo/appendToLastChatAssistantMessage',
        payload: {
            aifSessionId: "aifSession-001",
            chunk: "01234",
        },
    });
}

function _setModelPlaygroundMessages() {
    const useLongText = true;
    const userText = useLongText ? "user message... ".repeat(100) : "user message";
    const aiText = useLongText ? "ai message... ".repeat(100) : "ai message";
    
    globalThis.__aifoundry__.store.dispatch({
        type: 'chatInfo/appendChatUserMessage',
        payload: userText,
    });
    globalThis.__aifoundry__.store.dispatch({
        type: 'chatInfo/appendChatAssistantMessage',
        payload: {
            aifSessionId: "aifSession-001",
            message: aiText,
        },
    });
    globalThis.__aifoundry__.store.dispatch({
        type: 'chatInfo/appendChatUserMessage',
        payload: userText,
    });
    globalThis.__aifoundry__.store.dispatch({
        type: 'chatInfo/appendChatAssistantMessage',
        payload: {
            aifSessionId: "aifSession-001",
            message: aiText,
        },
    });
}

function _setHomeStatus(status, serverStatus) {
    globalThis.__aifoundry__.store.dispatch({
        type: 'serverData/updateSystemMenuItemMap',
        payload: {
            systemMenuItemMap: {
                "docker-server": {
                    "id": "docker-server",
                    "name": "Docker Server",
                    status,
                    "iconName": "icon-docker.svg",
                    serverStatus: serverStatus ?? "unknown",
                    "weight": 1
                },
                "ollama": {
                    "id": "ollama",
                    "name": "Ollama",
                    status,
                    "iconName": "icon-ollama.svg",
                    "weight": 10
                },
                "azureopenai": {
                    "id": "azureopenai",
                    "name": "Azure OpenAI",
                    status,
                    "iconName": "icon-azureopenai.svg",
                    "weight": 100
                },
                "openai": {
                    "id": "openai",
                    "name": "OpenAI",
                    status,
                    "iconName": "icon-openai.svg",
                    "weight": 100
                },
                "googlegemini": {
                    "id": "googlegemini",
                    "name": "Google Gemini",
                    status,
                    "iconName": "icon-googlegemini.svg",
                    "weight": 100
                }
            }
        },
    });
}
