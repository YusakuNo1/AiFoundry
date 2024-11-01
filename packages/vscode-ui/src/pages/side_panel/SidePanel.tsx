/**
 * Create side panel which lists the following:
 * - LM Providers
 * - Embeddings
 * - Agents
 * - Functions
 * Code sample: https://react.fluentui.dev/?path=/docs/components-tree--docs
 */

import * as React from "react";
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type api, type messages } from "aifoundry-vscode-shared";
import { RootState } from "../../store/store";
import AppUrls from "../../app/AppUrls";

type ItemProps = {
    text: string;
    url: string;
};

type PageDataType =
    | AppUrls.AifRoute.AgentDetailsPage
    | AppUrls.AifRoute.EmbeddingDetailsPage
    // | AppUrls.AifRoute.FunctionDetailsPage
    | AppUrls.AifRoute.LmProviderUpdatePage;

const RouteNameMap: Record<string, string> = {
    [AppUrls.AifRoute.AgentDetailsPage]: "Agents",
    [AppUrls.AifRoute.EmbeddingDetailsPage]: "Embeddings",
    // [AppUrls.AifRoute.FunctionDetailsPage]: "Functions",
    [AppUrls.AifRoute.LmProviderUpdatePage]: "LM Providers",
};

function _convertAgentEntity(agent: api.AgentEntity): ItemProps {
    const url = AppUrls.buildPageUrl(AppUrls.AifRoute.AgentDetailsPage, [agent.id]);
    return { text: agent.name, url };
}

function _convertEmbeddingEntity(embedding: api.EmbeddingEntity): ItemProps {
    const url = AppUrls.buildPageUrl(AppUrls.AifRoute.EmbeddingDetailsPage, [embedding.id]);
    return { text: embedding.name, url };
}

function _convertLmProviderInfoResponse(lmProvider: api.LmProviderInfoResponse): ItemProps {
    const url = AppUrls.buildPageUrl(AppUrls.AifRoute.LmProviderUpdatePage, [lmProvider.id]);
    return { text: lmProvider.name, url };
}

type Props = {
    onPostMessage: (message: messages.IMessage) => void;
};

function SidePanel(props: Props) {
    const navigate = useNavigate();
    const lmProviders = useSelector((state: RootState) => state.serverData.lmProviders);
    const embeddings = useSelector((state: RootState) => state.serverData.embeddings);
    const agents = useSelector((state: RootState) => state.serverData.agents);

    const serverData: Record<PageDataType, ItemProps[] | null> = React.useMemo(() => ({
        [AppUrls.AifRoute.AgentDetailsPage]: !agents ? null : agents.map(_convertAgentEntity),
        [AppUrls.AifRoute.EmbeddingDetailsPage]: !embeddings ? null : embeddings.map(_convertEmbeddingEntity),
        [AppUrls.AifRoute.LmProviderUpdatePage]: !lmProviders ? null : lmProviders.map(_convertLmProviderInfoResponse),
    }), [agents, embeddings, lmProviders]);

    // API call to update agents
    React.useEffect(() => {
        if (serverData[AppUrls.AifRoute.AgentDetailsPage] === null) {
            const message: messages.MessageApiGetAgents = {
                aifMessageType: "api",
                type: "api:getAgents",
                data: {},
            };
            props.onPostMessage(message);
        }
    }, [serverData, props]);

    // Update agents
    React.useEffect(() => {
        if (agents !== null) {
            serverData[AppUrls.AifRoute.AgentDetailsPage] = agents.map(_convertAgentEntity);
        }
    }, [serverData, agents]);

    // API call to update embeddings
    React.useEffect(() => {
        if (serverData[AppUrls.AifRoute.EmbeddingDetailsPage] === null) {
            const messageApiGetEmbeddings: messages.MessageApiGetEmbeddings = {
                aifMessageType: "api",
                type: "api:getEmbeddings",
                data: {},
            };
            props.onPostMessage(messageApiGetEmbeddings);
        }
    }, [serverData, props]);

    // Update embeddings
    React.useEffect(() => {
        if (embeddings !== null) {
            serverData[AppUrls.AifRoute.EmbeddingDetailsPage] = embeddings.map(_convertEmbeddingEntity);
        }
    }, [serverData, embeddings]);

    // API call to update LM providers
    React.useEffect(() => {
        if (serverData[AppUrls.AifRoute.LmProviderUpdatePage] === null) {
            const messageApiListLmProviders: messages.MessageApiListLmProviders = {
                aifMessageType: "api",
                type: "api:listLmProviders",
                data: {},
            };
            props.onPostMessage(messageApiListLmProviders);
        }
    }, [serverData, props]);

    // Update LM providers
    React.useEffect(() => {
        if (lmProviders !== null) {
            serverData[AppUrls.AifRoute.LmProviderUpdatePage] = lmProviders.map(_convertLmProviderInfoResponse);
        }
    }, [serverData, lmProviders]);

    return (
        <Tree aria-label="Default Layout">
            {Object.entries(serverData).map(([key, value]) => {
                if (value === null) {
                    return null;
                } else {
                    return (
                        <TreeItem itemType="branch" key={key}>
                            <TreeItemLayout>{RouteNameMap[key]}</TreeItemLayout>
                            <Tree>
                                {value.map((item, index) => (
                                    <TreeItem itemType="leaf" key={index} onClick={() => navigate(item.url)}>
                                        <TreeItemLayout>{item.text}</TreeItemLayout>
                                    </TreeItem>
                                ))}
                            </Tree>
                        </TreeItem>
                    );    
                }
            })}
        </Tree>
    );
}

export default SidePanel;
