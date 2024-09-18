import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbDivider,
    Link,
} from "@fluentui/react-components";
import "./App.css";
import type { types } from "aifoundry-vscode-shared";
import HomePage from "./pages/HomePage";
import EmbeddingDetailsPage from "./pages/EmbeddingDetailsPage";
import AgentDetailsPage from "./pages/AgentDetailsPage";
import ModelPlaygroundPage from "./pages/ModelPlaygroundPage";
import FunctionDetailsPage from "./pages/FunctionDetailsPage";
import LmProviderUpdatePage from "./pages/LmProviderUpdatePage";
import Layout from "./Layout";
import { RootState, store } from "./store/store";
import { setPageContext } from "./store/pageInfoSlice";
import { appendChatUserMessage } from "./store/chatInfoSlice";
import type { VSCodeInterface } from './types';
import AppEventUtils from "./AppEventUtils";


type Props = {
    vscode: VSCodeInterface;
}

function App(props: Props) {
    const pageContext = useSelector((state: RootState) => state.pageInfo.pageContext);

    const onPostMessage = React.useCallback((message: types.IMessage) => {
        // For chat messages, update Redux first
        if (message.aifMessageType === "api") {
            if ((message as types.MessageApi).type === "chat:sendMessage") {
                store.dispatch(appendChatUserMessage({
                    content: (message as types.MessageApiChatSendMessage).data.input,
                    contentTextFormat: (message as types.MessageApiChatSendMessage).data.contentTextFormat,
                }));
            }
        }

        props.vscode.postMessage(message);
    }, [props.vscode]);

    React.useEffect(() => {
        // For some reasons, this useEffect will be called 2 times when the app is loaded, which causes the event listeners to be registered 2 times
        // and the ready message to be sent twice. The solution is to check it within registerEvents function.
        const result = AppEventUtils.registerEvents();
        if (result) {
            const readyMessage: types.IMessage = { aifMessageType: "webapp:ready" };
            onPostMessage(readyMessage);
        }
    }, [onPostMessage]);

    const onClickHome = React.useCallback(() => store.dispatch(setPageContext({ pageType: "home" })), []);

    function renderCurrentPage() {
        const pageName = (pageContext?.pageType === "embeddings") ? "Embedding Details" :
            (pageContext?.pageType === "agents") ? "Agent Details" :
            (pageContext?.pageType === "modelPlayground") ? "Playground" :
            (pageContext?.pageType === "functions") ? "Function Details" : 
            (pageContext?.pageType === "page:updateLmProvider") ? "Update Language Model Provider" : null;

        if (!pageName) {
            return null;
        } else {
            return (<>
                <BreadcrumbDivider />
                <BreadcrumbItem>{pageName}</BreadcrumbItem>
            </>);    
        }
    }

    const routeMap: Record<types.IPageContextPageType, React.ReactNode> = React.useMemo(() => ({
        "home": <HomePage vscode={props.vscode} />,
        "embeddings": <EmbeddingDetailsPage
            data={(pageContext as types.PageContextEmbeddings).data}
            onPostMessage={onPostMessage}
        />,
        "agents": <AgentDetailsPage
            data={(pageContext as types.PageContextAgentDetails).data}
            onPostMessage={onPostMessage}
        />,
        "modelPlayground": <ModelPlaygroundPage
            aifAgentUri={(pageContext as types.PageContextModelPlayground).data?.aifAgentUri}
            outputFormat={(pageContext as types.PageContextModelPlayground).data?.outputFormat}
            onPostMessage={onPostMessage}
        />,
        "functions": <FunctionDetailsPage
            data={(pageContext as types.PageContextFunctions).data}
            onPostMessage={onPostMessage}
        />,
        "page:updateLmProvider": <LmProviderUpdatePage
            lmProviderId={(pageContext as types.PageContextUpdateLmProvider).data?.lmProviderId}
            onPostMessage={onPostMessage}
        />,
    }), [props.vscode, pageContext, onPostMessage]);

    return (
        <BrowserRouter>
            <Breadcrumb aria-label="breadcrumb" style={{ padding: 8 }}>
                <BreadcrumbItem><Link onClick={onClickHome}>Home</Link></BreadcrumbItem>
                {pageContext?.pageType !== "home" && renderCurrentPage()}
            </Breadcrumb>

            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={routeMap["home"]} />
                    <Route path="/index.html" element={routeMap["home"]} />
                    {Object.keys(routeMap).filter(key => key !== "home").map(key => (
                        <Route key={key} path={`/${key}`} element={routeMap[key as types.IPageContextPageType]} />
                    ))}
                    <Route path="*" element={routeMap["home"]} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
