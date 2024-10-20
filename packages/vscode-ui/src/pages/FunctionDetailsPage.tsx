import * as React from "react";
import { type api, type messages } from "aifoundry-vscode-shared";
import { consts } from "aifoundry-vscode-shared";
import BasePage from "./BasePage";
import ConfigUtils from "../utils/ConfigUtils";


interface Props {
    data: api.FunctionMetadata;
    onPostMessage: (message: messages.IMessage) => void;
}

const FunctionDetailsPage: React.FC<Props> = (props: Props) => {
    const homeDir = React.useMemo(() => {
        return ConfigUtils.getConfig(consts.AifConfig.homedir);
    }, []);

    const linkUri = React.useMemo(() => {
        return `${homeDir}/${consts.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME}/${consts.ASSETS_FOLDER_NAME}/${consts.FUNCTIONS_FOLDER_NAME}/${props.data?.functions_path}/${props.data?.functions_name}.py`;
    }, [props.data, homeDir]);

    const onPostMessage = React.useCallback((type: messages.MessageEditInfoFunctionsType) => {
        const aifMessageType = "editInfo";
        if (type === "function:update:name") {
            const message: messages.MessageEditInfoFunctionUpdateName = {
                aifMessageType,
                type,
                data: {
                    id: props.data.id,
                    name: props.data.name ?? "",
                },
            };
            props.onPostMessage(message);    
        } else if (type === "function:openfile") {
            const message: messages.MessageEditInfoFunctionOpenFile = {
                aifMessageType,
                type,
                data: { uri: linkUri },
            };
            props.onPostMessage(message);
        }
    }, [props, linkUri]);

    if (!props.data) {
        // With React router, the page might be rendered before switching to the correct page
        return null;
    }

    return (
        <BasePage
            title="Function Details"
            columnStyles={[
                { width: "20%" },
                { width: "70%" },
                { width: "10%" },
            ]}
            rows={[
                { type: "label", key: "id", label: "ID", item: { name: props.data.id } },
                { type: "label", key: "name", label: "Name", item: { name: props.data.name ?? "", onClick: () => onPostMessage("function:update:name") }},
                { type: "label", key: "uri", label: "URI", item: { name: props.data.uri } },
                { type: "label", key: "link", label: "Location", item: { name: linkUri, onClick: () => onPostMessage("function:openfile") }},
            ]}
            actionButtons={[]}
        />
    )
};

export default FunctionDetailsPage;
