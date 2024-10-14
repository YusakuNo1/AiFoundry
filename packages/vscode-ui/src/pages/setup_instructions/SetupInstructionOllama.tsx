import React from 'react';
import { Divider, Text, Link, Button, Table, TableBody, TableRow, TableCell } from "@fluentui/react-components";
import { consts, types } from 'aifoundry-vscode-shared';
import ConfigUtils from '../../utils/ConfigUtils';

const platforms = ["win32", "darwin", "linux"] as const;
type PlatformType = typeof platforms[number];

const ollamaDownloadInstructions: Record<PlatformType, { name: string, url: string | undefined, instruction: string | undefined, website: string }> = {
    "darwin": {
        "name": "Mac OS X",
        "url": "https://ollama.com/download/Ollama-darwin.zip",
        "instruction": undefined,
        "website": "https://ollama.com/download/mac",
    },
    "win32": {
        "name": "Windows",
        "url": "https://ollama.com/download/OllamaSetup.exe",
        "instruction": undefined,
        "website": "https://ollama.com/download/windows",
    },
    "linux": {
        "name": "Linux",
        "url": undefined,
        "instruction": "Command: `curl -fsSL https://ollama.com/install.sh | sh`",
        "website": "https://ollama.com/download/linux",
    },
}

type Props = {
    onPostMessage: (message: types.IMessage) => void;
}
const SetupInstructionOllama = (props: Props) => {
    const onPostMessage = React.useCallback(() => {
        const message: types.MessageApiSetupLmProvider = {
            aifMessageType: "api",
            type: "api:setup:lmProvider",
            data: {
                id: consts.LOCAL_LM_PROVIDER_ID_OLLAMA,
            },
        };
        props.onPostMessage(message);
    }, [props]);
    const currentPlatform = React.useMemo(() => ConfigUtils.getConfig(consts.AifConfig.platform), []);

    return (<>
        <div style={{ marginTop: "16px", marginBottom: "16px" }}><Text style={{ margin: "8px" }} size={500}>Step 1: Download</Text></div>

        <Table>
            <TableBody>
                {platforms.map(platform => 
                    <TableRow>
                        <TableCell width={"100px"}>{ollamaDownloadInstructions[platform].name}</TableCell>
                        {ollamaDownloadInstructions[platform].url && <TableCell><Link href={ollamaDownloadInstructions[platform].url}>Download</Link></TableCell>}
                        {!ollamaDownloadInstructions[platform].url && <TableCell>{ollamaDownloadInstructions[platform].instruction}</TableCell>}
                        {ollamaDownloadInstructions[platform].website && <TableCell><Link href={ollamaDownloadInstructions[platform].website}>Website</Link></TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>

        <Divider></Divider>

        <div style={{ marginTop: "16px", marginBottom: "16px" }}><Text style={{ margin: "8px" }} size={500}>Step 2: Start Ollama server</Text></div>

        <Divider></Divider>

        {currentPlatform === "darwin" && <>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}><Text style={{ margin: "8px" }} size={300}>Option 1: start with this button: </Text><Button onClick={() => onPostMessage()}>Start</Button></div>
            <Divider></Divider>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}><Text style={{ margin: "8px" }} size={300}>Option 2: run `ollama serve` from Terminal</Text></div>
        </>}

        {currentPlatform !== "darwin" && <>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}><Text style={{ margin: "8px" }} size={300}>Run `ollama serve` from Terminal</Text></div>
        </>}
    </>)
};

export default SetupInstructionOllama;
