export const AcceptedFileInfoTypes = ["image", "txt", "pdf"] as const;
export type AcceptedFileInfoType = typeof AcceptedFileInfoTypes[number];

// export const AcceptedFileInfoEmbedding: AcceptedFileInfoType[] = ["txt", "pdf"] as const;
export const AcceptedFileInfoEmbedding: AcceptedFileInfoType[] = ["txt"] as const;  // "pdf" is not supported for now

export type DataUrlInfo = {
    data: string,
    dataUrlPrefix: string | null,
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
    "txt": {
        name: "Text",
        extensions: ["txt", "csv"],
        convert: (ext: string, buffer: Buffer) => {
            return {
                data: buffer.toString('utf8'),
                dataUrlPrefix: null,
            };
        }
    },
    "pdf": {
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

// File information in server side
export type UploadFileInfo = DataUrlInfo & {
    type: AcceptedFileInfoType,
    fileName: string,
}

export function convertToDataUrlInfo(dataUrl: string): DataUrlInfo {
    const parts = dataUrl.split(",");
    return {
        data: parts[1],
        dataUrlPrefix: parts[0] + ","
    };
}

export function expandAcceptedFileInfoTypeToFileExtensionMap(types: AcceptedFileInfoType[]): Record<string, string[]> {
    return Object.fromEntries(types.map(type => [type, AcceptedFileInfo[type].extensions]));
}