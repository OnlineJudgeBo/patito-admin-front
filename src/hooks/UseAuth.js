import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
const CLIENT_URL = import.meta.env.VITE_REACT_APP_AUTH_REDIRECT_URL;

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getToken = () => Cookies.get('accessToken');

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp < Date.now() / 1000;
        } catch (error) {
            return true;
        }
    };

    useEffect(() => {
        const token = getToken();
        const tokenIsValid = token && !isTokenExpired(token);
        if (!tokenIsValid) {
            window.location.href = CLIENT_URL + "/logout.php";
        }
        setIsAuthenticated(tokenIsValid);
        setIsLoading(false);
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;
