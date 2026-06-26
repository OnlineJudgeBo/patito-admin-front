/* eslint-disable react/prop-types */
import UseAuth from './hooks/UseAuth';
import { resolveLogoutUrl } from './utils/authRedirect';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = UseAuth();
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = resolveLogoutUrl();
        return null;
    }

    return children;
};

export default PrivateRoute;
