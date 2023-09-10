export function isUndefinedOrNull(value) {
    return typeof value === 'undefined' || value == null;
}
export function mergeObjects(defaultObj, newObj, excludedKeys = []) {
    const mergedObject = Object.assign({}, defaultObj);
    for (const key in defaultObj) {
        if (key in newObj && !excludedKeys.includes(key)) {
            mergedObject[key] = newObj[key];
        }
    }
    return mergedObject;
}
