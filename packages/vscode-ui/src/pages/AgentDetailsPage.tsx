import * as React from "react";
import { useSelector } from "react-redux";
import { types } from "aifoundry-vscode-shared";
import { store } from "../store/store";
import { pageInfoSlice } from "../store/pageInfoSlice";
import BasePage, { RowSelectionItem } from "./BasePage";
import { chatInfoSlice } from "../store/chatInfoSlice";
import { RootState } from '../store/store';


interface Props {
    data: types.api.AgentInfo;
    onPostMessage: (message: types.IMessage) => void;
}

const AgentDetailsPage: React.FC<Props> = (props: Props) => {
    const [outputFormat, setOutputFormat] = React.useState<types.api.TextFormat>(types.api.defaultTextFormat);
    const embeddings = useSelector((state: RootState) => state.serverData.embeddings);
    const functions = useSelector((state: RootState) => state.serverData.functions);

    React.useEffect(() => {
        const messageApiGetEmbeddings: types.MessageApiGetEmbeddings = {
            aifMessageType: "api",
            type: "getEmbeddings",
            data: {},
        };
        props.onPostMessage(messageApiGetEmbeddings);

        const messageApiGetFunctions: types.MessageApiListFunctions = {
            aifMessageType: "api",
            type: "listFunctions",
            data: {},
        };
        props.onPostMessage(messageApiGetFunctions);
    }, [props]);

    const embeddingMap = React.useMemo(() => {
        const map: Record<string, types.api.EmbeddingInfo> = {};
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
                    system_prompt: props.data.system_prompt,
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
                aifAgentUri: props.data.agent_uri,
                outputFormat,
            }
        };
        store.dispatch(pageInfoSlice.actions.setPageContext(pageContext));
    }, [props.data?.agent_uri, outputFormat]);

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
        return props.data?.rag_asset_ids?.map(id => {
            const name = embeddingMap[id]?.name ? `${embeddingMap[id].name} (${id})` : id;
            return { name };
        }) ?? [];
    }, [props.data?.rag_asset_ids, embeddingMap]);

    const functionAssetsItems = React.useMemo(() => {
        return props.data?.function_asset_ids?.map(id => {
            const name = functionMap[id]?.name ? `${functionMap[id].name} (${id})` : id;
            return { name };
        }) ?? [];
    }, [props.data?.function_asset_ids, functionMap]);

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
                { type: "label", key: "id", label: "ID", item: { name: props.data?.id }},
                { type: "label", key: "name", label: "Name", item: { name: props.data?.name, onClick: () => onPostMessage("agent:update:name") }},
                { type: "label", key: "agent_uri", label: "URI", item: { name: props.data?.agent_uri }},
                { type: "label", key: "base_model_uri", label: "Base Model URI", item: { name: props.data?.base_model_uri }},
                { type: "label", key: "system_prompt", label: "System Prompt", item: { name: props.data?.system_prompt, onClick: () => onPostMessage("agent:update:systemPrompt") }},
                { type: "collection", key: "rag_asset_ids", label: "RAG Assets", item: ragAssetsItems },
                { type: "collection", key: "function_asset_ids", label: "Function Calling Assets", item: functionAssetsItems },
                { type: "selection", key: "output_format", label: "Output Format", item: outputFormatRow},
            ]} actionButtons={[
                { key: "model-playground", label: "Playground", onClick: () => onShowModelPlayground() },
            ]}
        />
    )
};

export default AgentDetailsPage;
