import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        Cookies.remove('accessToken', { path: '/' });
        window.location.href = "http://localhost:8080/oj/logout.php";
    }, [navigate]);

    return <div>Cerrando sesión...</div>;
}
