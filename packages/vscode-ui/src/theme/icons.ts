import type { ThemeNameType } from "./themes";
import { getDownloadIcon, getLockIcon, getTrashIcon } from "./iconTemplates";

const lightIconColor = "#424242";
const darkIconColor = "#C5C5C5";

type IconType = "lock" | "trash" | "download";
export const AifIcons: Record<ThemeNameType, Record<IconType, string>> = {
    light: {
        download: getDownloadIcon(lightIconColor),
        lock: getLockIcon(lightIconColor),
        trash: getTrashIcon(lightIconColor),
    },

    dark: {
        download: getDownloadIcon(darkIconColor),
        lock: getLockIcon(darkIconColor),
        trash: getTrashIcon(darkIconColor),
    },
};
