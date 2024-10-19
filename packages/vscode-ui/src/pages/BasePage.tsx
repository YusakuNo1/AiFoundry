import * as React from "react";
import { Text } from '@fluentui/react/lib/Text';
import { FluentIcon, EditRegular } from "@fluentui/react-icons";
import {
    Select,
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
} from "@fluentui/react-components";
import { DefaultButton } from '@fluentui/react/lib/Button';
import { getTextColor } from "../theme/themes";

export type ColumnHeader = {
    key: string;
    label: string;
};

export type RowItem = {
    name: string;
    onClick?: () => void;
};

export type RowSelectionItem = {
    selectedIndex: number;
    options: string[];
    onChanged: (value: string) => void;
};

export type RowInfo = {
    type: "label" | "collection" | "selection";
    key: string;
    icon?: React.ReactElement<FluentIcon>;
    label: string;
    item: RowItem | RowItem[] | RowSelectionItem;
};

export type ActionButton = {
    key: string;
    label: string;
    onClick: () => void;
};

interface Props {
    title: string;
    columnStyles?: React.CSSProperties[];
    rows: RowInfo[];
    actionButtons: ActionButton[];
}

const BasePage: React.FC<Props> = (props: Props) => {
    const textColor = React.useMemo(() => getTextColor(), []);

    function RenderRowItem(props: { item: RowItem, columnStyles?: React.CSSProperties[] }) {
        return (
            <>
                <TableCell style={props.columnStyles?.[1]}>
                    {props.item.name}
                </TableCell>
                <TableCell style={props.columnStyles?.[2]}>
                    {props.item.onClick && <TableCellLayout media={<EditRegular />} onClick={props.item.onClick} />}
                </TableCell>
            </>
        );
    }

    function RenderRow(props: { row: RowInfo, columnStyles?: React.CSSProperties[] }) {
        const rowItem = props.row.type === "collection" ? ((props.row.item as RowItem[]).length === 0 ? { "name": "" } : (props.row.item as RowItem[])[0]) : props.row.item as RowItem;
        const numItems = props.row.type === "collection" ? Math.max((props.row.item as RowItem[]).length, 1) : 1;
        return (
            <>
                <TableRow>
                    <TableCell rowSpan={numItems} style={props.columnStyles?.[0]}>
                        <TableCellLayout media={props.row.icon ?? null}>{props.row.label}</TableCellLayout>
                    </TableCell>
                    <RenderRowItem item={rowItem} columnStyles={props.columnStyles} />
                </TableRow>

                {numItems > 1 && (props.row.item as RowItem[]).slice(1).map((item) => (
                    <TableRow key={item.name}>
                        <RenderRowItem item={item} columnStyles={props.columnStyles} />
                    </TableRow>
                ))}
            </>
        );
    }

    function RenderSelectionRow(props: { row: RowInfo, columnStyles?: React.CSSProperties[] }) {
        if (props.row.type !== "selection") {
            return null;
        }

        const rowItem: RowSelectionItem = props.row.item as RowSelectionItem;
        return (<TableRow>
            <TableCell style={props.columnStyles?.[0]}>
                {props.row.icon && <TableCellLayout media={props.row.icon}>{props.row.label}</TableCellLayout>}
                {!props.row.icon && props.row.label}
            </TableCell>
            <TableCell style={props.columnStyles?.[1]}>
                <Select
                    onChange={(ev, data) => {
                        rowItem.onChanged(data.value);
                    }}
                    value={rowItem.options[rowItem.selectedIndex]}
                    id="selection-id"
                >
                    {rowItem.options.map(key => (
                        <option key={key}>{key}</option>
                    ))}
                </Select>
            </TableCell>
            <TableCell style={props.columnStyles?.[2]}>&nbsp;</TableCell>
        </TableRow>);
    }

    return (
        <>
            <Table arial-label={`${props.title} table`}>
                <TableBody>
                    {props.rows.map((row) => {
                        if (row.type === "selection") {
                            return (<RenderSelectionRow key={row.key} row={row} columnStyles={props.columnStyles} />)
                        } else {
                            return (<RenderRow key={row.key} row={row} columnStyles={props.columnStyles} />)
                        }
                    })}
                </TableBody>
            </Table>

            {props.actionButtons.map((button) => <DefaultButton style={{ margin: 8 }} key={button.key} onClick={button.onClick}>{button.label}</DefaultButton>)}
        </>
    );
};

export default BasePage;
