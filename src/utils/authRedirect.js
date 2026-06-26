import { getRuntimeValue } from './runtimeConfig';

const normalizeUrl = (url) => String(url ?? '').trim();

export const resolveLogoutUrl = () => {
    const configuredLogoutUrl = normalizeUrl(getRuntimeValue('LOGOUT_URL', import.meta.env.VITE_LOGOUT_URL));

    if (!configuredLogoutUrl) {
        throw new Error('LOGOUT_URL is required.');
    }

    return configuredLogoutUrl;
};
