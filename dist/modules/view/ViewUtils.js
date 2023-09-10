export function getColorFromColorState(colorState) {
    if (colorIsColor(colorState))
        return colorState;
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
export function colorIsColor(color) {
    return typeof color === "string" && (color.startsWith("#") || color.startsWith("rgb"));
}
export function colorIsColorState(color) {
    return !colorIsColor(color);
}
