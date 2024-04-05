// Ajusta la importación de jwt-decode
import {jwtDecode} from 'jwt-decode'; 
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Usa Cookies.get para obtener el token de accessToken
    const getToken = () => Cookies.get('accessToken');

    // Verifica si el token ha expirado
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token); // Decodifica el token JWT
            return decoded.exp < Date.now() / 1000;
        } catch (error) {
            //window.location.href = "jv.umsa.bo/oj";
            return true; // Si hay un error al decodificar, considera el token como expirado
        }
    };

    // Verifica si el usuario está autenticado
    useEffect(() => {
        const token = getToken(); // Obtén el token
        const tokenIsValid = token && !isTokenExpired(token); // Verifica si el token es válido y no ha expirado
        setIsAuthenticated(tokenIsValid);
        setIsLoading(false); // Actualiza el estado de carga
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;
