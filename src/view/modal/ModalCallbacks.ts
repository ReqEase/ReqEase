export interface ModalCallbacks {
    onOpen?: () => void;
    onClose?: () => void;
    onAction?: (action: string) => void;
    onBeforeAction?: (action: string, callback: () => void) => void;
}