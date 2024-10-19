import * as vscode from 'vscode';
import type { types } from 'aifoundry-vscode-shared';
import MiscUtils from '../utils/MiscUtils';
import { IViewProvider, VIEW_PROVIDER_RETRY_INTERVAL } from './base';
import AifPanel from '../panels/AifPanel';
import AifTreeItem from '../types/AifTreeItem';
import AifPanelEvenHandlers from '../panels/AifPanelEvenHandlers';
import AifPanelUtils from '../panels/AifPanelUtils';
import LanguageModelsAPI from '../api/LanguageModelsAPI';


const UnknownLmProviderIcon = "icon-unknown-provider.svg";
const LmProviderIconMap: { [key: string]: string } = {
	"ollama": "icon-ollama.svg",
	"azureopenai": "icon-azureopenai.svg",
	"openai": "icon-openai.svg",
	"googlegemini": "icon-googlegemini.svg",
	"anthropic": "icon-anthropic.svg",
	"huggingface": "icon-huggingface.svg",
	"aws-bedrock": "icon-aws-bedrock.svg",
};

export class AifMainViewProvider implements IViewProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<AifTreeItem | undefined | void> = new vscode.EventEmitter<AifTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<AifTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private _lmProviders: types.api.LmProviderInfoResponse[] = [];

	constructor() {
		this._refreshCallback = this._refreshCallback.bind(this);
		this._resetSystemMenuItemMap();
		const INIT_RETRY_COUNT = 2; // Don't let the user wait too long for the initial status
		this.refresh(INIT_RETRY_COUNT);
	}

	refresh(retryCount: number): void {
		this._resetStatus();

		const retryFns = [
			() => this._refreshLmProviders(),
		];
		MiscUtils.retryPromise(retryFns, retryCount, VIEW_PROVIDER_RETRY_INTERVAL).then(this._refreshCallback);
	}

	_refreshCallback(success: boolean): void {
		if (!success) {
			vscode.window.showErrorMessage("Failed to refresh the main view");
		}
	}

	getTreeItem(element: AifTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: AifTreeItem): Thenable<AifTreeItem[]> {
		const aifTreeItems: AifTreeItem[] = this._lmProviders.map((provider) => {
			const availableIconName = LmProviderIconMap[provider.id] ?? UnknownLmProviderIcon;
			const iconName = provider.status === "unknown" ? "icon-questionmark.svg"
				: provider.status === "checking" ? "refresh.svg"
				: provider.status === "unavailable" ? "icon-cross.svg" : availableIconName;

			const command = AifPanelUtils.createCommandSetPageContextUpdateLmProvider(provider.id);
			return new AifTreeItem(
				provider.name,
				vscode.TreeItemCollapsibleState.None,
				command,
				provider.id,
				iconName,
			);
		});
		return Promise.resolve(aifTreeItems);
	}

	private _resetSystemMenuItemMap(): void {
		this._lmProviders = [];
	}

	private _resetStatus(): void {
		AifPanelEvenHandlers.postMessageUpdateLmProviders(this._lmProviders, AifPanel.postMessage);
		this._onDidChangeTreeData.fire();
	}

	private async _refreshLmProviders(): Promise<boolean> {
		// Update the status of LM components
		try {
			const lmProviders: types.api.ListLmProvidersResponse = await LanguageModelsAPI.listLmProviders(true);
			this._lmProviders = lmProviders.providers;
			AifPanelEvenHandlers.postMessageUpdateLmProviders(this._lmProviders, AifPanel.postMessage);
			this._onDidChangeTreeData.fire();
			return true;	
		} catch (error) {
			this._resetSystemMenuItemMap();
			AifPanelEvenHandlers.postMessageUpdateLmProviders(this._lmProviders, AifPanel.postMessage);
			this._onDidChangeTreeData.fire();

			return false;
		}
	}
}
