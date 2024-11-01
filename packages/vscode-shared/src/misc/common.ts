export const AcceptedFileInfoTypes = ["image", "text:plain", "text:binary"] as const;
export type AcceptedFileInfoType = typeof AcceptedFileInfoTypes[number];

export const PageTypes = ["home",  "embeddings",  "agents",  "modelPlayground",  "functions",  "page-updateLmProvider"] as const;
export type PageType = typeof PageTypes[number];

export const AcceptedFileInfoEmbedding: AcceptedFileInfoType[] = ["text:plain", "text:binary"] as const;

export type DataUrlInfo = {
    data: string,
    dataUrlPrefix: string | null,
};

// File information in server side
export type UploadFileInfo = DataUrlInfo & {
    type: AcceptedFileInfoType,
    fileName: string,
}

export type SplitterParams = {
	// Currently, only support TokenTextSplitter which is the most accurate but slowest one
    splitterType: "TokenTextSplitter" | "CharacterTextSplitter" | "RecursiveCharacterTextSplitter";
	chunkSize: number;
	chunkOverlap: number;  
};

export const AcceptedFileInfo: Record<AcceptedFileInfoType, {
    name: string,
    extensions: string[],
    convert: (ext: string, buffer: Buffer) => DataUrlInfo,
}> = {
    "image": {
        name: "Image",
        extensions: ["jpg", "jpeg", "png"],
        convert: (ext: string, buffer: Buffer) => {
            return {
                data: buffer.toString('base64'),
                dataUrlPrefix: `data:image/${ext};base64,`,
            };
        }
    },
    "text:plain": {
        name: "Text",
        extensions: ["txt", "csv", "json", "yaml", "yml"],
        convert: (ext: string, buffer: Buffer) => {
            return {
                data: buffer.toString('utf8'),
                dataUrlPrefix: null,
            };
        }
    },
    "text:binary": {
        name: "PDF",
        extensions: ["pdf"],
        convert: (ext: string, buffer: Buffer) => {
            if (ext !== "pdf") {
                throw new Error(`Unsupported file extension ${ext}`);
            }

            return {
                data: buffer.toString('base64'),
                dataUrlPrefix: `data:application/pdf;base64,`,
            };
        }
    },
};

export function convertToDataUrlInfo(dataUrl: string): DataUrlInfo {
    const parts = dataUrl.split(",");
    return {
        data: parts[1],
        dataUrlPrefix: parts[0] + ","
    };
}

export function expandAcceptedFileInfoTypeToFileExtensionMap(types: AcceptedFileInfoType[]): Record<string, string[]> {
    // For some reasons, it seems like fitlers from vscode.window.showOpenDialog only takes the values from the first key (maybe only for Mac), combining all the extensions into one key
    return {"All": types.flatMap(type => AcceptedFileInfo[type].extensions)};
}