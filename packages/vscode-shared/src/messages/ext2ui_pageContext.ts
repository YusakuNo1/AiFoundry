import { FunctionEntity } from '../api/functions';
import { EmbeddingEntity } from '../database/EmbeddingEntity';
import { AgentEntity } from '../database/AgentEntity';
import { TextFormat } from '../api/chat';
import * as shared from "./shared";

export type IPageContextPageType = "home" | "embeddings" | "agents" | "modelPlayground" | "functions" | "page:updateLmProvider";
export type IPageContext = {
    pageType: IPageContextPageType;
};

export type PageContextHome = IPageContext;
export type PageContextEmbeddings = IPageContext & { data: string }; // embeddingId
export type PageContextAgentDetails = IPageContext & { data: string }; // agentId
export type PageContextModelPlayground = IPageContext & { data: {
    aifAgentUri: string,
    outputFormat: TextFormat,
} };
export type PageContextFunctions = IPageContext & { data: string }; // functionId
export type PageContextUpdateLmProvider = IPageContext & { data: string }; // lmProviderId
export type PageContext = PageContextEmbeddings | PageContextAgentDetails | PageContextModelPlayground;

export type MessageSetPageContextHome = shared.IMessage & PageContextHome;
export type MessageSetPageContextAgents = shared.IMessage & PageContextAgentDetails;
export type MessageSetPageContextEmbeddings = shared.IMessage & PageContextEmbeddings;
export type MessageSetPageContextAgentDetails = shared.IMessage & PageContextAgentDetails;
export type MessageSetPageContextModelPlayground = shared.IMessage & PageContextModelPlayground;
export type MessageSetPageContextFunctions = shared.IMessage & PageContextFunctions;
export type MessageSetPageContextUpdateLmProvider = shared.IMessage & PageContextUpdateLmProvider;
export type MessageSetPageContext =
    MessageSetPageContextHome |
    MessageSetPageContextAgents |
    MessageSetPageContextEmbeddings |
    MessageSetPageContextAgentDetails |
    MessageSetPageContextModelPlayground |
    MessageSetPageContextFunctions |
    MessageSetPageContextUpdateLmProvider
;
