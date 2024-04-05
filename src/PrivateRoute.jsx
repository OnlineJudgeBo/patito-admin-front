import React from 'react';
import UseAuth from './hooks/UseAuth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = UseAuth();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = "http://localhost:8080/oj";
        return null;
    }

    return children;
};

export default PrivateRoute;
