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
export type PageContextEmbeddings = IPageContext & { data: EmbeddingEntity };
export type PageContextAgentDetails = IPageContext & { data: AgentEntity };
export type PageContextModelPlayground = IPageContext & { data: {
    aifAgentUri: string,
    outputFormat: TextFormat,
} };
export type PageContextFunctions = IPageContext & { data: FunctionEntity };
export type PageContextUpdateLmProvider = IPageContext & { data: { lmProviderId: string } };
export type PageContext = PageContextEmbeddings | PageContextAgentDetails | PageContextModelPlayground;

export type MessageSetPageContextHome = shared.IMessage & PageContextHome;
export type MessageSetPageContextEmbeddings = shared.IMessage & PageContextEmbeddings;
export type MessageSetPageContextAgentDetails = shared.IMessage & PageContextAgentDetails;
export type MessageSetPageContextModelPlayground = shared.IMessage & PageContextModelPlayground;
export type MessageSetPageContextFunctions = shared.IMessage & PageContextFunctions;
export type MessageSetPageContextUpdateLmProvider = shared.IMessage & PageContextUpdateLmProvider;
export type MessageSetPageContext =
    MessageSetPageContextHome |
    MessageSetPageContextEmbeddings |
    MessageSetPageContextAgentDetails |
    MessageSetPageContextModelPlayground |
    MessageSetPageContextFunctions |
    MessageSetPageContextUpdateLmProvider
;
