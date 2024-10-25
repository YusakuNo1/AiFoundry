import * as pdf from 'pdf-parse';
import { Document } from "@langchain/core/documents";
import { TextSplitter, TokenTextSplitter, CharacterTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { misc } from "aifoundry-vscode-shared";
import { HttpException } from "../exceptions";

namespace FileUtils {
    export async function convertToDocuments(uploadFileInfoList: misc.UploadFileInfo[], splitterParams: misc.SplitterParams): Promise<Document[]> {
        const plainTextFiles: misc.UploadFileInfo[] = [];
        const unknownFiles: misc.UploadFileInfo[] = [];

        function check(file: misc.UploadFileInfo, type: misc.AcceptedFileInfoType): boolean {
            return file.type === type && misc.AcceptedFileInfo[type].extensions.includes(file.fileName.split('.').pop() as string);
        }

        for (const file of uploadFileInfoList) {
            const fileExt = file.fileName.split('.').pop();
            if (fileExt && check(file, "text:plain")) {
                plainTextFiles.push(file);
            } else if (fileExt && check(file, "text:binary")) {
                if (fileExt === "pdf") {
                    file.data = await _loadPDFText(file.data);
                    plainTextFiles.push(file);
                } else {
                    unknownFiles.push(file);
                }
            } else {
                unknownFiles.push(file);
            }
        }

        if (unknownFiles.length > 0) {
            throw new HttpException(400, `Unsupported file types: ${unknownFiles.map(f => f.fileName).join(", ")}`);
        }

        return _convertToDocumentsForPlainText(plainTextFiles, splitterParams);
    }

    async function _convertToDocumentsForPlainText(uploadFileInfoList: misc.UploadFileInfo[], splitterParams: misc.SplitterParams): Promise<Document[]> {
        let splitter: TextSplitter;
        if (splitterParams.splitterType === "CharacterTextSplitter") {
            splitter = new CharacterTextSplitter({ chunkSize: splitterParams.chunkSize, chunkOverlap: splitterParams.chunkOverlap });
        } else if (splitterParams.splitterType === "RecursiveCharacterTextSplitter") {
            splitter = new RecursiveCharacterTextSplitter({ chunkSize: splitterParams.chunkSize, chunkOverlap: splitterParams.chunkOverlap });
        } else {
            splitter = new TokenTextSplitter({ chunkSize: splitterParams.chunkSize, chunkOverlap: splitterParams.chunkOverlap });
        }

        const texts = uploadFileInfoList.map(f => f.data);
        return splitter.createDocuments(texts);
    }

    function _base64ToArrayBuffer(base64) {
        var binaryString = atob(base64);
        var bytes = new Uint8Array(binaryString.length);
        for (var i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async function _loadPDFText(fileContentBase64: string): Promise<string> {
        const fileContent = _base64ToArrayBuffer(fileContentBase64);
        const data = await pdf(fileContent)
        return data.text;
    }
}

export default FileUtils;
