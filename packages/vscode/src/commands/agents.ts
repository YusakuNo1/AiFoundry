'use strict';
import * as vscode from 'vscode';
import type { types } from 'aifoundry-vscode-shared';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import AgentsAPI from '../api/AgentsAPI';
import LanguageModelsAPI from '../api/LanguageModelsAPI';
import { IViewProvider } from '../viewProviders/base';
import CommandUtils from './utils';
import FunctionsAPI from '../api/FunctionsAPI';

namespace AgentsCommands {
	export function setupCommands(context: vscode.ExtensionContext, agentsViewProvider: IViewProvider) {
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryAgents.refresh', () => agentsViewProvider.refresh()));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryAgents.create', () => {
			startcreateAgentFlow(agentsViewProvider);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryAgents.updateName', (params) => {
			const id = params?.contextValue;
			if (!id) {
				vscode.window.showErrorMessage('Please select an agent to update');
				return;
			}

			const oldName = params?.label;
			startupdateAgentNameFlow(agentsViewProvider, id, oldName);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryAgents.delete', (params) => {
			const id = params?.contextValue;
			if (!id) {
				vscode.window.showErrorMessage('Please select an agent to update');
				return;
			}

			startdeleteAgentFlow(agentsViewProvider, id);
		}));
	}

	export function startcreateAgentFlow(agentsViewProvider: IViewProvider) {
		const defaultName = `Agent-${new Date().toISOString().replace(/[^0-9]/g, '')}`;
		CommandUtils.chooseText('Agent Name', defaultName, 'New agent name').then(result => {
			// if result is undefined, the user cancelled the input box
			if (result) {
				_showChatLlmOptions(true, agentsViewProvider, result ?? defaultName);
			}
		});
	}

	export function startupdateAgentNameFlow(agentsViewProvider: IViewProvider, id: string, oldName: string | undefined) {
		CommandUtils.chooseText('Agent Name', oldName, 'New agent name')
			.then(result => {
				// if result is undefined, the user cancelled the input box
				if (result) {
					const name = result;
					AgentsAPI.list().then((response) => {
						const agent = response.agents.find(agent => agent.id === id);
						if (!agent) {
							throw new Error('Agent not found');
						} else {
							return agent;
						}
					}).then((agent) => {
						const newAgent = { ...agent, name };
						return AgentsAPI.updateAgent(newAgent.id, newAgent.agent_uri, newAgent.base_model_uri, newAgent.name, newAgent.system_prompt, newAgent.rag_asset_ids, newAgent.function_asset_ids).then(() => {
							agentsViewProvider.refresh(id);
							vscode.window.showInformationMessage('Agent name is updated');
						});	
					}).catch((error) => {
						vscode.window.showErrorMessage(error.message);
					});
				}
			});
	}

	export function startupdateAgentSystemPromptFlow(agentsViewProvider: IViewProvider, id: string, oldSystemPrompt: string | undefined) {
		CommandUtils.chooseText('Agent System Prompt', oldSystemPrompt, 'New system prompt', true)
			.then(result => {
				// if result is undefined, the user cancelled the input box
				if (result !== undefined) {
					result = result ?? "";
					const system_prompt = result;
					AgentsAPI.list().then((response) => {
						const agent = response.agents.find(agent => agent.id === id);
						if (!agent) {
							throw new Error('Agent not found');
						} else {
							return agent;
						}
					}).then((agent) => {
						const newAgent = { ...agent, system_prompt };
						return AgentsAPI.updateAgent(newAgent.id, newAgent.agent_uri, newAgent.base_model_uri, newAgent.name, newAgent.system_prompt, newAgent.rag_asset_ids, newAgent.function_asset_ids).then(() => {
							agentsViewProvider.refresh(id);
							vscode.window.showInformationMessage('Agent name is updated');
						});	
					}).catch((error) => {
						vscode.window.showErrorMessage(error.message);
					});
				}
			});
	}

	export function startdeleteAgentFlow(agentsViewProvider: IViewProvider, id: string) {
		AgentsAPI.deleteAgent(id).then(() => {
			agentsViewProvider.refresh();
			vscode.window.showInformationMessage(`Agent is deleted successfully`);
		})
		.catch((error) => {
			vscode.window.showErrorMessage(error.message);
		});
	}
}

