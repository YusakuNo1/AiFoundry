import * as vscode from 'vscode';
import * as path from 'path';


class AifTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly contextValue?: string,
		public readonly iconName?: string
	) {
		super(label, collapsibleState);
		this.contextValue = contextValue;
		this.iconPath = !iconName ? undefined : {
			light: path.join(__dirname, '..', '..', 'resources', 'light', iconName),
			dark: path.join(__dirname, '..', '..', 'resources', 'dark', iconName)
		};
	}
}

export default AifTreeItem;
