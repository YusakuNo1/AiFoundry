'use strict';
import * as vscode from 'vscode';
import { type api, consts } from 'aifoundry-vscode-shared';
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
						return AgentsAPI.updateAgent(newAgent.agentUri, newAgent.basemodelUri, newAgent.name, newAgent.systemPrompt, newAgent.ragAssetIds, newAgent.functionAssetIds).then(() => {
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
					const systemPrompt = result;
					AgentsAPI.list().then((response) => {
						const agent = response.agents.find(agent => agent.id === id);
						if (!agent) {
							throw new Error('Agent not found');
						} else {
							return agent;
						}
					}).then((agent) => {
						const newAgent = { ...agent, systemPrompt };
						return AgentsAPI.updateAgent(newAgent.agentUri, newAgent.basemodelUri, newAgent.name, newAgent.systemPrompt, newAgent.ragAssetIds, newAgent.functionAssetIds).then(() => {
							agentsViewProvider.refresh(id);
							vscode.window.showInformationMessage('System prompt is updated');
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
	
	export function startUpdateAgentRagAssetsFlow(agentsViewProvider: IViewProvider, agentUri: string, embeddingIds: string[]) {
		_showEmbeddingAssetIds(false, agentsViewProvider, agentUri, undefined, embeddingIds);
	}
}

async function _showChatLlmOptions(isCreate: boolean, agentsViewProvider: IViewProvider, name: string): Promise<void> {
	const response = await LanguageModelsAPI.listLanguageModelsChat();
	if (response.basemodels.length === 0) {
		vscode.window.showErrorMessage('No LLM models found, please setup at least one language model provider with models');
		return;
	}

	return new Promise((resolve) => {
		const options = Object.fromEntries(response.basemodels.map(basemodel => [`${basemodel.providerId}-${basemodel.name}`, basemodel]));
		const quickPick = vscode.window.createQuickPick();
		quickPick.title = 'Select LLM model';
		quickPick.items = Object.keys(options).map(key => ({ label: options[key].uri, key }));
		quickPick.onDidChangeSelection(selection => {
			_showEmbeddingAssetIds(isCreate, agentsViewProvider, name, selection[0].label).then(resolve);
			quickPick.dispose();
		});
		quickPick.onDidHide(() => {
			resolve();
			quickPick.dispose();
		});
		quickPick.show();
	});
}

async function _showEmbeddingAssetIds(isCreate: boolean, agentsViewProvider: IViewProvider, basemodelOrAgentUri: string, name: string | undefined, selectedEmbeddingIds: string[] = []): Promise<void> {
	const response = await EmbeddingsAPI.getEmbeddings();
	if (response.embeddings.length === 0) {
		if (consts.AppConfig.ENABLE_FUNCTIONS) {
			return _showFunctionsAssetIds(isCreate, agentsViewProvider, basemodelOrAgentUri, name, []);
		} else {
			return _createOrUpdateAgent(isCreate, agentsViewProvider, basemodelOrAgentUri, name, []);
		}
	}

	return new Promise((resolve) => {
		const options = Object.fromEntries(response.embeddings.map(embedding => [embedding.name, embedding]));

		const quickPick = vscode.window.createQuickPick();
		quickPick.title = 'Select embeddings';
		quickPick.canSelectMany = true;
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.selectedItems = quickPick.items.filter(item => selectedEmbeddingIds.includes(options[item.label].id));
		quickPick.onDidAccept((selection) => {
			const embeddings = quickPick.selectedItems.map(item => options[item.label]);
			if (consts.AppConfig.ENABLE_FUNCTIONS) {
				_showFunctionsAssetIds(isCreate, agentsViewProvider, basemodelOrAgentUri, name, embeddings).then(resolve);
			} else {
				_createOrUpdateAgent(isCreate, agentsViewProvider, basemodelOrAgentUri, name, embeddings).then(resolve);
			}
			quickPick.dispose();
		});
		quickPick.onDidHide(() => {
			resolve();
			quickPick.dispose();
		});
		quickPick.show();
	});
}

async function _showFunctionsAssetIds(isCreate: boolean, agentsViewProvider: IViewProvider, basemodelOrAgentUri: string, name: string | undefined, embeddings: api.EmbeddingEntity[]): Promise<void> {
	const response = await FunctionsAPI.listFunctions();

	if (response.functions.length === 0) {
		return _createOrUpdateAgent(isCreate, agentsViewProvider, basemodelOrAgentUri, name, embeddings);
	}

	return new Promise((resolve) => {
		const options = Object.fromEntries(response.functions.map(func => [func.name, func]));
		const quickPick = vscode.window.createQuickPick();
		quickPick.title = 'Select functions';
		quickPick.canSelectMany = true;
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidAccept((selection) => {
			const functions = quickPick.selectedItems.map(item => options[item.label]);
			_createOrUpdateAgent(isCreate, agentsViewProvider, basemodelOrAgentUri, name, embeddings, functions).then(resolve);
			quickPick.dispose();
		});
		quickPick.onDidHide(() => {
			quickPick.dispose();
			resolve();
		});
		quickPick.show();	
	});
}

async function _createOrUpdateAgent(isCreate: boolean, agentsViewProvider: IViewProvider, basemodelOrAgentUri: string, name: string | undefined, embeddings: api.EmbeddingEntity[], functions: api.FunctionEntity[] = []): Promise<void> {
	let promise: Promise<api.CreateOrUpdateAgentResponse>;
	if (isCreate) {
		const ragAssetIds = embeddings.map(embedding => embedding.id);
		const functionAssetIds = functions.map(func => func.id);
		promise = AgentsAPI.createAgent(basemodelOrAgentUri, name, undefined, ragAssetIds, functionAssetIds);
	} else {
		const ragAssetIds = embeddings.map(embedding => embedding.id);
		const functionAssetIds = functions.map(func => func.id);
		promise = AgentsAPI.updateAgent(basemodelOrAgentUri, undefined, name, undefined, ragAssetIds, functionAssetIds);
	}

	return promise.then(() => {
		agentsViewProvider.refresh();
		vscode.window.showInformationMessage(`Agent is ${isCreate ? "created" : "updated"} successfully`);
	}).catch((error) => {
		vscode.window.showErrorMessage(error?.message ?? error?.toString() ?? 'Failed to create agent');
	});
}

export default AgentsCommands;
