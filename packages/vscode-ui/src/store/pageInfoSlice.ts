import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { misc } from "aifoundry-vscode-shared";

interface PageInfoState {
    pageType: misc.PageType;
    pageUrl: string | null;
}

const initialState: PageInfoState = {
    pageType: "home",
    pageUrl: null,
};

export const pageInfoSlice = createSlice({
    name: "pageInfo",
    initialState,
    reducers: {
        // setPageType: (state, action: PayloadAction<misc.PageType>) => {
        //     state.pageType = action.payload;
        // },
        setPageUrl: (state, action: PayloadAction<string>) => {
            state.pageUrl = action.payload;
        },
    },
});

export const {
    // setPageType,
    setPageUrl,
} = pageInfoSlice.actions;
export default pageInfoSlice.reducer;
