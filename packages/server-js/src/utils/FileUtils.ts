import { Document } from "@langchain/core/documents";
import { TextSplitter, TokenTextSplitter, CharacterTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { type misc } from "aifoundry-vscode-shared";

namespace FileUtils {
    export async function convertToDocuments(uploadFileInfoList: misc.UploadFileInfo[], splitterParams: misc.SplitterParams): Promise<Document[]> {
        // TODO: support PDF here
        const texts = uploadFileInfoList.filter(f => f.type === "txt").map(f => f.data);

        let splitter: TextSplitter;
        if (splitterParams.splitterType === "CharacterTextSplitter") {
            splitter = new CharacterTextSplitter({
                chunkSize: 100,
                chunkOverlap: 20,
            });
        } else if (splitterParams.splitterType === "RecursiveCharacterTextSplitter") {
            splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 100,
                chunkOverlap: 20,
            });
        } else {
            splitter = new TokenTextSplitter({
                chunkSize: 100,
                chunkOverlap: 20,
            });
        }

        return splitter.createDocuments(texts);
    }
}

export default FileUtils;
