/**
 * Create side panel which lists the following:
 * - LM Providers
 * - Embeddings
 * - Agents
 * - Functions
 * Code sample: https://react.fluentui.dev/?path=/docs/components-tree--docs
 */

import * as React from "react";
import {
    FlatTree,
    FlatTreeItem,
    TreeItemLayout,
    HeadlessFlatTreeItemProps,
    useHeadlessFlatTree_unstable,
    TreeItemValue,
    FlatTreeItemProps,
} from "@fluentui/react-components";
import { Delete20Regular } from "@fluentui/react-icons";
import {
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    useRestoreFocusTarget,
} from "@fluentui/react-components";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AppUrls from "../../app/AppUrls";

type ItemProps = HeadlessFlatTreeItemProps & { content: string };

type PageDataType = AppUrls.AifRoute.AgentDetailsPage
    | AppUrls.AifRoute.EmbeddingDetailsPage
    // | AppUrls.AifRoute.FunctionDetailsPage
    | AppUrls.AifRoute.LmProviderUpdatePage
;

const info: Record<PageDataType, ItemProps[] | null> = {
    [AppUrls.AifRoute.AgentDetailsPage]: null,
    [AppUrls.AifRoute.EmbeddingDetailsPage]: null,
    // [AppUrls.AifRoute.FunctionDetailsPage]: null,
    [AppUrls.AifRoute.LmProviderUpdatePage]: null,
};

const subtrees: ItemProps[][] = [
    [
        { value: "1", content: "Level 1, item 1" },
        { value: "1-1", parentValue: "1", content: "Item 1-1" },
        { value: "1-2", parentValue: "1", content: "Item 1-2" },
    ],

    [
        { value: "2", content: "Level 1, item 2" },
        { value: "2-1", parentValue: "2", content: "Item 2-1" },
    ],
];

type TreeItemDeleteProps = FlatTreeItemProps & {
    onDelete?: (value: string) => void;
};

const TreeItemDelete = React.forwardRef(
    (
        { onDelete, ...props }: TreeItemDeleteProps,
        ref: React.Ref<HTMLDivElement> | undefined
    ) => {
        const focusTargetAttribute = useRestoreFocusTarget();
        const level = props["aria-level"];
        const value = props.value as string;
        const isItemRemovable = level !== 1 && !value.endsWith("-btn");

        const handleDeleteItem = React.useCallback(() => {
            onDelete?.(value);
        }, [value, onDelete]);

        return (
            <Menu positioning="below-end" openOnContext>
                <MenuTrigger disableButtonEnhancement>
                    <FlatTreeItem
                        {...focusTargetAttribute}
                        {...props}
                        ref={ref}
                    >
                        <TreeItemLayout
                            actions={
                                isItemRemovable ? (
                                    <Button
                                        aria-label="Delete item"
                                        appearance="subtle"
                                        onClick={handleDeleteItem}
                                        icon={<Delete20Regular />}
                                    />
                                ) : undefined
                            }
                        >
                            {props.children}
                        </TreeItemLayout>
                    </FlatTreeItem>
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        <MenuItem onClick={handleDeleteItem}>
                            Remove item
                        </MenuItem>
                    </MenuList>
                </MenuPopover>
            </Menu>
        );
    }
);

function SidePanel() {
    const lmProviders = useSelector((state: RootState) => state.serverData.lmProviders);
    const embeddings = useSelector((state: RootState) => state.serverData.embeddings);
    const agents = useSelector((state: RootState) => state.serverData.agents);
    const functions = useSelector((state: RootState) => state.serverData.functions);

    const [trees, setTrees] = React.useState(subtrees);
    const itemToFocusRef = React.useRef<HTMLDivElement>(null);
    const [itemToFocusValue, setItemToFocusValue] =
        React.useState<TreeItemValue>();

    const handleClick = (value: string) => {
        // casting here to string as no number values are used in this example
        if (value.endsWith("-btn")) {
            const subtreeIndex = Number(value[0]) - 1;
            addFlatTreeItem(subtreeIndex);
        }
    };

    const addFlatTreeItem = (subtreeIndex: number) =>
        setTrees((currentTrees) => {
            const lastItem =
                currentTrees[subtreeIndex][
                    currentTrees[subtreeIndex].length - 1
                ];
            const newItemValue = `${subtreeIndex + 1}-${
                Number(lastItem.value.toString().slice(2)) + 1
            }`;
            setItemToFocusValue(newItemValue);
            const nextSubTree: ItemProps[] = [
                ...currentTrees[subtreeIndex],
                {
                    value: newItemValue,
                    parentValue: currentTrees[subtreeIndex][0].value,
                    content: `New item ${newItemValue}`,
                },
            ];

            return [
                ...currentTrees.slice(0, subtreeIndex),
                nextSubTree,
                ...currentTrees.slice(subtreeIndex + 1),
            ];
        });

    const removeFlatTreeItem = React.useCallback(
        (value: string) =>
            setTrees((currentTrees) => {
                const subtreeIndex = Number(value[0]) - 1;
                const currentSubTree = trees[subtreeIndex];
                const itemIndex = currentSubTree.findIndex(
                    (item) => item.value === value
                );
                const nextSubTree = trees[subtreeIndex].filter(
                    (_item, index) => index !== itemIndex
                );

                const nextItemValue = currentSubTree[itemIndex + 1]?.value;
                const prevItemValue = currentSubTree[itemIndex - 1]?.value;
                setItemToFocusValue(nextItemValue || prevItemValue);

                return [
                    ...currentTrees.slice(0, subtreeIndex),
                    nextSubTree,
                    ...currentTrees.slice(subtreeIndex + 1),
                ];
            }),
        [trees]
    );

    const flatTree = useHeadlessFlatTree_unstable(
        React.useMemo(
            () => [
                ...trees[0],
                {
                    value: "1-btn",
                    parentValue: "1",
                    content: "Add new item",
                },
                ...trees[1],
                {
                    value: "2-btn",
                    parentValue: "2",
                    content: "Add new item",
                },
            ],

            [trees]
        ),
        { defaultOpenItems: ["1", "2"] }
    );

    React.useEffect(() => {
        if (itemToFocusRef.current) {
            itemToFocusRef.current.focus();
            setItemToFocusValue(undefined);
        }
    }, [itemToFocusValue]);

    return (
        <FlatTree {...flatTree.getTreeProps()} aria-label="SidePanel" style={{ minWidth: "300px" }}>
            {Array.from(flatTree.items(), (item) => {
                const { content, ...treeItemProps } = item.getTreeItemProps();
                return (
                    <TreeItemDelete
                        {...treeItemProps}
                        key={item.value}
                        onClick={() => handleClick(item.value as string)}
                        onDelete={removeFlatTreeItem}
                        ref={
                            item.value === itemToFocusValue
                                ? itemToFocusRef
                                : undefined
                        }
                    >
                        {content}
                    </TreeItemDelete>
                );
            })}
        </FlatTree>
    );
};

export default SidePanel;
