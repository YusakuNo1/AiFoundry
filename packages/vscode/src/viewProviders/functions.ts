import * as vscode from 'vscode';
import type { api } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import FunctionsAPI from '../api/FunctionsAPI';
import AifPanel from '../panels/AifPanel';
import AifTreeItem from '../types/AifTreeItem';
import { IViewProvider, VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL } from './base';
import MiscUtils from '../utils/MiscUtils';
import AifPanelUtils from '../panels/AifPanelUtils';


export class AifFunctionsViewProvider implements IViewProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<AifTreeItem | undefined | void> = new vscode.EventEmitter<AifTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<AifTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private _functions: api.FunctionEntity[] | undefined = undefined;

	constructor() {
		this._refreshCallback = this._refreshCallback.bind(this);
		this.refresh();
	}

	refresh(id?: string): void {
		MiscUtils.retryPromise(() => this._refresh(id), VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL).then(this._refreshCallback);
	}

	_refreshCallback(success: boolean): void {
		if (success) {
			this._onDidChangeTreeData.fire();
		} else {
			vscode.window.showErrorMessage("Failed to refresh the functions view");
		}
	}

	getTreeItem(element: AifTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: AifTreeItem): Thenable<AifTreeItem[]> {
		if (this._functions === undefined) {
			return Promise.resolve([new AifTreeItem('Checking functions... Please wait', vscode.TreeItemCollapsibleState.None, undefined, consts.UI_PLACEHOLDER)]);
		} else if (this._functions.length === 0) {
			return Promise.resolve([new AifTreeItem('No functions found', vscode.TreeItemCollapsibleState.None, undefined, consts.UI_PLACEHOLDER)]);
		} else {
			const iconName = "icon-lambda.svg";
			return Promise.resolve(this._functions.map((functionMetadata) => {
				const message = AifPanelUtils.createMessageSetPageFunctions(functionMetadata.id);
				const command = AifPanelUtils.createCommandShowAifPanel(message);		
				return new AifTreeItem(
					functionMetadata.name ?? functionMetadata.uri,
					vscode.TreeItemCollapsibleState.None,
					command,
					functionMetadata.id,
					iconName,
				);
			}));
		}
	}

	private _refresh(functionId?: string): Promise<boolean> {
		this._functions = undefined;
		return FunctionsAPI.listFunctions()
			.then((response) => {
				this._functions = response.functions;
				this._onDidChangeTreeData.fire();

				AifPanel.postMessage(AifPanelUtils.createMessageStoreUpdateFunctions(this._functions));
				if (functionId) {
					AifPanel.postMessage(AifPanelUtils.createMessageSetPageFunctions(functionId));
				}
				return true;
			}).catch((error) => {
				return false;
			});
	}
}
