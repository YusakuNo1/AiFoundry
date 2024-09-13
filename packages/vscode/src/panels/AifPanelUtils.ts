'use strict';
import * as vscode from 'vscode';
import type { types } from 'aifoundry-vscode-shared';


namespace AifPanelUtils {
	export const AifPanelCommand = 'AiFoundry.showPanel';

	export function createMessageSetPageHome(): types.MessageSetPageContextHome {
		return {
			aifMessageType: "setPageType",
			pageType: "home",
		};
	}

	export function createCommandShowAifPanelHome(): vscode.Command {
		const message = createMessageSetPageHome();
		return createCommandShowAifPanel(message);
	}

	export function createMessageSetPageEmbeddings(embeddingInfo: types.api.EmbeddingInfo): types.MessageSetPageContextEmbeddings {
		return {
			aifMessageType: "setPageType",
			pageType: "embeddings",
			data: embeddingInfo,
		};
	}

	export function createCommandShowAifPanelEmbeddings(embeddingInfo: types.api.EmbeddingInfo): vscode.Command {
		const message = createMessageSetPageEmbeddings(embeddingInfo);
		return createCommandShowAifPanel(message);
	}

	export function createMessageSetPageAgents(agentInfo: types.api.AgentInfo): types.MessageSetPageContextAgentDetails {
		return {
			aifMessageType: "setPageType",
			pageType: "agents",
			data: agentInfo,
		};
	}

	export function createCommandShowAifPanelAgents(agentInfo: types.api.AgentInfo): vscode.Command {
		const message = createMessageSetPageAgents(agentInfo);
		return createCommandShowAifPanel(message);
	}

	export function createMessageSetPageFunctions(functionMetadata: types.api.FunctionMetadata): types.MessageSetPageContextFunctions {
		return {
			aifMessageType: "setPageType",
			pageType: "functions",
			data: functionMetadata,
		};
	}

	export function createCommandShowAifPanelFunctions(functionMetadata: types.api.FunctionMetadata): vscode.Command {
		const message = createMessageSetPageFunctions(functionMetadata);
		return createCommandShowAifPanel(message);
	}

	export function createCommandShowAifPanel(message: types.MessageSetPageContext): vscode.Command {
		return {
			title: 'Show AI Foundry Page',
			command: AifPanelCommand,
			arguments: [message],
		};
	}	



	export function createMessageSetPageContextUpdateLmProvider(lmProviderId: string): types.MessageSetPageContextUpdateLmProvider {
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
