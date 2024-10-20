import * as React from "react";
import { useSelector } from "react-redux";
import { api, consts, type database, type messages } from "aifoundry-vscode-shared";
import { store } from "../store/store";
import { pageInfoSlice } from "../store/pageInfoSlice";
import BasePage, { RowSelectionItem } from "./BasePage";
import { chatInfoSlice } from "../store/chatInfoSlice";
import { RootState } from '../store/store';


interface Props {
    data: database.AgentEntity;
    onPostMessage: (message: messages.IMessage) => void;
}

const AgentDetailsPage: React.FC<Props> = (props: Props) => {
    const [outputFormatIndex, setOutputFormatIndex] = React.useState<number>(api.TextFormats.indexOf(api.defaultTextFormat));
    const embeddings = useSelector((state: RootState) => state.serverData.embeddings);
    const functions = useSelector((state: RootState) => state.serverData.functions);

    React.useEffect(() => {
        const messageApiGetEmbeddings: messages.MessageApiGetEmbeddings = {
            aifMessageType: "api",
            type: "api:getEmbeddings",
            data: {},
        };
        props.onPostMessage(messageApiGetEmbeddings);

        if (consts.AppConfig.ENABLE_FUNCTIONS) {
            const messageApiGetFunctions: messages.MessageApiListFunctions = {
                aifMessageType: "api",
                type: "api:listFunctions",
                data: {},
            };
            props.onPostMessage(messageApiGetFunctions);
        }
    }, [props]);

    const embeddingMap = React.useMemo(() => {
        const map: Record<string, database.EmbeddingEntity> = {};
        embeddings.forEach(embedding => map[embedding.id] = embedding);
        return map;
    }, [embeddings]);

    const functionMap = React.useMemo(() => {
        const map: Record<string, api.FunctionEntity> = {};
        functions.forEach(func => map[func.id] = func);
        return map;
    }, [functions]);

    const onPostMessage = React.useCallback((type: messages.MessageEditInfoAgentsType) => {
        const aifMessageType = "editInfo";
        if (type === "agent:update:name") {
            const message: messages.MessageEditInfoAgentName = {
                aifMessageType,
                type,
                data: {
                    name: props.data.name,
                    id: props.data.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "agent:update:systemPrompt") {
            const message: messages.MessageEditInfoAgentsystemPrompt = {
                aifMessageType,
                type,
                data: {
                    systemPrompt: props.data.systemPrompt,
                    id: props.data.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "agent:delete") {
            const message: messages.MessageEditInfodeleteAgent = {
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
        const pageContext: messages.PageContextModelPlayground = {
            pageType: "modelPlayground",
            data: {
                aifAgentUri: props.data.agentUri,
                outputFormat: api.TextFormats[outputFormatIndex],
            }
        };
        store.dispatch(pageInfoSlice.actions.setPageContext(pageContext));
    }, [props.data?.agentUri, outputFormatIndex]);

    const outputFormatOptions: string[] = React.useMemo(() => {
        return api.TextFormats.map(key => key);
    }, []);

    const onChangeOutputFormat = React.useCallback((value: string) => {
        const index = api.TextFormats.indexOf(value as api.TextFormat); // Ensure index is valid
        setOutputFormatIndex(index);
    }, [setOutputFormatIndex]);

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
                { type: "selection", key: "output_format", label: "Output Format", item: {
                    selectedIndex: outputFormatIndex,
                    options: outputFormatOptions,
                    onChanged: onChangeOutputFormat,
                }},
            ]} actionButtons={[
                { key: "model-playground", label: "Playground", onClick: () => onShowModelPlayground() },
            ]}
        />
    )
};

export default AgentDetailsPage;
