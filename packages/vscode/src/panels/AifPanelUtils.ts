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
			pageType: "page-updateLmProvider",
			data: lmProviderId,
		};
	}

	export function createMessageStoreUpdateAgents(agents: api.AgentEntity[]): messages.MessageStoreUpdateAgents {
		const message: messages.MessageStoreUpdateAgents = {
			aifMessageType: 'store:update',
			type: 'updateAgents',
			data: { agents },
		};
		return message;
	}

	export function createMessageStoreUpdateEmbeddings(embeddings: api.EmbeddingEntity[]): messages.MessageStoreUpdateEmbeddings {
		const message: messages.MessageStoreUpdateEmbeddings = {
			aifMessageType: 'store:update',
			type: 'updateEmbeddings',
			data: { embeddings },
		};
		return message;
	}

	export function createMessageStoreUpdateFunctions(functions: api.FunctionEntity[]): messages.MessageStoreUpdateFunctions {
		const message: messages.MessageStoreUpdateFunctions = {
			aifMessageType: 'store:update',
			type: 'updateFunctions',
			data: { functions },
		};
		return message;
	}
}

export default AifPanelUtils;
