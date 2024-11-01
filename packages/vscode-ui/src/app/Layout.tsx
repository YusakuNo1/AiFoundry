import React from "react";
import { Outlet } from "react-router-dom";
import { Stack } from "@fluentui/react";
import { type messages } from "aifoundry-vscode-shared";
import ConfigUtils from "../utils/ConfigUtils";
import SidePanel from "../pages/side_panel/SidePanel";

type Props = {
    onPostMessage: (message: messages.IMessage) => void;
};

const Layout = (props: Props) => {
    if (!ConfigUtils.isAifVsCodeExt()) {
        return (
            <Stack horizontal>
                <SidePanel onPostMessage={props.onPostMessage} />
                <Outlet />
            </Stack>
        )
    }
    return (
        <Outlet />
    );
};

export default Layout;
