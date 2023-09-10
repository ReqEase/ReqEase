export var BuildMode;
(function (BuildMode) {
    BuildMode["onInit"] = "onInit";
    BuildMode["everytime"] = "everytime";
})(BuildMode || (BuildMode = {}));
export const defaultBuildMode = BuildMode.onInit;
