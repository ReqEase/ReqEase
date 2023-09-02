export interface RequesterStrings {
    response: {
        modals: {
            data_needed: {
                title: string;
                message: string;
            },
            unknownErrorWithRetry: {
                title: string;
                message: string;
            },
            defaultConfirmationMsg: string;
        },
        retryButton: string;
        closeButton: string;
        yesButton: string;
        noButton: string;
        confirmButton: string;
        cancelButton: string;
        okButton: string;
    },
    loading: {
        loadingMessage: string;
    }
}

export const defaultRequesterStrings: RequesterStrings = {
    response: {
        modals: {
            data_needed: {
                title: "Almost there !",
                message: "You should fill the following fields to continue."
            },
            unknownErrorWithRetry: {
                title: "Unknown Error",
                message: "Unexpected response format. Please try again."
            },
            defaultConfirmationMsg: "Are you sure you want to continue?"
        },
        retryButton: "Retry",
        closeButton: "Close",
        yesButton: "Yes",
        noButton: "No",
        confirmButton: "Confirm",
        cancelButton: "Cancel",
        okButton: "OK"
    },
    loading: {
        loadingMessage: "Loading..."
    }
}