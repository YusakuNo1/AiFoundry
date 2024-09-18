import * as React from "react";
import { useSelector } from "react-redux";
import { DefaultButton, TextField, Stack } from '@fluentui/react';
import {
    EmojiLaughRegular as UserIcon,
    LightbulbFilamentRegular as AiIcon,
  } from '@fluentui/react-icons';
import { Text } from '@fluentui/react/lib/Text';
import { Marked } from "marked";
import { types } from "aifoundry-vscode-shared";
import { getTextColor, getBackgroundColor, getChatBgColorUser, getChatBgColorAi } from "../Theme";
import { RootState } from "../store/store";

interface Props {
    aifAgentUri: string;
    outputFormat: types.api.TextFormat;
    onPostMessage: (message: types.IMessage) => void;
}

// const ICON_SIZE = "64px";
const ICON_SIZE = 32;

// Add converted content to the message, e.g. convert markdown to HTML
type PageChatHistoryMessage = types.api.ChatHistoryMessage & {
    convertedContent?: string;
};

const ModelPlaygroundPage: React.FC<Props> = (props: Props) => {
    const textColor = React.useMemo(() => getTextColor(), []);
    const backgroundColor = React.useMemo(() => getBackgroundColor(), []);
    const chatBgColorUser = React.useMemo(() => getChatBgColorUser(), []);
    const chatBgColorAi = React.useMemo(() => getChatBgColorAi(), []);
    const chatHistoryMessages = useSelector((state: RootState) => state.chatInfo.messages);
    const [pageChatHistoryMessages, setPageChatHistoryMessages] = React.useState<PageChatHistoryMessage[]>(chatHistoryMessages);
    const aifSessionId = useSelector((state: RootState) => state.chatInfo.aifSessionId);
    const [inputText, setInputText] = React.useState('');
    const fileSelection = useSelector((state: RootState) => state.serverData.fileSelection);

    const marked = React.useMemo(() => {
        return new Marked();
    }, []);

    React.useEffect(() => {
        setPageChatHistoryMessages(chatHistoryMessages);
    }, [chatHistoryMessages]);

    React.useEffect(() => {
        async function convert() {
            let found = false;
            const _pageChatHistoryMessages: PageChatHistoryMessage[] = [];
            for (const message of pageChatHistoryMessages) {
                if (message.convertedContent) {
                    _pageChatHistoryMessages.push({...message});
                } else {
                    found = true;
                    if (message.contentTextFormat === "markdown") {
                        const convertedContent = (await marked.parse(message.content)) ?? message.content;
                        _pageChatHistoryMessages.push({...message, convertedContent});
                    } else {
                        const convertedContent = message.content;
                        _pageChatHistoryMessages.push({...message, convertedContent});
                    }
                    // _pageChatHistoryMessages.push(message);
                }
            }

            if (found) {
                setPageChatHistoryMessages(_pageChatHistoryMessages);
            }
        }
        convert();
    }, [pageChatHistoryMessages, marked]);

    React.useEffect(() => {
        const inputField = document.getElementById("chat-input");
        inputField?.focus();
    }, [props]);

    const onPostMessage = React.useCallback(() => {
        if (!inputText || inputText.trim().length === 0) {
            return;
        }

        const message: types.MessageApiChatSendMessage = {
            aifMessageType: "api",
            type: "chat:sendMessage",
            data: {
                aifSessionId,
                aifAgentUri: props.aifAgentUri,
                contentTextFormat: props.outputFormat,
                input: inputText,
            },
        };
        props.onPostMessage(message);
        setInputText("");
    }, [props, aifSessionId, inputText]);

    const onChangeInputText = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setInputText(newValue || "");
    }, [setInputText]);

    const onClickFileUploadDialog = React.useCallback((event: any) => {
        const message: types.MessageHostMsgChooseImageFiles = {
            aifMessageType: "hostMsg",
            type: "chooseImageFiles",
            data: {
            },
        };
        props.onPostMessage(message);
    }, [props]);

    const renderMessageRow = (message: PageChatHistoryMessage, index: number) => {
        const isUser = message.role === types.api.ChatRole.USER;
        return (
            <Stack horizontal tokens={{ childrenGap: 10 }} style={{ margin: 8 }} key={`message-${index}`}>
                <Stack.Item styles={{ root: { width: ICON_SIZE } }}>
                    <UserIcon style={{ width: ICON_SIZE, height: ICON_SIZE, visibility: isUser ? "visible" : "hidden" }} />
                </Stack.Item>
                <Stack.Item grow style={{ backgroundColor: isUser ? chatBgColorUser : chatBgColorAi }}>
                    <Text style={{ color: textColor, marginLeft: '8px', marginRight: '8px' }}>
                        <div style={{ marginLeft: '8px', marginRight: '8px' }} dangerouslySetInnerHTML={{ __html: message.convertedContent ?? message.content }} />
                    </Text>
                </Stack.Item>
                <Stack.Item styles={{ root: { width: ICON_SIZE } }}>
                    <AiIcon style={{ width: ICON_SIZE, height: ICON_SIZE, visibility: !isUser ? "visible" : "hidden" }} />
                </Stack.Item>
            </Stack>
        )
    };

    return (
        <>
            <Text style={{ color: textColor, padding: 8, display: 'flex' }} variant="large">Playground</Text>

            {pageChatHistoryMessages.map((message, index) => renderMessageRow(message, index))}
            <Stack horizontal tokens={{ childrenGap: 10 }} style={{ alignItems: "center" }}>
                <TextField
                    styles={{ root: { flexGrow: 1 } }}
                    style={{ flexGrow: 1, color: textColor, backgroundColor }}
                    id="chat-input"
                    ariaLabel="chat-input"
                    placeholder="Type your message here"
                    onChange={onChangeInputText} value={inputText}
                    onKeyUp={(e) => e.key === 'Enter' && onPostMessage()}
                />
                <DefaultButton onClick={() => onPostMessage()}>Send</DefaultButton>
                <DefaultButton onClick={onClickFileUploadDialog}>Upload</DefaultButton>
                {fileSelection?.files && fileSelection?.files.length > 0 && <Text style={{ color: textColor, paddingRight: 8 }}>{`${fileSelection.files.length} files selected`}</Text>}
            </Stack>
        </>
    );
};

export default ModelPlaygroundPage;
