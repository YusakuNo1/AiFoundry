'use strict';
import * as os from 'os';
import * as vscode from 'vscode';
import { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import AifPanelTypes from './types';
import EmbeddingsCommands from '../commands/embeddings';
import AgentsCommands from '../commands/agents';
import FunctionsCommands from '../commands/functions';
import AifPanelEvenHandlers from './AifPanelEvenHandlers';


class AifPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AifPanel | undefined;
	private static _viewProviderMap: AifPanelTypes.ViewProviderMap | undefined = undefined;

	public static readonly viewType = 'aifPanel';
	// public static readonly command = 'AiFoundry.showPanel';

	private static _webappReady = false;
	private static _pendingMessages: types.IMessage[] = [];

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(viewProviderMap: AifPanelTypes.ViewProviderMap, extensionUri: vscode.Uri, arg?: types.MessageSetPageContext) {
		AifPanel._viewProviderMap = viewProviderMap;

		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (AifPanel.currentPanel) {
			AifPanel.currentPanel._panel.reveal(column);
		} else {
			// Otherwise, create a new panel.
			const panel = vscode.window.createWebviewPanel(
				AifPanel.viewType,
				'AI Foundry',
				column || vscode.ViewColumn.One,
				{
					...AifPanel.getWebviewOptions(extensionUri),
					enableScripts: true,
					retainContextWhenHidden: true,	// Keep the panel content in memory even when it's not visible
				},
			);

			AifPanel.currentPanel = new AifPanel(panel, extensionUri);
		}
		
		if (arg) {
			AifPanel.postMessage(arg);
		}
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		AifPanel.currentPanel = new AifPanel(panel, extensionUri);
	}

	public static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
		return {
			// Enable javascript in the webview
			enableScripts: true,
	
			// And restrict the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media'), vscode.Uri.joinPath(extensionUri, 'frontend')],
		};
	}

	public static postMessage(message: types.IMessage) {
		if (!AifPanel._webappReady) {
			AifPanel._pendingMessages.push(message);
		} else {
			AifPanel.currentPanel?._panel?.webview.postMessage(message);
		}
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				const msg = message as types.IMessage;
				switch (msg.aifMessageType) {
					case "webapp:ready": {
						AifPanel._webappReady = true;
						for (const message of AifPanel._pendingMessages) {
							AifPanel.postMessage(message);
						}
						break;
					}

					case "hostMsg": {
						if (message.type === 'executeCommand') {
							const _message = message as types.MessageHostMsgExecuteCommand;
							vscode.commands.executeCommand(_message.data.command);
						} else if (message.type === 'showMessage') {
							const _message = message as types.MessageHostMsgShowMessage;
							if (_message.data.type === 'info') {
								vscode.window.showInformationMessage(_message.data.message);
							} else if (_message.data.type === 'warning') {
								vscode.window.showWarningMessage(_message.data.message);
							} else {
								vscode.window.showErrorMessage(_message.data.message);
							}
						}
						break;
					}

					case "editInfo": {
						if (AifPanel._viewProviderMap?.embeddings && types.MessageEditInfoEmbeddingsTypes.includes(message.type)) {
							if (message.type === 'UpdateEmbeddingName') {
								const messageEditInfo = message as types.MessageEditInfoEmbeddingName;
								EmbeddingsCommands.startUpdateEmbeddingNameFlow(AifPanel._viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId, messageEditInfo.data.name);
							} else if (message.type === 'UpdateEmbeddingDoc') {
								const messageEditInfo = message as types.MessageEditInfoEmbeddingUpdateDoc;
								EmbeddingsCommands.startUpdateEmbeddingDocumentFlow(AifPanel._viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId);
							} else if (message.type === 'DeleteEmbedding') {
								const messageEditInfo = message as types.MessageEditInfoDeleteEmbedding;
								EmbeddingsCommands.startDeleteEmbeddingFlow(AifPanel._viewProviderMap.embeddings, messageEditInfo.data.aifEmbeddingAssetId);
							}
						} else if (AifPanel._viewProviderMap?.agents && types.MessageEditInfoAgentsTypes.includes(message.type)) {
							if (message.type === 'agent:update:name') {
								const messageEditInfo = message as types.MessageEditInfoAgentName;
								AgentsCommands.startupdateAgentNameFlow(AifPanel._viewProviderMap.agents, messageEditInfo.data.id, messageEditInfo.data.name);
							} else if (message.type === 'agent:update:systemPrompt') {
								const messageEditInfo = message as types.MessageEditInfoAgentsystemPrompt;
								AgentsCommands.startupdateAgentSystemPromptFlow(AifPanel._viewProviderMap.agents, messageEditInfo.data.id, messageEditInfo.data.system_prompt);
							} else if (message.type === 'agent:delete') {
								const messageEditInfo = message as types.MessageEditInfodeleteAgent;
								AgentsCommands.startdeleteAgentFlow(AifPanel._viewProviderMap.agents, messageEditInfo.data.id);
							}
						} else if (AifPanel._viewProviderMap?.functions && types.MessageEditInfoFunctionsTypes.includes(message.type)) {
							if (message.type === 'function:update:name') {
								const updateNameMessage = message as types.MessageEditInfoFunctionUpdateName;
								FunctionsCommands.startUpdateFunctionNameFlow(AifPanel._viewProviderMap.functions, updateNameMessage.data.id, updateNameMessage.data.name);
							} else if (message.type === 'function:openfile') {
								const openFileMessage = message as types.MessageEditInfoFunctionOpenFile;
								vscode.window.showTextDocument(vscode.Uri.file(openFileMessage.data.uri));
							}
						}
						break;
					}

					case "api": {
						AifPanelEvenHandlers.webviewApiEventHandler(msg as types.MessageApi, AifPanel.postMessage);
						break;
					}
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		AifPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		if (this._panel.webview.html.length === 0) {
			this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		// Local path to main script run in the webview
		// const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
		// const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'frontend/build/static/js', 'main.js');
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'index.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

		// TODO: Content Security Policy for styles, it's not used currently because Material UI needs to load inline styles
		//       Currently, this block is removed from CSP `style-src ${styleSrc}`
		const shaMaterialUI = "unsafe-inline 'sha256-xaxC5Wv4w063QddSvIeRRPGG18oKSPy7c7lnF396kkA='"; // it's from browser console, not 100% sure when it'll be changed
		// const styleSrc = `style-src ${webview.cspSource} ${shaMaterialUI}`;
		const styleSrc = `style-src 'nonce-${nonce}'`;

		// style-src-elem
		// const shaStyleSrcElm = 'sha256-xaxC5Wv4w063QddSvIeRRPGG18oKSPy7c7lnF396kkA=';  // it's from browser console, not 100% sure when it'll be changed
		// const styleSrcElem = 'style-src-elem unsafe-inline ' + shaStyleSrcElm;
		const styleSrcElem = '';

		// Uri to load styles into webview
		// Removed from the main HTML: <link href="${stylesMainUri}" rel="stylesheet">
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Commented out CSP for now, because UI needs to load inline styles
		// <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'self'; img-src ${webview.cspSource} https:; ${styleSrc} ${styleSrcElem}; script-src 'nonce-${nonce}';">

		const aifConfigModeKey = `${consts.AifConfigKeyPrefix}${consts.AifConfig.mode}`;
		const aifConfigHomeDirKey = `${consts.AifConfigKeyPrefix}${consts.AifConfig.homedir}`;

		const html = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>AI Foundry</title>
			</head>
			<body>
				<div id="root" ${aifConfigModeKey}="vscodeext" ${aifConfigHomeDirKey}="${os.homedir()}"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;

		return html;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export default AifPanel;
