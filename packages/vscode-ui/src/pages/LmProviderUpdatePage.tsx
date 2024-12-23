import React from 'react';
import { useSelector } from 'react-redux';
import { Input, Label, Table, TableCell, TableRow, TableBody, Divider } from '@fluentui/react-components';
import { useParams } from "react-router-dom";
import { Stack } from '@fluentui/react/lib/Stack';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { AifUtils, type api, consts, type messages } from 'aifoundry-vscode-shared';
import { RootState } from '../store/store';
import { getTextColor } from '../theme/themes';
import LmProviderUpdatePageExpandableInput from './LmProviderUpdatePageExpandableInput';
import SetupInstructionOllama from './setup_instructions/SetupInstructionOllama';
import { AifExperiments } from '../consts';
import { createMessageApiUpdateLmProviderInfo, createMessageApiUpdateLmProviderModel } from './LmProviderUpdatePageUtils';


type Props = {
    onPostMessage: (message: messages.IMessage) => void;
}
const LmProviderUpdatePage = (props: Props) => {
    const textColor = React.useMemo(() => getTextColor(), []);

    const lmProviderId = useParams<{ lmProviderId: string }>().lmProviderId;
    const lmProviders: api.LmProviderInfoResponse[] | null = useSelector((state: RootState) => state.serverData.lmProviders);
    // const [provider, setProvider] = React.useState<api.LmProviderInfoResponse | null>(null);
    const [requestProperties, setRequestProperties] = React.useState<Record<string, string>>({});
    const [weight, setWeight] = React.useState<string>("");
    const [models, setModels] = React.useState<api.LmProviderBaseModelInfo[]>([]);

    const lmProvider = React.useMemo(() => {
        for (const _lmProvider of (lmProviders ?? [])) {
            if (_lmProvider.id === lmProviderId) {
                setWeight("" + _lmProvider.weight);
                setModels(Object.values(_lmProvider.modelMap));
                return _lmProvider;
            }
        }
        return null;
    }, [lmProviders, lmProviderId]);

    React.useEffect(() => {
        if (!lmProviders) {
            const message: messages.MessageApiListLmProviders = {
                aifMessageType: "api",
                type: "api:listLmProviders",
                data: {},
            };
            props.onPostMessage(message);
        }
    }, [lmProviders, props]);

    const onSubmit = React.useCallback(() => {
        if (!lmProviderId) {
            return;
        }

        const _weight = parseInt(weight) ?? null;
        const message = createMessageApiUpdateLmProviderInfo(
            "api:updateLmProviderInfo",
            lmProviderId,
            _weight,
            requestProperties,
        );
        props.onPostMessage(message);
    }, [props, weight, requestProperties, lmProviderId]);

    const onChangeProperty = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newRequestProperties = { ...requestProperties, [event.target.id]: event.target.value };
        setRequestProperties(newRequestProperties);
    }, [requestProperties, setRequestProperties]);

    const onChangeWeight = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setWeight(event.target.value);
    }, [setWeight]);

    const onChangeModel = React.useCallback((modelUri: string, selected: boolean) => {
        if (!lmProviderId) {
            return;
        }

        if (consts.EXP_LM_PROVIDER_MODEL_SELECTION_INSTANT_UPDATE) {
            const message = createMessageApiUpdateLmProviderModel(
                "api:updateLmProviderModel",
                lmProviderId,
                modelUri,
                selected,
            );
            props.onPostMessage(message);    
        }

        const newModels = models.map(model => {
            if (model.uri === modelUri) {
                return {
                    ...model,
                    selected,
                };
            } else {
                return model;
            }
        });

        setModels(newModels);
    }, [props, setModels, models, lmProviderId]);

    const onAddUserDefinedModel = React.useCallback((modelName: string, llmFeature: api.LlmFeature) => {
        if (!lmProviderId) {
            return;
        }

        if (consts.EXP_LM_PROVIDER_MODEL_SELECTION_INSTANT_UPDATE) {
            const params = {
                [consts.UpdateLmProviderBaseModelFeatureKey]: llmFeature,
            }
            const modelUri = AifUtils.createAifUri(lmProviderId, AifUtils.AifUriCategory.Models, modelName, params);
            const selected = true;
            const message = createMessageApiUpdateLmProviderModel(
                "api:updateLmProviderModel",
                lmProviderId,
                modelUri,
                selected,
            );
            props.onPostMessage(message);    
        }

        const existingModel = models.find(model => model.name === modelName);
        if (existingModel) {
            if (!existingModel.features.includes(llmFeature)) {
                const newModel = {
                    ...existingModel,
                    types: [...existingModel.features, llmFeature],
                };
                setModels([...models.filter(model => model.name !== modelName), newModel]);
            }
            return;
        } else {
            const newModel: api.LmProviderBaseModelInfo = {
                uri: AifUtils.createAifUri(lmProviderId, AifUtils.AifUriCategory.Models, modelName),
                name: modelName,
                providerId: lmProviderId,
                features: [llmFeature],
                isUserDefined: true,
            };
            setModels([...models, newModel]);    
        }
    }, [models, setModels, props, lmProviderId]);

    const onDownloadModel = React.useCallback((modelUri: string) => {
        const message: messages.MessageApiDownloadModel = {
            aifMessageType: "api",
            type: "api:download:model",
            data: {
                modelUri,
            },
        };
        props.onPostMessage(message);
    }, [props]);

    const onDeleteModel = React.useCallback((modelUri: string) => {
        const message: messages.MessageApiDeleteModel = {
            aifMessageType: "api",
            type: "api:delete:model",
            data: {
                modelUri,
            },
        };
        props.onPostMessage(message);
    }, [props]);

    function renderRow(name: string, valueElement: React.ReactElement | string | number | undefined) {
        return (<TableRow key={name}>
            <TableCell style={{ width: "150px" }}>{name}</TableCell>
            <TableCell style={{ width: "100%", maxWidth: "350px" }}>{valueElement}</TableCell>
        </TableRow>);
    }

    if (!lmProviderId || !lmProvider) {
        return null;
    }

    const inputStyle = { width: "100%" };
    const showOllamaSetup = lmProviderId === consts.LOCAL_LM_PROVIDER_ID_OLLAMA && lmProvider?.status === "unavailable";
    const tableBodyStyle = {
        width: "100%",
        ...(showOllamaSetup ? { height: "64px" } : {}),
    };
    return (<Stack horizontal={false}>
        <Label style={{ color: textColor, paddingLeft: "8px" }} size='large' weight='semibold'>{`Setup ${lmProvider.name}`}</Label>
        <Divider style={{ color: textColor, paddingTop: "8px" }} />
        <Table arial-label="lm-provider-setup-table">
            <TableBody style={tableBodyStyle}>
                {showOllamaSetup && <SetupInstructionOllama onPostMessage={props.onPostMessage} />}
                {!showOllamaSetup && <>
                    {Object.keys(lmProvider?.properties ?? {}).map((id) => {
                        const isSecret = lmProvider?.properties[id]?.isSecret ?? false;
                        let value = requestProperties[id];
                        if (!value) {
                            const propertyValue = requestProperties[id] ?? lmProvider!.properties[id]?.valueUri;
                            const valueInfo = AifUtils.extractAiUri(consts.AIF_PROTOCOL, propertyValue ?? "");
                            value = valueInfo?.parts[1] ?? "";
                        }
                        return renderRow(id, <Input id={id} type={isSecret ? "password" : undefined} value={value} onChange={onChangeProperty} style={inputStyle} />);
                    })}
                    {renderRow("Weight",
                        <Input
                            id="weight"
                            value={"" + weight}
                            onChange={onChangeWeight}
                            style={inputStyle}
                        />)}
                    {renderRow("Embedding Models",
                        <LmProviderUpdatePageExpandableInput
                            lmProviderId={lmProviderId}
                            inputId="embedding-models"
                            models={models}
                            supportUserDefinedModels={lmProvider.supportUserDefinedModels}
                            llmFeature='embedding'
                            onChange={onChangeModel}
                            onAddUserDefinedModel={onAddUserDefinedModel}
                            onDownloadModel={onDownloadModel}
                            onDeleteModel={onDeleteModel}
                            style={inputStyle}
                        />)}
                    {renderRow("Conversational Models",
                        <LmProviderUpdatePageExpandableInput
                            lmProviderId={lmProviderId}
                            inputId="conversational-models"
                            models={models}
                            supportUserDefinedModels={lmProvider.supportUserDefinedModels}
                            llmFeature='conversational'
                            onChange={onChangeModel}
                            onAddUserDefinedModel={onAddUserDefinedModel}
                            onDownloadModel={onDownloadModel}
                            onDeleteModel={onDeleteModel}
                            style={inputStyle}
                        />)}
                    {AifExperiments.ENABLE_VISION_MODELS && renderRow("Vision Models",
                        <LmProviderUpdatePageExpandableInput
                            lmProviderId={lmProviderId}
                            inputId="vision-models"
                            models={models}
                            supportUserDefinedModels={lmProvider.supportUserDefinedModels}
                            llmFeature='vision'
                            onChange={onChangeModel}
                            onAddUserDefinedModel={onAddUserDefinedModel}
                            onDownloadModel={onDownloadModel}
                            onDeleteModel={onDeleteModel}
                            style={inputStyle}
                        />)}
                    {AifExperiments.ENABLE_TOOLS_MODELS && renderRow("Tools Models",
                        <LmProviderUpdatePageExpandableInput
                            lmProviderId={lmProviderId}
                            inputId="tools-models"
                            models={models}
                            supportUserDefinedModels={lmProvider.supportUserDefinedModels}
                            llmFeature='tools'
                            onChange={onChangeModel}
                            onAddUserDefinedModel={onAddUserDefinedModel}
                            onDownloadModel={onDownloadModel}
                            onDeleteModel={onDeleteModel}
                            style={inputStyle}
                        />)}
                </>}
            </TableBody>
        </Table>

        {!showOllamaSetup && <>
            <DefaultButton style={{ margin: 8 }} key="setup-button" onClick={onSubmit}>Setup</DefaultButton>
        </>}
    </Stack>);    
};

export default LmProviderUpdatePage;
