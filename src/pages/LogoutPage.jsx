import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        Cookies.remove('accessToken', { path: '/' });
        window.location.href = redirectLogoutURL();
    }, [navigate]);

    return <div>Cerrando sesión...</div>;
}
