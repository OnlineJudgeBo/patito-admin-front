/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';
import UseAuth from './hooks/UseAuth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = UseAuth();
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default PrivateRoute;
