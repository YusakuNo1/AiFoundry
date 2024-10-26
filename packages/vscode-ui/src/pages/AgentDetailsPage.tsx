import * as React from "react";
import { useSelector } from "react-redux";
import { api, consts, type database, type messages } from "aifoundry-vscode-shared";
import { store } from "../store/store";
import { pageInfoSlice } from "../store/pageInfoSlice";
import BasePage, { RowSelectionItem } from "./BasePage";
import { chatInfoSlice } from "../store/chatInfoSlice";
import { RootState } from '../store/store';


interface Props {
    // data: database.AgentEntity;
    onPostMessage: (message: messages.IMessage) => void;
}

const AgentDetailsPage: React.FC<Props> = (props: Props) => {
    const [outputFormatIndex, setOutputFormatIndex] = React.useState<number>(api.TextFormats.indexOf(api.defaultTextFormat));
    const embeddings = useSelector((state: RootState) => state.serverData.embeddings);
    const functions = useSelector((state: RootState) => state.serverData.functions);
    const agentId = useSelector((state: RootState) => state.serverData.agentId);
    const agents = useSelector((state: RootState) => state.serverData.agents);

    React.useEffect(() => {
        const message: messages.MessageApiGetAgents = {
            aifMessageType: "api",
            type: "api:getAgents",
            data: {},
        };
        props.onPostMessage(message);
    }, [props]);

    React.useEffect(() => {
        const messageApiGetEmbeddings: messages.MessageApiGetEmbeddings = {
            aifMessageType: "api",
            type: "api:getEmbeddings",
            data: {},
        };
        props.onPostMessage(messageApiGetEmbeddings);
    }, [props]);

    React.useEffect(() => {
        if (consts.AppConfig.ENABLE_FUNCTIONS) {
            const messageApiGetFunctions: messages.MessageApiListFunctions = {
                aifMessageType: "api",
                type: "api:listFunctions",
                data: {},
            };
            props.onPostMessage(messageApiGetFunctions);
        }
    }, [props]);

    const agent = React.useMemo(() => {
        return agents.find((e) => e.id === agentId);
    }, [agentId, agents]);

    const embeddingMap = React.useMemo(() => {
        const map: Record<string, api.EmbeddingEntity> = {};
        embeddings.forEach(embedding => map[embedding.id] = embedding);
        return map;
    }, [embeddings]);

    const functionMap = React.useMemo(() => {
        const map: Record<string, api.FunctionEntity> = {};
        functions.forEach(func => map[func.id] = func);
        return map;
    }, [functions]);

    const onPostMessage = React.useCallback((type: messages.MessageEditInfoAgentsType) => {
        if (!agent) {
            return;
        }

        const aifMessageType = "editInfo";
        if (type === "agent:update:name") {
            const message: messages.MessageEditInfoAgentName = {
                aifMessageType,
                type,
                data: {
                    name: agent.name,
                    id: agent.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "agent:update:systemPrompt") {
            const message: messages.MessageEditInfoAgentsystemPrompt = {
                aifMessageType,
                type,
                data: {
                    systemPrompt: agent.systemPrompt,
                    id: agent.id,
                },
            };
            props.onPostMessage(message);
        } else if (type === "agent:delete") {
            const message: messages.MessageEditInfodeleteAgent = {
                aifMessageType,
                type,
                data: {
                    id: agent.id,
                },
            };
            props.onPostMessage(message);
        }
    }, [props, agent]);

    const onShowModelPlayground = React.useCallback(() => {
        if (!agent) {
            return;
        }

        store.dispatch(chatInfoSlice.actions.reset());
        const pageContext: messages.PageContextModelPlayground = {
            pageType: "modelPlayground",
            data: {
                aifAgentUri: agent.agentUri,
                outputFormat: api.TextFormats[outputFormatIndex],
            }
        };
        store.dispatch(pageInfoSlice.actions.setPageContext(pageContext));
    }, [agent, outputFormatIndex]);

    const outputFormatOptions: string[] = React.useMemo(() => {
        return api.TextFormats.map(key => key);
    }, []);

    const onChangeOutputFormat = React.useCallback((value: string) => {
        const index = api.TextFormats.indexOf(value as api.TextFormat); // Ensure index is valid
        setOutputFormatIndex(index);
    }, [setOutputFormatIndex]);

    const ragAssetsItems = React.useMemo(() => {
        return agent?.ragAssetIds?.map(id => {
            const name = embeddingMap[id]?.name ? `${embeddingMap[id].name} (${id})` : id;
            return { name };
        }) ?? [];
    }, [agent, embeddingMap]);

    const functionAssetsItems = React.useMemo(() => {
        return agent?.functionAssetIds?.map(id => {
            const name = functionMap[id]?.name ? `${functionMap[id].name} (${id})` : id;
            return { name };
        }) ?? [];
    }, [agent, functionMap]);

    if (!agent) {
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
                // { type: "label", key: "id", label: "ID", item: { name: agent.id }},
                { type: "label", key: "name", label: "Name", item: { name: agent.name, onClick: () => onPostMessage("agent:update:name") }},
                { type: "label", key: "agentUri", label: "URI", item: { name: agent.agentUri }},
                { type: "label", key: "basemodelUri", label: "Base Model", item: { name: agent.basemodelUri }},
                { type: "label", key: "systemPrompt", label: "System Prompt", item: { name: agent.systemPrompt, onClick: () => onPostMessage("agent:update:systemPrompt") }},
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
