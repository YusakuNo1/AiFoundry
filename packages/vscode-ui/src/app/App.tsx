import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import "./App.css";
import { type messages } from "aifoundry-vscode-shared";
import ConfigUtils from "../utils/ConfigUtils";
import type { VSCodeInterface } from '../types';
import AppEventUtils from "./AppEventUtils";
import AppContent from "./AppContent";

type Props = {
    vscode: VSCodeInterface;
}

function App(props: Props) {
    React.useEffect(() => {
        // For some reasons, this useEffect will be called 2 times when the app is loaded, which causes the event listeners to be registered 2 times
        // and the ready message to be sent twice. The solution is to check it within registerEvents function.
        const result = AppEventUtils.registerEvents();
        if (result) {
            const readyMessage: messages.IMessage = { aifMessageType: "webapp:ready" };
            props.vscode.postMessage(readyMessage);
        }
    }, [props.vscode]);

    if (ConfigUtils.isAifVsCodeExt()) {
        return <MemoryRouter><AppContent vscode={props.vscode} /></MemoryRouter>;
    } else {
        return <BrowserRouter><AppContent vscode={props.vscode} /></BrowserRouter>;
    }
}

export default App;
