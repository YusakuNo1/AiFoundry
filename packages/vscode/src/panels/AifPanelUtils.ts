'use strict';
import * as vscode from 'vscode';
import { type api, type database, type messages } from 'aifoundry-vscode-shared';


namespace AifPanelUtils {
	export const AifPanelCommand = 'AiFoundry.showPanel';

	export function createMessageSetPageHome(): messages.MessageSetPageContextHome {
		return {
			aifMessageType: "setPageType",
			pageType: "home",
		};
	}

	export function createCommandShowAifPanelHome(): vscode.Command {
		const message = createMessageSetPageHome();
		return createCommandShowAifPanel(message);
	}

	export function createMessageSetPageEmbeddings(embeddingInfo: database.EmbeddingMetadata): messages.MessageSetPageContextEmbeddings {
		return {
			aifMessageType: "setPageType",
			pageType: "embeddings",
			data: embeddingInfo,
		};
	}

	export function createCommandShowAifPanelEmbeddings(embeddingInfo: database.EmbeddingMetadata): vscode.Command {
		const message = createMessageSetPageEmbeddings(embeddingInfo);
		return createCommandShowAifPanel(message);
	}

	export function createMessageSetPageAgents(agentInfo: database.AgentMetadata): messages.MessageSetPageContextAgentDetails {
		return {
			aifMessageType: "setPageType",
			pageType: "agents",
			data: agentInfo,
		};
	}

	export function createCommandShowAifPanelAgents(agentInfo: database.AgentMetadata): vscode.Command {
		const message = createMessageSetPageAgents(agentInfo);
		return createCommandShowAifPanel(message);
	}

	export function createMessageSetPageFunctions(functionMetadata: api.FunctionMetadata): messages.MessageSetPageContextFunctions {
		return {
			aifMessageType: "setPageType",
			pageType: "functions",
			data: functionMetadata,
		};
	}

	export function createCommandShowAifPanelFunctions(functionMetadata: api.FunctionMetadata): vscode.Command {
		const message = createMessageSetPageFunctions(functionMetadata);
		return createCommandShowAifPanel(message);
	}

	export function createCommandShowAifPanel(message: messages.MessageSetPageContext): vscode.Command {
		return {
			title: 'Show AI Foundry Page',
			command: AifPanelCommand,
			arguments: [message],
		};
	}	



	export function createMessageSetPageContextUpdateLmProvider(lmProviderId: string): messages.MessageSetPageContextUpdateLmProvider {
		return {
			aifMessageType: "setPageType",
			pageType: "page:updateLmProvider",
			data: {
				lmProviderId,
			}
		};
	}

	export function createCommandSetPageContextUpdateLmProvider(lmProviderId: string): vscode.Command {
		const message = createMessageSetPageContextUpdateLmProvider(lmProviderId);
		return createCommandShowAifPanel(message);
	}
}

export default AifPanelUtils;
