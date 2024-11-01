import React from "react";
import { Outlet } from "react-router-dom";
import { Stack } from "@fluentui/react";
import ConfigUtils from "../utils/ConfigUtils";
import SidePanel from "../pages/side_panel/SidePanel";

const Layout = () => {
    if (!ConfigUtils.isAifVsCodeExt()) {
        return (
            <Stack horizontal>
                <SidePanel />
                <Outlet />
            </Stack>
        )
    }
    return (
        <Outlet />
    );
};

export default Layout;
