import React from 'react';
import UseAuth from './hooks/UseAuth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = UseAuth();
    const authRedirectUrl = import.meta.env.VITE_REACT_APP_AUTH_REDIRECT_URL;

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = authRedirectUrl;
        return null;
    }

    return children;
};

export default PrivateRoute;
