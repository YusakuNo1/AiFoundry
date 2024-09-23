export const UploadFileInfoTypes = ["image", "txt", "pdf"] as const;
export type UploadFileInfoType = typeof UploadFileInfoTypes[number];

// File information in server side
export type UploadFileInfo = {
    type: UploadFileInfoType,
    fileName: string,
    dataUri: string,            // example: "data:image/gif;base64,[base64-content]"
}
