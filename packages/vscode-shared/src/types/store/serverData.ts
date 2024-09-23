// FileInfo in client side
export type FileInfo = {
    fileName: string;
    filePath: string;
    type: "image";
}

export type FileSelection<T extends FileInfo> = {
    id: string;
    files: T[];
}
