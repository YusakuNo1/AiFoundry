import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { misc } from "aifoundry-vscode-shared";

interface PageInfoState {
    pageType: misc.PageType;
}

const initialState: PageInfoState = {
    pageType: "home",
};

export const pageInfoSlice = createSlice({
    name: "pageInfo",
    initialState,
    reducers: {
        setPageType: (state, action: PayloadAction<misc.PageType>) => {
            state.pageType = action.payload;
        },
    },
});

export const {
    setPageType,
} = pageInfoSlice.actions;
export default pageInfoSlice.reducer;
