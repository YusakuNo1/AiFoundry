import * as vscode from 'vscode';
import * as path from 'path';
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import EmbeddingsAPI from '../api/EmbeddingsAPI';
import AifPanel from '../panels/AifPanel';
import AifPanelTypes from '../panels/types';
import AifTreeItem from '../types/AifTreeItem';
import { IViewProvider, VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL } from './base';
import MiscUtils from '../utils/MiscUtils';
import AifPanelUtils from '../panels/AifPanelUtils';


export class AifEmbeddingsViewProvider implements IViewProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<AifTreeItem | undefined | void> = new vscode.EventEmitter<AifTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<AifTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private _embeddings: types.database.EmbeddingMetadata[] | undefined = undefined;

	constructor() {
		this._refreshCallback = this._refreshCallback.bind(this);
		this.refresh();
	}

	refresh(embeddingId?: string): void {
		MiscUtils.retryPromise(() => this._refresh(embeddingId), VIEW_PROVIDER_RETRY_COUNT, VIEW_PROVIDER_RETRY_INTERVAL).then(this._refreshCallback);
	}

	_refreshCallback(success: boolean): void {
		if (success) {
			this._onDidChangeTreeData.fire();
		} else {
			vscode.window.showErrorMessage("Failed to refresh the embeddings view");
		}
	}

	getTreeItem(element: AifTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: AifTreeItem): Thenable<AifTreeItem[]> {
		if (this._embeddings === undefined) {
			return Promise.resolve([new AifTreeItem('Checking embeddings... Please wait', vscode.TreeItemCollapsibleState.None, undefined, consts.UI_PLACEHOLDER)]);
		} else if (this._embeddings.length === 0) {
			return Promise.resolve([new AifTreeItem('No embeddings found', vscode.TreeItemCollapsibleState.None, undefined, consts.UI_PLACEHOLDER)]);
		} else {
			const iconName = "icon-embed.svg";
			return Promise.resolve(this._embeddings.map((embeddingInfo) => {
				return new AifTreeItem(
					embeddingInfo.name,
					vscode.TreeItemCollapsibleState.None,
					AifPanelUtils.createCommandShowAifPanelEmbeddings(embeddingInfo),
					embeddingInfo.id,
					iconName,
				);
			}));
		}
	}

	private _refresh(embeddingId?: string): Promise<boolean> {
		this._embeddings = undefined;
		return EmbeddingsAPI.getEmbeddings()
			.then((response) => {
				this._embeddings = response.embeddings;

				if (embeddingId) {
					const embeddingInfo = this._embeddings.find((embedding) => embedding.id === embeddingId);
					if (embeddingInfo) {
						const message = AifPanelUtils.createMessageSetPageEmbeddings(embeddingInfo);
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
