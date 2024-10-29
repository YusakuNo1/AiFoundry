import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, MemoryRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbDivider,
} from "@fluentui/react-components";
import "./App.css";
import { type messages, type misc } from "aifoundry-vscode-shared";
import ConfigUtils from "../utils/ConfigUtils";
import HomePage from "../pages/HomePage";
import EmbeddingDetailsPage from "../pages/EmbeddingDetailsPage";
import AgentDetailsPage from "../pages/AgentDetailsPage";
import ModelPlaygroundPage from "../pages/ModelPlaygroundPage";
import FunctionDetailsPage from "../pages/FunctionDetailsPage";
import LmProviderUpdatePage from "../pages/LmProviderUpdatePage";
import Layout from "./Layout";
import { RootState, store } from "../store/store";
// import { setPageUrl } from "./store/pageInfoSlice";
import type { VSCodeInterface } from '../types';
import AppEventUtils from "./AppEventUtils";
import AppContent from "./AppContent";

type Props = {
    vscode: VSCodeInterface;
}

function App(props: Props) {
    // const pageType = useSelector((state: RootState) => state.pageInfo.pageType);

    React.useEffect(() => {
        // For some reasons, this useEffect will be called 2 times when the app is loaded, which causes the event listeners to be registered 2 times
        // and the ready message to be sent twice. The solution is to check it within registerEvents function.
        const result = AppEventUtils.registerEvents();
        if (result) {
            const readyMessage: messages.IMessage = { aifMessageType: "webapp:ready" };
            props.vscode.postMessage(readyMessage);
        }
    }, [props.vscode]);

    // const onClickHome = React.useCallback(() => {
    //     store.dispatch(setPageType("home"));
    // }, []);

    // function renderCurrentPage() {
    //     const pageName = (pageType === "embeddings") ? "Embedding Details" :
    //         (pageType === "agents") ? "Agent Details" :
    //         (pageType === "modelPlayground") ? "Playground" :
    //         (pageType === "functions") ? "Function Details" : 
    //         (pageType === "page:updateLmProvider") ? "Update Language Model Provider" : null;

    //     if (!pageName) {
    //         return null;
    //     } else {
    //         return (<>
    //             <BreadcrumbDivider />
    //             <BreadcrumbItem>{pageName}</BreadcrumbItem>
    //         </>);    
    //     }
    // }

    // const routeMap: Record<misc.PageType, React.ReactNode> = {
    //     "/home": <HomePage vscode={props.vscode} />,
    //     "/embeddings/:embeddingId": <EmbeddingDetailsPage onPostMessage={props.vscode.postMessage} />,
    //     "/agents": <AgentDetailsPage onPostMessage={props.vscode.postMessage} />,
    //     "/modelPlayground": <ModelPlaygroundPage onPostMessage={props.vscode.postMessage} />,
    //     "/functions": <FunctionDetailsPage onPostMessage={props.vscode.postMessage} />,
    //     "/page:updateLmProvider": <LmProviderUpdatePage onPostMessage={props.vscode.postMessage} />,
    // };


    if (ConfigUtils.isAifVsCodeExt()) {
        return <MemoryRouter><AppContent vscode={props.vscode} /></MemoryRouter>;
    } else {
        return <BrowserRouter><AppContent vscode={props.vscode} /></BrowserRouter>;
    }

    // return (
    //     <BrowserRouter>
    //         <AppNavigator />

    //         {/* <Link to="/embeddings">Open Embeddings Page</Link> */}

    //         <Breadcrumb aria-label="breadcrumb" style={{ padding: 8 }}>
    //             <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
    //             {pageType !== "home" && renderCurrentPage()}
    //         </Breadcrumb>

    //         <Routes>
    //             <Route path="/" element={<Layout />}>

    //                 <Route index element={routeMap["home"]} />
    //                 <Route path="/index.html" element={routeMap["home"]} />
    //                 {Object.keys(routeMap).filter(key => key !== "home").map(key => (
    //                     <Route key={key} path={`/${key}`} element={routeMap[key as misc.PageType]} />
    //                 ))}
    //                 <Route path="*" element={routeMap["home"]} />
    //                 <Route path="/embeddings" element={<EmbeddingDetailsPage onPostMessage={props.vscode.postMessage} />} />

    //             </Route>
    //         </Routes>
    //     </BrowserRouter>
    // );
}

export default App;
