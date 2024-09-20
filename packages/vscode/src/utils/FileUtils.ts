import * as path from 'path';
import * as vscode from 'vscode';
import { v4 as uuidv4 } from "uuid";
import type { types } from 'aifoundry-vscode-shared';

namespace FileUtils {
	export function convertTextToFunctionName(text: string): string {
		return text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
	}

	export async function getFile(uri: vscode.Uri): Promise<File> {
		const document = await vscode.workspace.fs.readFile(uri);
		const documentBlob = new Blob([document], {
			type: "application/octet-stream",
		}) as any;
		const fileName = uri.fsPath.split('/').pop() ?? '';
		return new File([documentBlob], fileName);
	}

	export async function convertChatHistoryMessageFileToFile(file: types.api.ChatHistoryMessageFile): Promise<File> {
		const data = Buffer.from(file.dataUri.split(",")[1], "base64");
		const documentBlob = new Blob([data], {
			type: "application/octet-stream",
		}) as any;
		return new File([documentBlob], file.fileName);
	}

	export type LocalFileInfo = types.FileInfo & {
		uri: vscode.Uri
	}
	export type LocalFileSelection = types.FileSelection<LocalFileInfo>;
	let _localFileSelection: LocalFileSelection | null = null;
	export function chooseFiles(): Promise<types.FileSelection<types.FileInfo>> {
		return new Promise((resolve) => {
			_localFileSelection = null;

			vscode.window.showOpenDialog({
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: true,
			}).then((uris) => {
				uris = uris || [];
				const localFiles: LocalFileInfo[] = uris.map(uri => ({
					fileName: path.basename(uri.fsPath),
					filePath: uri.fsPath,
					type: "image",
					uri,
				}));

				_localFileSelection = {
					id: uuidv4(),
					files: localFiles,
				};

				const fileSelection: types.FileSelection<types.FileInfo> = {
					id: _localFileSelection.id,
					files: localFiles.map(file => ({
						fileName: file.fileName,
						filePath: file.filePath,
						type: file.type,
					})),
				};

				resolve(fileSelection);
			});
		});
	}

	export function getLocalFileSelection(): LocalFileSelection | null {
		return _localFileSelection;
	}

	export function clearLocalFileSelection() {
		_localFileSelection = null;
	}
}

export default FileUtils;
