import React from 'react';
import type { messages } from 'aifoundry-vscode-shared';

export const PageContext = React.createContext<messages.IPageContext | { data: any }>({
    pageType: "home",
    data: null,
});
