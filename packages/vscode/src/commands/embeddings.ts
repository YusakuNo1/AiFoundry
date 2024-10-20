import * as vscode from 'vscode';
import { type api, misc } from 'aifoundry-vscode-shared';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import LanguageModelsAPI from '../api/LanguageModelsAPI';
import CommandUtils from './utils';
import { IViewProvider } from '../viewProviders/base';
import ApiUtils from '../utils/ApiUtils';

namespace EmbeddingsCommands {
	export function setupCommands(context: vscode.ExtensionContext, embeddingsViewProvider: IViewProvider) {
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryEmbeddings.refresh', () => embeddingsViewProvider.refresh()));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryEmbeddings.create', () => {
			startCreateEmbeddingFlow(embeddingsViewProvider);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryEmbeddings.updateDoc', (params) => {
			const aifEmbeddingAssetId = params?.contextValue;
			if (!aifEmbeddingAssetId) {
				vscode.window.showErrorMessage('Please select an embedding to update');
				return;
			}

			startUpdateEmbeddingDocumentFlow(embeddingsViewProvider, aifEmbeddingAssetId);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryEmbeddings.updateName', (params) => {
			const aifEmbeddingAssetId = params?.contextValue;
			if (!aifEmbeddingAssetId) {
				vscode.window.showErrorMessage('Please select an embedding to update');
				return;
			}

			const oldName = params?.label;
			startUpdateEmbeddingNameFlow(embeddingsViewProvider, aifEmbeddingAssetId, oldName);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryEmbeddings.delete', (params) => {
			const aifEmbeddingAssetId = params?.contextValue;
			if (!aifEmbeddingAssetId) {
				vscode.window.showErrorMessage('Please select an embedding to delete');
				return;
			}
			startDeleteEmbeddingFlow(embeddingsViewProvider, aifEmbeddingAssetId, params?.label);
		}));
	}

	export function startCreateEmbeddingFlow(embeddingsViewProvider: IViewProvider) {
		const defaultName = `Embedding-${new Date().toISOString().replace(/[^0-9]/g, '')}`;
		CommandUtils.chooseText('Embedding Name', defaultName, 'New embedding name').then(result => {
			_showEmbeddingLlmOptions(result ?? defaultName, embeddingsViewProvider);
		});
	}

	export function startUpdateEmbeddingDocumentFlow(embeddingsViewProvider: IViewProvider, aifEmbeddingAssetId: string) {
		_createOrUpdateEmbedding(false, embeddingsViewProvider, aifEmbeddingAssetId);
	}

	export function startUpdateEmbeddingNameFlow(embeddingsViewProvider: IViewProvider, aifEmbeddingAssetId: string, oldName: string | undefined) {
		CommandUtils.chooseText('Embedding Name', oldName, 'New embedding name')
			.then(newName => {
				if (newName) {
					EmbeddingsAPI.updateEmbedding(aifEmbeddingAssetId, [], newName).then(() => {
						embeddingsViewProvider.refresh(aifEmbeddingAssetId);
						vscode.window.showInformationMessage('Embedding name is updated');
					})
					.catch((error) => {
						vscode.window.showErrorMessage(error.message);
					});
				}
			});
	}

	export function startDeleteEmbeddingFlow(embeddingsViewProvider: IViewProvider, aifEmbeddingAssetId: string, name?: string) {
		EmbeddingsAPI.deleteEmbedding(aifEmbeddingAssetId).then(() => {
			embeddingsViewProvider.refresh();
			const message = name ? `Embedding ${name} is deleted` : 'Embedding is deleted';
			vscode.window.showInformationMessage(message);
		})
		.catch((error) => {
			vscode.window.showErrorMessage(error.message);
		});
	}
}

function _showEmbeddingLlmOptions(name: string, embeddingsViewProvider: IViewProvider) {
	LanguageModelsAPI.listLanguageModelsEmbedding().then((response) => {
		// use `${basemodel.providerId}-${basemodel.name}` as key because there could be multiple basemodels with the same name from different providers
		const options = Object.fromEntries(response.basemodels.map(basemodel => [`${basemodel.providerId}-${basemodel.name}`, basemodel]));
		const quickPick = vscode.window.createQuickPick();
		quickPick.title = 'Select LLM model';
		quickPick.items = Object.keys(options).map(key => ({ label: options[key].uri, key }));

		quickPick.onDidChangeSelection(selection => {
			_createOrUpdateEmbedding(true, embeddingsViewProvider, options[(selection[0] as any).key].uri, name);
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	});
}

function _createOrUpdateEmbedding(isCreate: boolean, embeddingsViewProvider: IViewProvider, aifBasemodelUriOrAifEmbeddingAssetId: string, name?: string) {
	const options: vscode.OpenDialogOptions = {
		canSelectMany: true,
		openLabel: 'Select files',
		canSelectFiles: true,
		canSelectFolders: false,
		filters: misc.expandAcceptedFileInfoTypeToFileExtensionMap(misc.AcceptedFileInfoEmbedding),
	};

	vscode.window
		.showOpenDialog(options)
		.then((fileUriList) => {
			if (fileUriList && fileUriList.length > 0 && aifBasemodelUriOrAifEmbeddingAssetId) {
				const promise = isCreate
					? EmbeddingsAPI.createEmbedding(aifBasemodelUriOrAifEmbeddingAssetId, fileUriList, name)
					: EmbeddingsAPI.updateEmbedding(aifBasemodelUriOrAifEmbeddingAssetId, fileUriList, name);
				promise
					.then((response: api.CreateOrUpdateEmbeddingsResponse) => {
						return Promise.resolve();
					})
					.then(() => {						
						embeddingsViewProvider.refresh(isCreate ? undefined : aifBasemodelUriOrAifEmbeddingAssetId);
						vscode.window.showInformationMessage(isCreate ? 'Embedding is created' : 'Embedding is updated');
					})
					.catch((error) => {
						ApiUtils.handleApiErrorResponse(error, vscode.window.showErrorMessage);
					});
			}
		});
}	

export default EmbeddingsCommands;
