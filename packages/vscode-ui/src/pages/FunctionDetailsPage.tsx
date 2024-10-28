import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { type messages } from "aifoundry-vscode-shared";
import { consts } from "aifoundry-vscode-shared";
import BasePage from "./BasePage";
import ConfigUtils from "../utils/ConfigUtils";


interface Props {
    onPostMessage: (message: messages.IMessage) => void;
}

const FunctionDetailsPage: React.FC<Props> = (props: Props) => {
    const functions = useSelector((state: RootState) => state.serverData.functions);
    const functionId = useSelector((state: RootState) => state.serverData.functionId);

    React.useEffect(() => {
        const message: messages.MessageApiListFunctions = {
            aifMessageType: "api",
            type: "api:listFunctions",
            data: {},
        };
        props.onPostMessage(message);
    }, [props]);

    // We can't use "function" because it's a reserved keyword
    const functionInfo = React.useMemo(() => {
        return functions.find((f) => f.id === functionId);
    }, [functionId, functions]);

    const homeDir = React.useMemo(() => {
        return ConfigUtils.getConfig(consts.AifConfig.homedir);
    }, []);

    const linkUri = React.useMemo(() => {
        return `${homeDir}/${consts.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME}/${consts.ASSETS_FOLDER_NAME}/${consts.FUNCTIONS_FOLDER_NAME}/${functionInfo?.functions_path}/${functionInfo?.functions_name}.py`;
    }, [functionInfo, homeDir]);

    const onPostMessage = React.useCallback((type: messages.MessageEditInfoFunctionsType) => {
        if (!functionInfo) {
            return;
        }

        const aifMessageType = "editInfo";
        if (type === "function:update:name") {
            const message: messages.MessageEditInfoFunctionUpdateName = {
                aifMessageType,
                type,
                data: {
                    id: functionInfo.id,
                    name: functionInfo.name ?? "",
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
    }, [props, linkUri, functionInfo]);

    if (!functionInfo) {
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
                { type: "label", key: "id", label: "ID", item: { name: functionInfo.id } },
                { type: "label", key: "name", label: "Name", item: { name: functionInfo.name ?? "", onClick: () => onPostMessage("function:update:name") }},
                { type: "label", key: "uri", label: "URI", item: { name: functionInfo.uri } },
                { type: "label", key: "link", label: "Location", item: { name: linkUri, onClick: () => onPostMessage("function:openfile") }},
            ]}
            actionButtons={[]}
        />
    )
};

export default FunctionDetailsPage;
