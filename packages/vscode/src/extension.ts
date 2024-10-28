'use strict';
import * as vscode from 'vscode';
import { api, consts } from 'aifoundry-vscode-shared';
import { setupServer } from 'aifoundry-server-js';
import { VIEW_PROVIDER_RETRY_COUNT } from './viewProviders/base';
import { AifMainViewProvider } from './viewProviders/main';
import { AifAgentsViewProvider } from './viewProviders/agents';
import { AifEmbeddingsViewProvider } from './viewProviders/embeddings';
import { AifFunctionsViewProvider } from './viewProviders/functions';
import EmbeddingsCommands from './commands/embeddings';
import AgentsCommands from './commands/agents';
import FunctionsCommands from './commands/functions';
import AifPanel from './panels/AifPanel';
import AifPanelTypes from './panels/types';
import DockerUtils from './utils/DockerUtils';
import LaunchUtils from './utils/launchUtils';
import AifPanelUtils from './panels/AifPanelUtils';


export function activate(context: vscode.ExtensionContext) {
	// This function is called when the extension is started
	LaunchUtils.setupFolders();
	// Setup message functions
	api.ApiOutStreamMessageUtils.registerMessageFunc("info", vscode.window.showInformationMessage);
	api.ApiOutStreamMessageUtils.registerMessageFunc("success", vscode.window.showInformationMessage);
	api.ApiOutStreamMessageUtils.registerMessageFunc("warning", vscode.window.showWarningMessage);
	api.ApiOutStreamMessageUtils.registerMessageFunc("error", vscode.window.showErrorMessage);

	if (consts.AppConfig.MODE === "dev") {
		LaunchUtils.installDevExtensions();
	}

	if ((process.env?.START_SERVER !== "false")) {
		setupServer();
	}

	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	// Main View
	const mainViewProvider = new AifMainViewProvider();
	context.subscriptions.push(vscode.window.registerTreeDataProvider('aiFoundryMainViewId', mainViewProvider));

	context.subscriptions.push(vscode.commands.registerCommand('AiFoundry.refreshMainView', () => mainViewProvider.refresh(VIEW_PROVIDER_RETRY_COUNT)));

	context.subscriptions.push(vscode.commands.registerCommand('AiFoundry.installDocker', () => {
		vscode.window.showInformationMessage(`Install Docker from ${consts.DOCKER_DOWNLOAD_URL}`);
		vscode.env.openExternal(vscode.Uri.parse(consts.DOCKER_DOWNLOAD_URL));
	}));

	context.subscriptions.push(vscode.commands.registerCommand('AiFoundry.refreshAllViews', () => {
		vscode.commands.executeCommand('AiFoundry.refreshMainView', VIEW_PROVIDER_RETRY_COUNT);
		vscode.commands.executeCommand('AiFoundryEmbeddings.refresh');
		vscode.commands.executeCommand('AiFoundryAgents.refresh');
		vscode.commands.executeCommand('AiFoundryFunctions.refresh');
	}));

	function startDockerDevContainer(startServer: boolean) {
		const messageParam = startServer ? "server" : "container";
		vscode.window.showInformationMessage(`Starting Dev ${messageParam}`);
		DockerUtils.startDockerDevContainer(startServer).then((response) => {
			if (!response) {
				vscode.window.showErrorMessage(`Failed to start Docker ${messageParam}`);
			} else {
				vscode.commands.executeCommand('AiFoundry.refreshAllViews');
			}
		});
	}
	
	context.subscriptions.push(vscode.commands.registerCommand('AiFoundry.startDockerApp', () => {
		vscode.window.showInformationMessage("Starting Docker app");
		DockerUtils.startDockerApp().then(() => DockerUtils.checkDockerApp().then((response) => {
			if (!response.success) {
				vscode.window.showErrorMessage('Failed to start Docker app');
			} else {
				mainViewProvider.refresh(VIEW_PROVIDER_RETRY_COUNT);
				startDockerDevContainer(true);
			}
		}));
	}));

	context.subscriptions.push(vscode.commands.registerCommand('AiFoundry.startDockerServer', () => startDockerDevContainer(true)));
	context.subscriptions.push(vscode.commands.registerCommand('AiFoundry.startDockerDevContainer', () => startDockerDevContainer(false)));

	// Agents View
	const agentViewProvider = new AifAgentsViewProvider();
	context.subscriptions.push(vscode.window.registerTreeDataProvider('aiFoundryAgentsViewId', agentViewProvider));
	AgentsCommands.setupCommands(context, agentViewProvider);

	// Embeddings View
	const embeddingsViewProvider = new AifEmbeddingsViewProvider();
	context.subscriptions.push(vscode.window.registerTreeDataProvider('aiFoundryEmbeddingsViewId', embeddingsViewProvider));
	EmbeddingsCommands.setupCommands(context, embeddingsViewProvider);

	// Functions View
	let functionsViewProvider: AifFunctionsViewProvider | null = null;
	if (consts.AppConfig.ENABLE_FUNCTIONS) {
		functionsViewProvider = new AifFunctionsViewProvider();
		context.subscriptions.push(vscode.window.registerTreeDataProvider('aiFoundryFunctionsViewId', functionsViewProvider));
		FunctionsCommands.setupCommands(context, functionsViewProvider);
	}

	// Webview
	const viewProviderMap: AifPanelTypes.ViewProviderMap = {
		main: mainViewProvider,
		agents: agentViewProvider,
		embeddings: embeddingsViewProvider,
		functions: functionsViewProvider,
	};
	_setupWebview(context, viewProviderMap);
}

function _setupWebview(context: vscode.ExtensionContext, viewProviderMap: AifPanelTypes.ViewProviderMap) {
	context.subscriptions.push(vscode.commands.registerCommand(AifPanelUtils.AifPanelCommand, (arg1) => {
		AifPanel.createOrShow(viewProviderMap, context.extensionUri, arg1);
	}));

	if (vscode.window.registerWebviewPanelSerializer) {
		context.subscriptions.push(vscode.window.registerWebviewPanelSerializer(AifPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				webviewPanel.webview.options = AifPanel.getWebviewOptions(context.extensionUri);
				AifPanel.revive(webviewPanel, context.extensionUri);
			}
		}));
	}
}
