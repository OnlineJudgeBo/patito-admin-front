import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const getLogoutURL = () => {
    const hostname = window.location.hostname;

    if (hostname === "juezvirtual.local") {
        return "https://juezvirtual.local/oj/logout.php";
    } else if (hostname === "juezvirtual.local") {
        return "https://juezvirtual.local/logout.php";
    } else if (hostname === "jv.umsa.bo") {
        return "http://jv.umsa.bo/logout.php";
    } else {
        return "/logout.php";
    }
};

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
            window.location.href = getLogoutURL();
        }
        setIsAuthenticated(tokenIsValid);
        setIsLoading(false);
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;
