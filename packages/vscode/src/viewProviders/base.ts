import * as vscode from 'vscode';
import AifTreeItem from '../types/AifTreeItem';

export const VIEW_PROVIDER_RETRY_COUNT = 20;
export const VIEW_PROVIDER_RETRY_INTERVAL = 1000; // in ms

export interface IViewProvider extends vscode.TreeDataProvider<AifTreeItem> {
    refresh(item?: any): void;
}