function _showChatLlmOptions(isCreate: boolean, agentsViewProvider: IViewProvider, name: string) {
	LanguageModelsAPI.listLanguageModelsChat().then((response) => {
		const options = Object.fromEntries(response.basemodels.map(basemodel => [`${basemodel.provider}-${basemodel.name}`, basemodel]));
		const quickPick = vscode.window.createQuickPick();
		quickPick.title = 'Select LLM model';

		const items = Object.keys(options).map(key => ({ label: options[key].basemodel_uri, key }));
		items.sort((a, b) => {
			const aWeight = options[a.key].weight;
			const bWeight = options[b.key].weight;
			return bWeight - aWeight;
		});
		quickPick.items = items;

		quickPick.onDidChangeSelection(selection => {
			quickPick.dispose();
			_showEmbeddingAssetIds(isCreate, agentsViewProvider, name, options[(selection[0] as any).key]);
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	});
}

function _showEmbeddingAssetIds(isCreate: boolean, agentsViewProvider: IViewProvider, name: string, model: types.api.LanguageModelInfo) {
	EmbeddingsAPI.getEmbeddings().then((response) => {
		const options = Object.fromEntries(response.embeddings.map(embedding => [embedding.name, embedding]));

		const quickPick = vscode.window.createQuickPick();
		quickPick.title = 'Select embeddings';
		quickPick.canSelectMany = true;
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidAccept((selection) => {
			const embeddings = quickPick.selectedItems.map(item => options[item.label]);
			_showFunctionsAssetIds(isCreate, agentsViewProvider, name, model, embeddings);
			quickPick.dispose();
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	});
}

function _showFunctionsAssetIds(isCreate: boolean, agentsViewProvider: IViewProvider, name: string, model: types.api.LanguageModelInfo, embeddings: types.database.EmbeddingMetadata[]) {
	FunctionsAPI.listFunctions().then((response) => {
		if (response.functions.length === 0) {
			_createOrupdateAgent(isCreate, agentsViewProvider, name, model, embeddings);
			return;
		} else {
			const options = Object.fromEntries(response.functions.map(func => [func.name, func]));

			const quickPick = vscode.window.createQuickPick();
			quickPick.title = 'Select functions';
			quickPick.canSelectMany = true;
			quickPick.items = Object.keys(options).map(label => ({ label }));
			quickPick.onDidAccept((selection) => {
				const functions = quickPick.selectedItems.map(item => options[item.label]);
				_createOrupdateAgent(isCreate, agentsViewProvider, name, model, embeddings, functions);
				quickPick.dispose();
			});
			quickPick.onDidHide(() => quickPick.dispose());
			quickPick.show();	
		}
	});
}

function _createOrupdateAgent(isCreate: boolean, agentsViewProvider: IViewProvider, name: string, modelInfo: types.api.LanguageModelInfo, embeddings: types.database.EmbeddingMetadata[], functions: types.api.FunctionMetadata[] = []) {
	if (isCreate) {
		const ragAssetIds = embeddings.map(embedding => embedding.id);
		const functionAssetIds = functions.map(func => func.id);
		AgentsAPI.createAgent(modelInfo.basemodel_uri, name, undefined, ragAssetIds, functionAssetIds).then(() => {
			agentsViewProvider.refresh();
			vscode.window.showInformationMessage(`Agent ${modelInfo.basemodel_uri} is created`);
		})
		.catch((error) => {
			vscode.window.showErrorMessage(error.message);
		});
	}
}

export default AgentsCommands;
