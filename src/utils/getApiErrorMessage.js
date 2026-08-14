export function getApiErrorMessage(error, fallback) {
    const responseData = error?.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
        return responseData;
    }

    return responseData?.message || responseData?.title || error?.message || fallback;
}
