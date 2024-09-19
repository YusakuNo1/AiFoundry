import * as path from 'path';
import * as sharp from 'sharp';
import * as vscode from 'vscode';
import { v4 as uuidv4 } from "uuid";
import type { types } from 'aifoundry-vscode-shared';

namespace FileUtils {
	export function convertTextToFunctionName(text: string): string {
		return text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
	}

	// To save input tokens, scale down the image to smaller size
	export async function convertToUploadImageFile(fileContent: Uint8Array, size: { width: number | undefined, height: number | undefined }, fsPath: string): Promise<File> {
		const data = await sharp(fileContent)
			.resize({
				width: size.width,
				height: size.height, 
				fit: sharp.fit.inside,
			})
			.toFormat('jpeg')
			.toBuffer();
		const documentBlob = new Blob([data], {
			type: "application/octet-stream",
		}) as any;
		
		const fileName = fsPath.split('/').pop() ?? '';
		return new File([documentBlob], fileName);
	}

	// Read image file to data URI
	export async function convertToThumbnailDataUrl(fileContent: Uint8Array, size: { width: number | undefined, height: number | undefined }): Promise<string> {
		const data = await sharp(fileContent)
			.resize(size.width, size.height)
			.toFormat('jpeg')
			.toBuffer();
		const base64Encoded = data.toString("base64");
		const url = `data:image/jpeg;base64,${base64Encoded}`;
		return url;
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
