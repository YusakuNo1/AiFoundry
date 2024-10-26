import * as shared from "./shared";
import { PageType } from '../misc/common';

export type IPageContext = {
    pageType: PageType;
};

type PageContextEmbeddings = IPageContext & { data: string }; // embeddingId
type PageContextAgentDetails = IPageContext & { data: string }; // agentId
type PageContextFunctions = IPageContext & { data: string }; // functionId
type PageContextUpdateLmProvider = IPageContext & { data: string }; // lmProviderId

export type MessageSetPageContextEmbeddings = shared.IMessage & PageContextEmbeddings;
export type MessageSetPageContextAgentDetails = shared.IMessage & PageContextAgentDetails;
export type MessageSetPageContextFunctions = shared.IMessage & PageContextFunctions;
export type MessageSetPageContextUpdateLmProvider = shared.IMessage & PageContextUpdateLmProvider;
export type MessageSetPageContext =
    MessageSetPageContextEmbeddings |
    MessageSetPageContextAgentDetails |
    MessageSetPageContextFunctions |
    MessageSetPageContextUpdateLmProvider
;
