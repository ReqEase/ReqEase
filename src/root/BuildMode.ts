export enum BuildMode {
    onInit = 'onInit',
    everytime = 'everytime',
}

export type BuildModeString = keyof typeof BuildMode;

export const defaultBuildMode = BuildMode.onInit;