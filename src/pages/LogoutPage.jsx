import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const CLIENT_URL = import.meta.env.VITE_REACT_APP_AUTH_REDIRECT_URL;

export default function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        Cookies.remove('accessToken', { path: '/' });
        window.location.href = CLIENT_URL + "/logout.php";
    }, [navigate]);

    return <div>Cerrando sesión...</div>;
}
