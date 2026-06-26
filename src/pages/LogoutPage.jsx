import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveLogoutUrl } from '../utils/authRedirect';

export default function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        Cookies.remove('accessToken', { path: '/' });
        window.location.href = resolveLogoutUrl();
    }, [navigate]);

    return <div>Cerrando sesión...</div>;
}
