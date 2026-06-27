import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_COOKIE = 'accessToken';

const isTokenExpired = (token) => {
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

const UseAuth = () => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const token = Cookies.get(ACCESS_TOKEN_COOKIE);
        const isAuthenticated = Boolean(token) && !isTokenExpired(token);

        setAuthState({
            isAuthenticated,
            isLoading: false,
        });
    }, []);

    return authState;
};

export default UseAuth;
