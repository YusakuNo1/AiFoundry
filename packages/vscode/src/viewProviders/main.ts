import * as vscode from 'vscode';
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import DockerUtils from '../utils/DockerUtils';
import MiscUtils from '../utils/MiscUtils';
import { IViewProvider, VIEW_PROVIDER_RETRY_INTERVAL } from './base';
import AifPanel from '../panels/AifPanel';
import AifTreeItem from '../types/AifTreeItem';
import SystemAPI from '../api/SystemAPI';
import AifPanelUtils from '../panels/AifPanelUtils';
import LanguageModelsAPI from '../api/LanguageModelsAPI';


const DefaultLmProviderWeight = 1000;
const LmProviderWeightMap: { [key: string]: number } = {
	"ollama": 10,
	"azureopenai": 100,
	"openai": 100,
	"googlegemini": 100,
	"anthropic": 100,
	"huggingface": 100,
	"aws-bedrock": 100,
};

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

	private _systemMenuItemMap: Record<string, types.SystemMenuItem> = {};

	constructor() {
		this._refreshCallback = this._refreshCallback.bind(this);
		this._resetSystemMenuItemMap();
		const INIT_RETRY_COUNT = 2; // Don't let the user wait too long for the initial status
		this.refresh(INIT_RETRY_COUNT);
	}

	refresh(retryCount: number): void {
		this._resetStatus();

		const retryFns = [
			() => this._refreshDockerApp(),
			() => this._refreshDockerService(),
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
		const components = Object.keys(this._systemMenuItemMap).sort((a, b) =>
			this._systemMenuItemMap[a].weight - this._systemMenuItemMap[b].weight
		);

		return Promise.resolve(components.map((componentKey) => {
			const component = this._systemMenuItemMap[componentKey];
			const iconName = component.status === "unknown" ? "icon-questionmark.svg"
				: component.status === "checking" ? "refresh.svg"
				: component.status === "unavailable" ? "icon-cross.svg" : component.iconName;

			const command = componentKey === consts.DOCKER_SERVER_ID
				? AifPanelUtils.createCommandShowAifPanelHome()
				: AifPanelUtils.createCommandSetPageContextUpdateLmProvider(component.id);
			return new AifTreeItem(
				component.name,
				vscode.TreeItemCollapsibleState.None,
				command,
				component.id,
				iconName,
			);
		}));
	}

	private _resetSystemMenuItemMap(): void {
		this._systemMenuItemMap = {};

		if (consts.AppConfig.USE_DOCKER) {
			const dockerInfo: types.DockerSystemMenuItem = {
				id: consts.DOCKER_SERVER_ID,
				name: "Docker Server",
				iconName: "icon-docker.svg",
				status: "unknown",
				appStatus: "unknown",
				serverStatus: "unknown",
				weight: 1,
			};
			this._systemMenuItemMap[consts.DOCKER_SERVER_ID] = dockerInfo;	
		}
	}

	private _updateStoreSystemMenuItemMap() {
		const messsage: types.MessageStoreUpdateSystemMenuItemMap = {
			aifMessageType: 'store:update',
			type: 'updateSystemMenuItemMap',
			data: { systemMenuItemMap: this._systemMenuItemMap },
		};
		AifPanel.postMessage(messsage);
	}

	private _resetStatus(): void {
		// Reset all components to "checking" status
		const dockerInfo = this._systemMenuItemMap[consts.DOCKER_SERVER_ID];
		for (const key in this._systemMenuItemMap) {
			if (key === dockerInfo?.id) {
				continue;
			}
			this._systemMenuItemMap[key].status = "checking";
		}

		this._updateStoreSystemMenuItemMap();
		this._onDidChangeTreeData.fire();
	}

	private async _refreshDockerApp(): Promise<boolean> {
		this._resetSystemMenuItemMap();

		if (!consts.AppConfig.USE_DOCKER) {
			return true;
		}

		const dockerSystemMenuItem = this._systemMenuItemMap[consts.DOCKER_SERVER_ID] as types.DockerSystemMenuItem;
		dockerSystemMenuItem.status = "checking";
		dockerSystemMenuItem.appStatus = "checking";
		dockerSystemMenuItem.serverStatus = "checking";
		this._updateStoreSystemMenuItemMap();
		this._onDidChangeTreeData.fire();

		const response: DockerUtils.RunDockerCommandResponse = await DockerUtils.checkDockerApp();
		dockerSystemMenuItem.status = response.success ? "available" : "unavailable";
		if (!response.success) {
			dockerSystemMenuItem.appStatus = "unavailable";
			dockerSystemMenuItem.serverStatus = "unavailable";
		}
		this._updateStoreSystemMenuItemMap();
		this._onDidChangeTreeData.fire();

		if (!response.success) {
			return false;
		}

		const isDockerServerRunning = await DockerUtils.checkDockerServer(response.output);
		dockerSystemMenuItem.appStatus = isDockerServerRunning ? "available" : "unavailable";
		if (!isDockerServerRunning) {
			dockerSystemMenuItem.serverStatus = "unavailable";
		}
		this._updateStoreSystemMenuItemMap();
		this._onDidChangeTreeData.fire();

		return isDockerServerRunning;
	}

	private async _refreshDockerService(): Promise<boolean> {
		const dockerSystemMenuItem = this._systemMenuItemMap[consts.DOCKER_SERVER_ID] as types.DockerSystemMenuItem;

		try {
			const status: types.api.StatusResponse = await SystemAPI.getStatus();
			if (consts.AppConfig.USE_DOCKER) {
				dockerSystemMenuItem.serverStatus = status.status === "ok" ? "available" : "unavailable";
			}
		} catch (error) {
			if (consts.AppConfig.USE_DOCKER) {
				dockerSystemMenuItem.serverStatus = "unavailable";
			}
		}

		this._updateStoreSystemMenuItemMap();
		this._onDidChangeTreeData.fire();
		return !consts.AppConfig.USE_DOCKER || dockerSystemMenuItem.serverStatus === "available";
	}

	private async _refreshLmProviders(): Promise<boolean> {
		// Update the status of LM components
		try {
			const lmProviders: types.api.ListLmProvidersResponse = await LanguageModelsAPI.listLmProviders();
			for (const provider of lmProviders.providers) {
				this._systemMenuItemMap[provider.lmProviderId] = {
					id: provider.lmProviderId,
					name: provider.name,
					status: provider.status,
					iconName: LmProviderIconMap[provider.lmProviderId] ?? UnknownLmProviderIcon,
					weight: LmProviderWeightMap[provider.lmProviderId] ?? DefaultLmProviderWeight,
				};
			}

			this._updateStoreSystemMenuItemMap();
			this._onDidChangeTreeData.fire();
			return true;	
		} catch (error) {
			// If failed to get LM components, set them to "unavailable"
			for (const key in this._systemMenuItemMap) {
				if (key === consts.DOCKER_SERVER_ID) {
					continue;
				}
				this._systemMenuItemMap[key].status = "unavailable";
			}
			this._updateStoreSystemMenuItemMap();
			this._onDidChangeTreeData.fire();

			return false;
		}
	}
}
