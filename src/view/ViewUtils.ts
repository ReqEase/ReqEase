export type ColorState = 'success' | 'error' | 'warning' | 'info' | 'default';
export type Color = string & ({ startsWith: (prefix: "#") => boolean } | { startsWith: (prefix: "rgb") => boolean });

export function getColorFromColorState(colorState: ColorState | Color): Color {
    if (colorIsColor(colorState)) return colorState;
    switch (colorState) {
        case "success":
            return "#28a745";
        case "error":
            return "#dc3545";
        case "warning":
            return "#ffc107";
        case "info":
            return "#17a2b8";
        case "default":
            return "#007bff";
    }
}

export function colorIsColor(color: ColorState | Color): color is Color {
    return typeof color === "string" && (color.startsWith("#") || color.startsWith("rgb"));
}
export function colorIsColorState(color: ColorState | Color): color is ColorState {
    return !colorIsColor(color);
}