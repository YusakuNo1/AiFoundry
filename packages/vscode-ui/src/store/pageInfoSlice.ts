import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { messages } from "aifoundry-vscode-shared";

interface PageInfoState {
    pageType: messages.IPageContextPageType;
}

const initialState: PageInfoState = {
    pageType: "home",
};

export const pageInfoSlice = createSlice({
    name: "pageInfo",
    initialState,
    reducers: {
        setPageType: (state, action: PayloadAction<messages.IPageContextPageType>) => {
            state.pageType = action.payload;
        },
    },
});

export const {
    setPageType,
} = pageInfoSlice.actions;
export default pageInfoSlice.reducer;
