/* eslint-disable react/prop-types */
import { Navigate, useLocation } from 'react-router-dom';
import UseAuth from './hooks/UseAuth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, hasValidToken, isLoading } = UseAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname, reason: hasValidToken ? 'unauthorized' : 'login-required' }}
            />
        );
    }

    return children;
};

export default PrivateRoute;
