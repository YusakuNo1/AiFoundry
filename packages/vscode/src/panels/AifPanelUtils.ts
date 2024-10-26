'use strict';
import * as vscode from 'vscode';
import { type api, type database, type messages } from 'aifoundry-vscode-shared';


namespace AifPanelUtils {
	export const AifPanelCommand = 'AiFoundry.showPanel';

	export function createMessageSetPageEmbeddings(embeddingId: string): messages.MessageSetPageContextEmbeddings {
		return {
			aifMessageType: "setPageType",
			pageType: "embeddings",
			data: embeddingId,
		};
	}

	export function createMessageSetPageAgents(agentId: string): messages.MessageSetPageContextAgentDetails {
		return {
			aifMessageType: "setPageType",
			pageType: "agents",
			data: agentId,
		};
	}

	export function createMessageSetPageFunctions(functionId: string): messages.MessageSetPageContextFunctions {
		return {
			aifMessageType: "setPageType",
			pageType: "functions",
			data: functionId,
		};
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
			data: lmProviderId,
		};
	}
}

export default AifPanelUtils;
