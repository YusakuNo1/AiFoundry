import * as React from "react";
import { useSelector } from "react-redux";
import { consts, types } from "aifoundry-vscode-shared";
import { store } from "../store/store";
import { pageInfoSlice } from "../store/pageInfoSlice";
import BasePage, { RowSelectionItem } from "./BasePage";
import { chatInfoSlice } from "../store/chatInfoSlice";
import { RootState } from '../store/store';


interface Props {
    data: types.database.AgentMetadata;
    onPostMessage: (message: types.IMessage) => void;
}

const AgentDetailsPage: React.FC<Props> = (props: Props) => {
    const [outputFormat, setOutputFormat] = React.useState<types.api.TextFormat>(types.api.defaultTextFormat);
    const embeddings = useSelector((state: RootState) => state.serverData.embeddings);
    const functions = useSelector((state: RootState) => state.serverData.functions);

    React.useEffect(() => {
        const messageApiGetEmbeddings: types.MessageApiGetEmbeddings = {
            aifMessageType: "api",
            type: "api:getEmbeddings",
            data: {},
        };
        props.onPostMessage(messageApiGetEmbeddings);

        if (consts.AppConfig.ENABLE_FUNCTIONS) {
            const messageApiGetFunctions: types.MessageApiListFunctions = {
                aifMessageType: "api",
                type: "api:listFunctions",
                data: {},
            };
            props.onPostMessage(messageApiGetFunctions);
        }
    }, [props]);

    const embeddingMap = React.useMemo(() => {
        const map: Record<string, types.database.EmbeddingMetadata> = {};
        embeddings.forEach(embedding => map[embedding.id] = embedding);
        return map;
    }, [embeddings]);

    const functionMap = React.useMemo(() => {
        const map: Record<string, types.api.FunctionMetadata> = {};
        functions.forEach(func => map[func.id] = func);
        return map;
    }, [functions]);

    const onPostMessage = React.useCallback((type: types.MessageEditInfoAgentsType) => {
        const aifMessageType = "editInfo";
        if (type === "agent:update:name") {
            const message: types.MessageEditInfoAgentName = {
                aifMessageType,
                type,
                data: {
                    name: props.data.name,
                    id: props.data.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "agent:update:systemPrompt") {
            const message: types.MessageEditInfoAgentsystemPrompt = {
                aifMessageType,
                type,
                data: {
                    systemPrompt: props.data.systemPrompt,
                    id: props.data.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "agent:delete") {
            const message: types.MessageEditInfodeleteAgent = {
                aifMessageType,
                type,
                data: {
                    id: props.data.id,
                },
            };
            props.onPostMessage(message);
        }
    }, [props]);

    const onShowModelPlayground = React.useCallback(() => {
        store.dispatch(chatInfoSlice.actions.reset());
        const pageContext: types.PageContextModelPlayground = {
            pageType: "modelPlayground",
            data: {
                aifAgentUri: props.data.agentUri,
                outputFormat,
            }
        };
        store.dispatch(pageInfoSlice.actions.setPageContext(pageContext));
    }, [props.data?.agentUri, outputFormat]);

    const outputFormatRow: RowSelectionItem = React.useMemo(() => {
        const textFormatKeys = types.api.TextFormats;
        const textFormatValues = types.api.TextFormats.map(key => types.api.TextFormatDisplayNames[key]);
        let options: Record<string, string> = {};
        for (let i=0; i<textFormatKeys.length; i++) {
            options[textFormatValues[i]] = textFormatKeys[i];
        }

        return {
            selectedIndex: 0,
            options,
            onChanged: (value: string) => {
                const index = Math.max(0, textFormatValues.indexOf(value)); // Ensure index is valid
                setOutputFormat(textFormatKeys[index]);
            },
        };
    }, [setOutputFormat]);

    const ragAssetsItems = React.useMemo(() => {
        return props.data?.ragAssetIds?.map(id => {
            const name = embeddingMap[id]?.name ? `${embeddingMap[id].name} (${id})` : id;
            return { name };
        }) ?? [];
    }, [props.data?.ragAssetIds, embeddingMap]);

    const functionAssetsItems = React.useMemo(() => {
        return props.data?.functionAssetIds?.map(id => {
            const name = functionMap[id]?.name ? `${functionMap[id].name} (${id})` : id;
            return { name };
        }) ?? [];
    }, [props.data?.functionAssetIds, functionMap]);

    if (!props.data) {
        // With React router, the page might be rendered before switching to the correct page
        return null;
    }

    return (
        <BasePage
            title="Agent Details"
            columnStyles={[
                { width: "20%" },
                { width: "70%" },
                { width: "10%" },
            ]}
            rows={[
                // { type: "label", key: "id", label: "ID", item: { name: props.data?.id }},
                { type: "label", key: "name", label: "Name", item: { name: props.data?.name, onClick: () => onPostMessage("agent:update:name") }},
                { type: "label", key: "agentUri", label: "URI", item: { name: props.data?.agentUri }},
                { type: "label", key: "basemodelUri", label: "Base Model", item: { name: props.data?.basemodelUri }},
                { type: "label", key: "systemPrompt", label: "System Prompt", item: { name: props.data?.systemPrompt, onClick: () => onPostMessage("agent:update:systemPrompt") }},
                { type: "collection", key: "ragAssetIds", label: "RAG Assets", item: ragAssetsItems },
                // { type: "collection", key: "functionAssetIds", label: "Function Calling Assets", item: functionAssetsItems },
                { type: "selection", key: "output_format", label: "Output Format", item: outputFormatRow},
            ]} actionButtons={[
                { key: "model-playground", label: "Playground", onClick: () => onShowModelPlayground() },
            ]}
        />
    )
};

export default AgentDetailsPage;
