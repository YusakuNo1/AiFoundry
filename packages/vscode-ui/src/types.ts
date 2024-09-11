// export enum PageType {
//     HOME = "home",
//     EMBEDDINGS = "embeddings",
// }

// export type PageContextInfo = {
//     pageType: PageType;
//     sampleParam?: string; // TODO: remove this
// };

export type VSCodeInterface = {
    postMessage: (message: any) => void;
}
