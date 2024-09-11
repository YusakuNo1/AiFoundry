import { configureStore } from "@reduxjs/toolkit";
import pageInfoSlice from "./pageInfoSlice";
import chatInfoSlice from "./chatInfoSlice";
import serverDataSlice from "./serverDataSlice";
import { setupDebugger } from "./storeDebugUtils";


export const store = configureStore({
    reducer: {
        pageInfo: pageInfoSlice,
        chatInfo: chatInfoSlice,
        serverData: serverDataSlice,
    },
});

// Debugging utils
setupDebugger(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
