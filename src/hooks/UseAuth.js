import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { resolveLogoutUrl } from '../utils/authRedirect';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getToken = () => Cookies.get('accessToken');

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp < Date.now() / 1000;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const token = getToken();
        const tokenIsValid = Boolean(token) && !isTokenExpired(token);

        if (!tokenIsValid) {
            window.location.href = resolveLogoutUrl();
        }

        setIsAuthenticated(tokenIsValid);
        setIsLoading(false);
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;
