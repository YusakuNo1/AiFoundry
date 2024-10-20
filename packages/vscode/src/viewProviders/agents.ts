import * as vscode from 'vscode';
import type { database } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import AgentsAPI from '../api/AgentsAPI';
import AifPanel from '../panels/AifPanel';
import AifPanelTypes from '../panels/types';
import AifTreeItem from '../types/AifTreeItem';
import { IViewProvider, VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL } from './base';
import MiscUtils from '../utils/MiscUtils';
import AifPanelUtils from '../panels/AifPanelUtils';


export class AifAgentsViewProvider implements IViewProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<AifTreeItem | undefined | void> = new vscode.EventEmitter<AifTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<AifTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private _agents: database.AgentMetadata[] | undefined = undefined;

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
				return new AifTreeItem(
					agentInfo.name,
					vscode.TreeItemCollapsibleState.None,
					AifPanelUtils.createCommandShowAifPanelAgents(agentInfo),
					agentInfo.id,
					iconName,
				);
			}));
		}
	}

	private _refresh(agentId?: string): Promise<boolean> {
		return AgentsAPI.list()
			.then((response) => {
				this._agents = response.agents;

				if (agentId) {
					const agentInfo = this._agents.find((model) => model.id === agentId);
					if (agentInfo) {
						const message = AifPanelUtils.createMessageSetPageAgents(agentInfo);
						AifPanel.postMessage(message as any);
					}
				}

				this._onDidChangeTreeData.fire();
				return true;
			}).catch((error) => {
				return false;
			});
	}
}
