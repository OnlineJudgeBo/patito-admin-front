import React from 'react';
import UseAuth from './hooks/UseAuth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = UseAuth();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = "https://jv.umsa.bo";
        return null;
    }

    return children;
};

export default PrivateRoute;
