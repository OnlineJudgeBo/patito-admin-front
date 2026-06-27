import { useEffect, useState } from 'react';
import { getAdminAuthState } from '../utils/auth';

const readAuthState = () => ({
    ...getAdminAuthState(),
    isLoading: false,
});

const UseAuth = () => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        hasValidToken: false,
        hasAdminAccess: false,
        roles: [],
        isLoading: true,
    });

    useEffect(() => {
        const refreshAuthState = () => setAuthState(readAuthState());

        refreshAuthState();
        window.addEventListener('auth-changed', refreshAuthState);
        window.addEventListener('focus', refreshAuthState);

        return () => {
            window.removeEventListener('auth-changed', refreshAuthState);
            window.removeEventListener('focus', refreshAuthState);
        };
    }, []);

    return authState;
};

export default UseAuth;
