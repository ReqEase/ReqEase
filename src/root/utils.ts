export function isUndefinedOrNull(value: unknown): value is undefined | null {
    return typeof value === 'undefined' || value == null;
}

export function mergeObjects<DefaultObject>(defaultObj: DefaultObject, newObj: Partial<DefaultObject>, excludedKeys: string[] = []): DefaultObject {
    const mergedObject: DefaultObject = { ...defaultObj };

    for (const key in defaultObj) {
        if (key in newObj && !excludedKeys.includes(key)) {
            mergedObject[key] = newObj[key];
        }
    }

    return mergedObject;
}