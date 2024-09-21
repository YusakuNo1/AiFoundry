import * as React from "react";
import { useSelector } from "react-redux";
import { DefaultButton, TextField, Stack } from '@fluentui/react';
import { Image as FluentUIImage } from '@fluentui/react-components';
import {
    EmojiLaughRegular as UserIcon,
    LightbulbFilamentRegular as AiIcon,
  } from '@fluentui/react-icons';
import { Text } from '@fluentui/react/lib/Text';
import { Marked } from "marked";
import { types, consts } from "aifoundry-vscode-shared";
import { appendChatUserMessage } from "../store/chatInfoSlice";
import { getTextColor, getBackgroundColor, getChatBgColorUser, getChatBgColorAi } from "../Theme";
import { RootState, store } from "../store/store";
import WebApiImageUtils from "../utils/WebApiImageUtils";


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
    const inputRef = React.useRef<HTMLInputElement>(null);
    const textColor = React.useMemo(() => getTextColor(), []);
    const backgroundColor = React.useMemo(() => getBackgroundColor(), []);
    const chatBgColorUser = React.useMemo(() => getChatBgColorUser(), []);
    const chatBgColorAi = React.useMemo(() => getChatBgColorAi(), []);
    const chatHistoryMessages = useSelector((state: RootState) => state.chatInfo.messages);
    const [pageChatHistoryMessages, setPageChatHistoryMessages] = React.useState<PageChatHistoryMessage[]>(chatHistoryMessages);
    const aifSessionId = useSelector((state: RootState) => state.chatInfo.aifSessionId);
    const [inputText, setInputText] = React.useState('');
    const [chatHistoryMessageFiles, setChatHistoryMessageFiles] = React.useState<types.api.ChatHistoryMessageFile[]>([]);

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
                files: chatHistoryMessageFiles,
            },
        };
        props.onPostMessage(message);
        setInputText("");
        setChatHistoryMessageFiles([]);

        // Update Redux store for user chat message
        const promises = chatHistoryMessageFiles.map((file) => {
            return new Promise<types.api.ChatHistoryMessageFile>((resolve, reject) => {
                WebApiImageUtils.resizeDataUrl(file.dataUri, { maxHeight: consts.THUMBNAIL_HEIGHT }).then((dataUri) => {
                    resolve({ type: file.type, fileName: file.fileName, dataUri });
                })
            });
        });
        Promise.all(promises).then((thumbNailFiles) => {
            store.dispatch(appendChatUserMessage({
                content: inputText,
                contentTextFormat: props.outputFormat,
                files: thumbNailFiles,
            }));
        });

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }, [props, aifSessionId, inputText, chatHistoryMessageFiles, inputRef]);

    const onChangeInputText = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setInputText(newValue || "");
    }, [setInputText]);

    // Upload file from HTML input element
    const onClickFileUpload = React.useCallback((event: any) => {
        async function process() {
            const files = event?.target?.files ?? [];
            const imageOptions = { maxWidth: consts.UPLOAD_IMAGE_MAX_WIDTH, maxHeight: consts.UPLOAD_IMAGE_MAX_HEIGHT };
            const _chatHistoryMessageFiles: types.api.ChatHistoryMessageFile[] = [];
            for await (const file of files) {
                const dataUrl = await WebApiImageUtils.readImageFileToDataUrl(file, imageOptions);
                _chatHistoryMessageFiles.push({
                    type: "image",
                    fileName: file.name,
                    dataUri: dataUrl,
                });
            }
            setChatHistoryMessageFiles(_chatHistoryMessageFiles);
        }

        process();
    }, []);

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
                    {message.files && <>
                        {message.files.map((file, index) => {
                            return (
                                <FluentUIImage key={`file-${index}`} src={file.dataUri} alt={file.fileName} style={{ padding: '2px', border: 2, borderColor: 'black' }} />
                            );
                        })}
                    </>}
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
                <input ref={inputRef} type="file" multiple title="Upload Images" placeholder="Upload Images" accept="image/png, image/jpeg" onChange={onClickFileUpload} />
            </Stack>
        </>
    );
};

export default ModelPlaygroundPage;
