import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import App from "./app/App";
import { currentTheme } from "./theme/themes";
import { store } from "./store/store";
import { PageContext } from "./contexts";
import PlatformSetup from "./PlatformSetup";

PlatformSetup.init();
const vscode = (globalThis as any).acquireVsCodeApi();

function RootComponent() {
    return (
        <FluentProvider theme={currentTheme()}>
        {/* <FluentProvider theme={teamsDarkTheme}> */}
            <PageContext.Provider value={{ pageType: "home" }}>
                <Provider store={store}>
                    <App vscode={vscode} />
                </Provider>
            </PageContext.Provider>
        </FluentProvider>
    );
}

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <RootComponent />
    </React.StrictMode>
);
