import { Document } from "@langchain/core/documents";
import { types } from "aifoundry-vscode-shared";

namespace FileUtils {
    export function convertToDocument(file: types.UploadFileInfo): Document | null {
        if (file.type !== "txt") {
            // TODO: only support text type for now
            return null;
        }

        return new Document({
            pageContent: file.data,
            metadata: {
                fileName: file.fileName,
            },
        });
    }
}

export default FileUtils;
