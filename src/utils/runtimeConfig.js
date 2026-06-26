export const getRuntimeConfig = () => window.__APP_CONFIG__ ?? {};

export const getRuntimeValue = (key, fallback) => {
    const value = getRuntimeConfig()[key];
    return value ?? fallback;
};

export const getRuntimeNumber = (key, fallback) => {
    const value = Number(getRuntimeValue(key, fallback));
    return Number.isFinite(value) ? value : Number(fallback);
};
