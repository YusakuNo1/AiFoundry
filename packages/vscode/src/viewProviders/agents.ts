import * as vscode from 'vscode';
import { type api, consts } from 'aifoundry-vscode-shared';
import { api as apiClient } from 'aifoundry-vscode-shared-client';
import AifPanel from '../panels/AifPanel';
import AifTreeItem from '../types/AifTreeItem';
import { IViewProvider, VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL } from './base';
import MiscUtils from '../utils/MiscUtils';
import AifPanelUtils from '../panels/AifPanelUtils';


export class AifAgentsViewProvider implements IViewProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<AifTreeItem | undefined | void> = new vscode.EventEmitter<AifTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<AifTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private _agents: api.AgentEntity[] | undefined = undefined;

	constructor() {
		this._refreshCallback = this._refreshCallback.bind(this);
		this.refresh();
	}

	refresh(agentId?: string): void {
		MiscUtils.retryPromise(() => this._refresh(agentId), VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL).then(this._refreshCallback);
	}

	_refreshCallback(success: boolean): void {
		if (success) {
			this._onDidChangeTreeData.fire();
		} else {
			vscode.window.showErrorMessage("Failed to refresh the agents view");
		}
	}

	getTreeItem(element: AifTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: AifTreeItem): Thenable<AifTreeItem[]> {
		if (this._agents === undefined) {
			return Promise.resolve([new AifTreeItem('Checking agents... Please wait', vscode.TreeItemCollapsibleState.None, undefined, consts.UI_PLACEHOLDER)]);
		} else if (this._agents.length === 0) {
			return Promise.resolve([new AifTreeItem('No agents found', vscode.TreeItemCollapsibleState.None, undefined, consts.UI_PLACEHOLDER)]);
		} else {
			return Promise.resolve(this._agents.map((agentInfo) => {
				const iconName = "icon-agent.svg";
				const message = AifPanelUtils.createMessageSetPageAgents(agentInfo.id);
				const command = AifPanelUtils.createCommandShowAifPanel(message);
		
				return new AifTreeItem(
					agentInfo.name,
					vscode.TreeItemCollapsibleState.None,
					command,
					agentInfo.id,
					iconName,
				);
			}));
		}
	}

	private _refresh(agentId?: string): Promise<boolean> {
		return apiClient.AgentsAPI.list()
			.then((response) => {
				this._agents = response.agents;
				this._onDidChangeTreeData.fire();

				AifPanel.postMessage(AifPanelUtils.createMessageStoreUpdateAgents(this._agents));
				if (agentId) {
					AifPanel.postMessage(AifPanelUtils.createMessageSetPageAgents(agentId));
				}
				return true;
			}).catch((error) => {
				return false;
			});
	}
}
