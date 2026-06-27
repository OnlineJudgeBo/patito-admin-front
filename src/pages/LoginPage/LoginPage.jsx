import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import UseAuth from '../../hooks/UseAuth';
import { apiService } from '../../services/apiService';
import { getAdminAuthState, setAccessToken } from '../../utils/auth';
import { resolveLogoutUrl } from '../../utils/authRedirect';

function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, hasValidToken, roles, isLoading } = UseAuth();
    const logoutUrl = useMemo(() => resolveLogoutUrl(), []);
    const from = location.state?.from || '/admin';
    const [loginStatus, setLoginStatus] = useState('idle');
    const [submittedRoles, setSubmittedRoles] = useState([]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmittedRoles([]);
        setLoginStatus('authenticating');

        try {
            const formData = new FormData(event.currentTarget);
            const username = String(formData.get('username') || '').trim();
            const password = String(formData.get('password') || '');
            const response = await apiService.login(username, password);
            const token = response?.accessToken ?? response?.AccessToken;

            if (!token) {
                setLoginStatus('invalid');
                return;
            }

            setAccessToken(token);
            const authState = getAdminAuthState();

            if (authState.hasAdminAccess) {
                window.dispatchEvent(new Event('auth-changed'));
                navigate(from, { replace: true });
                return;
            }

            setSubmittedRoles(authState.roles);
            setLoginStatus('unauthorized');
        } catch {
            setLoginStatus('invalid');
        }
    };

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const deniedRoles = submittedRoles.length > 0 ? submittedRoles : roles;
    const showUnauthorized = hasValidToken || loginStatus === 'unauthorized';

    return (
        <div className="grid gap-6 py-8 px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg max-w-md mx-auto">
            <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Inicio de Sesión
                </h2>
            </div>

            {showUnauthorized ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Tu usuario no tiene permisos para el admin.</p>
                    <p className="mt-2">
                        Debes iniciar sesión con una cuenta con rol Administrador, Docente o Auxiliar.
                    </p>
                    {deniedRoles.length > 0 && (
                        <p className="mt-2 text-xs">Roles actuales: {deniedRoles.join(', ')}</p>
                    )}
                    <a href={logoutUrl} className="mt-4 inline-flex rounded-md bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">
                        Salir e iniciar con otra cuenta
                    </a>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {loginStatus === 'authenticating' && (
                        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                            Validando credenciales y permisos...
                        </p>
                    )}
                    {loginStatus === 'invalid' && (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                            No se pudo iniciar sesión.
                        </p>
                    )}
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username" className="font-semibold text-gray-900">
                                Usuario
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                disabled={loginStatus === 'authenticating'}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password" className="font-semibold text-gray-900">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                disabled={loginStatus === 'authenticating'}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                            />
                        </div>
                        <Button type="submit" disabled={loginStatus === 'authenticating'} className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-2 text-white rounded-md px-4 py-2">
                            {loginStatus === 'authenticating' ? 'Validando...' : 'Iniciar'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default LoginPage;
