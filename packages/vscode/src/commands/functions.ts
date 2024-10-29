import * as vscode from 'vscode';
import { api } from 'aifoundry-vscode-shared';
import { api as apiClient } from 'aifoundry-vscode-shared-client';
import CommandUtils from './utils';
import FileUtils from '../utils/FileUtils';
import { IViewProvider } from '../viewProviders/base';


namespace FunctionsCommands {
	export function setupCommands(context: vscode.ExtensionContext, functionsViewProvider: IViewProvider) {
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryFunctions.refresh', () => functionsViewProvider.refresh()));
	
		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryFunctions.create', () => {
			startCreateFunctionFlow(functionsViewProvider);
		}));

		context.subscriptions.push(vscode.commands.registerCommand('AiFoundryFunctions.delete', (params) => {
			const id = params?.contextValue;
			if (!id) {
				vscode.window.showErrorMessage('Please select a function to update');
				return;
			}

			startDeleteFunctionFlow(functionsViewProvider, id);
		}));
	}

	export async function startCreateFunctionFlow(functionsViewProvider: IViewProvider) {
		const defaultName = `Function-${new Date().toISOString().replace(/[^0-9]/g, '')}`;

		const functionDescriptiveName = await CommandUtils.chooseText('Function Name', defaultName, 'New function name');
		const functionName = FileUtils.convertTextToFunctionName(functionDescriptiveName ?? defaultName);

		// const folderUri = await CommandUtils.chooseFolder('Select folder', vscode.Uri.file(functionsFolder));
		// if (!folderUri) {
		// 	return;
		// }
		// const folderPath = folderUri?.fsPath;

		// Only allow the user to create functions in `~/.aifoundry/assets/functions` folder, so the function path is ""
		const folderPath = "";
		try {
			const response = await apiClient.FunctionsAPI.createFunction(api.AifFunctionType.LOCAL, functionDescriptiveName ?? defaultName, folderPath, functionName);
			functionsViewProvider.refresh(response.id);				
		} catch (error) {
			vscode.window.showErrorMessage((error as any)?.message ?? 'Failed to create function');
		}
	}

	export async function startUpdateFunctionNameFlow(functionsViewProvider: IViewProvider, id: string, oldName: string | undefined) {
		const newName = await CommandUtils.chooseText('Function Name', oldName, 'New function name');
		if (newName) {
			apiClient.FunctionsAPI.updateFunction(id, newName).then(() => {
				functionsViewProvider.refresh(id);
			})
			.catch((error) => {
				vscode.window.showErrorMessage(error.message);
			});
		}
	}

	export function startDeleteFunctionFlow(functionsViewProvider: IViewProvider, id: string) {
		apiClient.FunctionsAPI.deleteFunction(id).then(() => {
			functionsViewProvider.refresh();
			vscode.window.showInformationMessage(`Function is deleted successfully`);
		})
		.catch((error) => {
			vscode.window.showErrorMessage(error.message);
		});
	}
}

export default FunctionsCommands;
