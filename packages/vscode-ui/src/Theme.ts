import {
    BrandVariants,
    createDarkTheme,
    createLightTheme,
    Theme,
} from "@fluentui/react-components";

const aiFoundryTheme: BrandVariants = {
    10: "#020305",
    20: "#111723",
    30: "#16263D",
    40: "#193253",
    50: "#1B3F6A",
    60: "#1B4C82",
    70: "#18599B",
    80: "#1267B4",
    90: "#3174C2",
    100: "#4F82C8",
    110: "#6790CF",
    120: "#7D9ED5",
    130: "#92ACDC",
    140: "#A6BAE2",
    150: "#BAC9E9",
    160: "#CDD8EF",
};

const lightTheme: Theme = {
    ...createLightTheme(aiFoundryTheme),
};

const darkTheme: Theme = {
    ...createDarkTheme(aiFoundryTheme),
};

darkTheme.colorBrandForeground1 = aiFoundryTheme[110];
darkTheme.colorBrandForeground2 = aiFoundryTheme[120];

export function currentTheme(): Theme {
    return darkTheme;
}

export function getTextColor(): string {
    return "#FFFFFF";
}

export function getBackgroundColor(): string {
    return "#000000";
}

export function getChatBgColorUser(): string {
    return "#444";
}

export function getChatBgColorAi(): string {
    return "#888";
}
