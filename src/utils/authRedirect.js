import { getRuntimeValue } from './runtimeConfig';

export const resolveLogoutUrl = () => {
    const configuredLogoutUrl = getRuntimeValue('LOGOUT_URL', import.meta.env.VITE_LOGOUT_URL)?.trim();

    if (!configuredLogoutUrl) {
        throw new Error('LOGOUT_URL is required.');
    }

    return configuredLogoutUrl;
};
