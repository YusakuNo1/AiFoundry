import * as vscode from 'vscode';

namespace CommandUtils {
	export async function chooseText(
		title: string,
		value?: string,
		placeHolder?: string,
		allowEmpty?: boolean,
	): Promise<string | undefined> {
		const validateInput = allowEmpty ? {} : { validateInput: (text: string) => {
			return text.trim() ? null : 'Text cannot be empty';
		}};
		return vscode.window.showInputBox({
			title,
			value,
			placeHolder,
			...validateInput,
		});
	}

	export async function chooseInteger(
		title: string,
		value?: number,
		placeHolder?: number,
		allowEmpty?: boolean,
	): Promise<string | undefined> {
		const validateInput = allowEmpty ? {} : { validateInput: (text: string) => {
			const trimmed = text.trim();
			if (!trimmed) {
				return 'Number cannot be empty';
			} else if (!/^\d+$/.test(trimmed)) {
				return 'Number must be an integer';
			} else {
				return null;
			}
		}};
		return vscode.window.showInputBox({
			title,
			value: `${value ?? 0}`,
			placeHolder: placeHolder ? (placeHolder + "") : undefined,
			...validateInput,
		});
	}

	export async function chooseFolder(
		title: string,
		defaultUri?: vscode.Uri
	): Promise<vscode.Uri | undefined> {
		return vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			defaultUri,
			openLabel: 'Select',
			title
		}).then(uris => uris?.[0]);
	}
}

export default CommandUtils;
