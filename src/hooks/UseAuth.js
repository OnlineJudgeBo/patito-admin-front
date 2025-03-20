import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const redirectLogoutURL = () => {
    const hostname = window.location.hostname;
    let url = "";
    if (hostname === "juezvirtual.local") {
        url = "https://juezvirtual.local/oj/logout.php";
    } else if (hostname === "juezvirtual.local") {
        url = "https://juezvirtual.local/logout.php";
    } else if (hostname === "jv.umsa.bo") {
        url = "http://jv.umsa.bo/logout.php";
    } else {
        url = "/logout.php";
    }
    return url;
};

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
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
        const tokenIsValid = token && !isTokenExpired(token) || true;
        if (!tokenIsValid) {
            window.location.href = redirectLogoutURL();
        }
        setIsAuthenticated(tokenIsValid);
        setIsLoading(false);
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;