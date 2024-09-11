import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@fluentui/react-components';
import { Label, Table, TableBody, TableRow, TableCell, Button } from '@fluentui/react-components';
import { Stack } from '@fluentui/react';
import { IconButton } from '@fluentui/react/lib/Button';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import { getTextColor } from '../Theme';
import type { VSCodeInterface } from '../types';
import { store } from '../store/store';
import { pageInfoSlice } from '../store/pageInfoSlice';
import { render } from '@testing-library/react';

initializeIcons();

type DockerStatusRowProps = {
    vscode: VSCodeInterface;
    menuItem: types.DockerSystemMenuItem;
};
export function DockerStatusRow(props: DockerStatusRowProps) {
    const textColor = React.useMemo(() => getTextColor(), []);
    const showStartServerButton = props.menuItem.appStatus === "available" && props.menuItem.serverStatus === "unavailable";

    const onClickDownload = React.useCallback(() => {
        const message: types.MessageHostMsgExecuteCommand = {
            aifMessageType: 'hostMsg',
            type: 'executeCommand',
            data: {
                command: 'AiFoundry.installDocker',
                args: [],
            }
        }
        props.vscode.postMessage(message);
    }, [props]);

    const onClickRunDockerApp = React.useCallback(() => {
        const message: types.MessageHostMsgExecuteCommand = {
            aifMessageType: 'hostMsg',
            type: 'executeCommand',
            data: {
                command: 'AiFoundry.startDockerApp',
                args: [],
            }
        }
        props.vscode.postMessage(message);
    }, [props]);

    const onClickRefreshMainView = React.useCallback(() => {
        const messageMain: types.MessageHostMsgExecuteCommand = {
            aifMessageType: 'hostMsg',
            type: 'executeCommand',
            data: { command: 'AiFoundry.refreshAllViews', args: [] }
        }
        props.vscode.postMessage(messageMain);
    }, [props]);

    const onClickStartDevContainer = React.useCallback((startServer: boolean) => {
        const command = startServer ? 'AiFoundry.startDockerServer' : 'AiFoundry.startDockerDevContainer';
        const message: types.MessageHostMsgExecuteCommand = {
            aifMessageType: 'hostMsg',
            type: 'executeCommand',
            data: { command, args: [] },
        }
        props.vscode.postMessage(message);
    }, [props]);

    function renderDockerAppActionCell() {
        if (props.menuItem.status === "available" && props.menuItem.appStatus === "unavailable") {
            return (<TableCell>Run the Docker app&nbsp;&nbsp;&nbsp;&nbsp;<Button onClick={onClickRunDockerApp}>Run</Button></TableCell>);
        } else if (props.menuItem.status === "unavailable") {
            return (<TableCell>Please download Docker and install&nbsp;&nbsp;&nbsp;&nbsp;<Button onClick={onClickDownload}>Download</Button></TableCell>);
        } else {
            return (<TableCell>&nbsp;</TableCell>);
        }
    }

    return (
        <Card key={props.menuItem.id} aria-label={props.menuItem.name} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
            {/* <Text style={{ color: textColor, padding: 8, display: 'flex' }} variant="large">{menuItem.name}</Text> */}
            <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
                <Label style={{ color: textColor }}>{props.menuItem.name}</Label>
                <IconButton
                    iconProps={{ iconName: 'Refresh' }}
                    title="Refresh"
                    ariaLabel="Refresh"
                    onClick={onClickRefreshMainView}
                />
                <div style={{ flex: 1 }}>&nbsp;</div>
            </Stack>
            <Table arial-label={`${props.menuItem.name} table`}>
                <TableBody>
                    {props.menuItem.id !== consts.DOCKER_SERVER_ID && (
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>{props.menuItem.id}</TableCell>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                    )}
                    <TableRow>
                        <TableCell>Docker App</TableCell>
                        <TableCell>{props.menuItem.status === "available" ? props.menuItem.appStatus : props.menuItem.status}</TableCell>
                        {renderDockerAppActionCell()}
                    </TableRow>
                    <TableRow>
                        <TableCell>Server Status</TableCell>
                        <TableCell>{(props.menuItem as types.DockerSystemMenuItem).serverStatus}</TableCell>
                        {showStartServerButton && (<>
                            <TableCell><Button onClick={() => onClickStartDevContainer(true)} disabled={props.menuItem.status !== "available"}>Start Server</Button></TableCell>
                            <TableCell><Button onClick={() => onClickStartDevContainer(false)} disabled={props.menuItem.status !== "available"}>Start Dev Container</Button></TableCell>
                        </>)}
                        {!showStartServerButton && (
                            <TableCell>&nbsp;</TableCell>
                        )}
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
    )
}

type LmStatusRowProps = {
    menuItem: types.SystemMenuItem;
    serverStatus: string;
};
export function LmStatusRow(props: LmStatusRowProps) {
    const textColor = React.useMemo(() => getTextColor(), []);

    const onClickSetup = React.useCallback((lmProviderId: string) => {
        const message: types.MessageSetPageContextUpdateLmProvider = {
            aifMessageType: 'setPageType',
            pageType: 'updateLmProvider',
            data: {
                lmProviderId,
            },
        };
        window.postMessage(message);
    }, []);

    const buttonVisible = props.serverStatus !== "unavailable";
    const buttonLabel = props.menuItem.status === "unavailable" ? "Setup" : "Edit";

    return (
        <Card key={props.menuItem.id} aria-label={props.menuItem.name} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
            {/* <Text style={{ color: textColor, padding: 8, display: 'flex' }} variant="large">{menuItem.name}</Text> */}
            <Label style={{ color: textColor }}>{props.menuItem.name}</Label>
            <Table arial-label={`${props.menuItem.name} table`}>
                <TableBody>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>{props.menuItem.id}</TableCell>
                        <TableCell>&nbsp;</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>{props.menuItem.status}</TableCell>
                        {buttonVisible && (
                            <TableCell><Button onClick={() => onClickSetup(props.menuItem.id)}>{buttonLabel}</Button></TableCell>
                        )}
                        {props.menuItem.status !== "unavailable" && (
                            <TableCell>&nbsp;</TableCell>
                        )}
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
    );
}
