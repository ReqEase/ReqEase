export var DataType;
(function (DataType) {
    DataType["JSON"] = "json";
    DataType["TEXT"] = "text";
    DataType["HTML"] = "html";
})(DataType || (DataType = {}));
export const defaultDataType = DataType.JSON;
