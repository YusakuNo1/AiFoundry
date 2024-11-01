import React from "react";
import { Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbDivider,
} from "@fluentui/react-components";
import { type misc } from "aifoundry-vscode-shared";

function RenderCurrentPage(props: { pageType: misc.PageType }) {
    const pageName = (props.pageType === "embeddings") ? "Embedding Details" :
        (props.pageType === "agents") ? "Agent Details" :
        (props.pageType === "modelPlayground") ? "Playground" :
        (props.pageType === "functions") ? "Function Details" : 
        (props.pageType === "page-updateLmProvider") ? "Update Language Model Provider" : null;

    if (!pageName) {
        return null;
    } else {
        return (<>
            <BreadcrumbDivider />
            <BreadcrumbItem>{pageName}</BreadcrumbItem>
        </>);    
    }
}

function AppBreadcrumb(props: { pageType: misc.PageType }) {
    return (
        <Breadcrumb aria-label="breadcrumb" style={{ padding: 8 }}>
            <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
            {props.pageType !== "home" && <RenderCurrentPage pageType={props.pageType} />}
        </Breadcrumb>
    );
}

export default AppBreadcrumb;
