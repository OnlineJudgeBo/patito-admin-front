import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const ACCESS_TOKEN_COOKIE = 'accessToken';

const ADMIN_ROLE_ALIASES = new Set([
    'administrador',
    'admin',
    'administrator',
    'docente',
    'teacher',
    'auxiliar',
    'assistant',
    'contest_creator',
]);

const ROLE_CLAIM_KEYS = [
    'roles',
    'role',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_COOKIE);

export const setAccessToken = (token) => {
    Cookies.set(ACCESS_TOKEN_COOKIE, token, { path: '/' });
};

export const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);

        if (!decoded?.exp) {
            return false;
        }

        return decoded.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};

export const decodeAccessToken = (token) => {
    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};

export const extractRoles = (decodedToken) => {
    if (!decodedToken) {
        return [];
    }

    return ROLE_CLAIM_KEYS.flatMap((key) => {
        const value = decodedToken[key];

        if (Array.isArray(value)) {
            return value;
        }

        if (typeof value === 'string') {
            return value.split(',');
        }

        return [];
    })
        .map((role) => String(role).trim())
        .filter(Boolean);
};

export const hasAdminPanelRole = (roles) => roles.some((role) => {
    const normalizedRole = String(role).trim().toLowerCase();
    return ADMIN_ROLE_ALIASES.has(normalizedRole);
});

export const getAdminAuthState = () => {
    const token = getAccessToken();
    const hasValidToken = Boolean(token) && !isTokenExpired(token);
    const decodedToken = hasValidToken ? decodeAccessToken(token) : null;
    const roles = extractRoles(decodedToken);
    const hasAdminAccess = hasValidToken && hasAdminPanelRole(roles);

    return {
        token,
        roles,
        hasValidToken,
        hasAdminAccess,
        isAuthenticated: hasAdminAccess,
    };
};
