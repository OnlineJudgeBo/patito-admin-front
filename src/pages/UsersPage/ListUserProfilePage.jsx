import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '../../services/apiService';
import { ChangePasswordComponent } from './ChangePasswordComponent';
import { DeleteAccountComponent } from './DeleteAccountComponent';
import { EditProfileComponent } from './EditProfileComponent';

function ListUserProfilePage() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(500);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (filter.length > 2) {
            fetchUsers(filter);
        }
    }, [filter]);

    const fetchUsers = useCallback((searchTerm = '') => {
        setIsLoading(true);
        apiService.fetchUserProfileList({ searchTerm })
            .then(data => {
                let userList = data.map(user => ({
                    userId: user.userId,
                    email: user.userProfile.email,
                    nick: user.userProfile.nick,
                    lastname: user.userProfile.lastname
                }))
                setUsers(userList);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [users, sortConfig]);

    const currentUsers = useMemo(() => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        return sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    }, [currentPage, usersPerPage, sortedUsers]);

    const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    const requestSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o nombre de usuario..."
                    value={filter}
                    onChange={handleFilterChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {isLoading ? (
                <div className="text-center">Cargando...</div>
            ) : error ? (
                <div className="text-red-500 text-center">Error al cargar los datos: {error}</div>
            ) : (
                <>
                    <table className="table-auto w-full border-collapse">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('email')}>Correo▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userId')}>Nombre de Usuario▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('nick')}>Nombre▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('lastname')}>Apellido▲▼</th>
                                <th className="px-4 py-2">Editar</th>
                                <th className="px-4 py-2">Cambiar Clave</th>
                                <th className="px-4 py-2">Desactivar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.map((user) => (
                                <tr key={user.userId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nick}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <EditProfileComponent email={user.email} username={user.userId} name={user.nick} lastname={user.lastname} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <ChangePasswordComponent userId={user.userId} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <DeleteAccountComponent userId={user.userId} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedUsers.length === 0 && <div className="text-center my-4">No se encontraron usuarios con esos criterios de búsqueda.</div>}
                    <nav className="flex justify-center mt-4">
                        {new Array(Math.ceil(sortedUsers.length / usersPerPage)).fill().map((_, idx) => (
                            <a key={idx + 1} onClick={() => paginate(idx + 1)} href="#!" className="mx-1 px-3 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer">
                                {idx + 1}
                            </a>
                        ))}
                    </nav>
                </>
            )}
        </div>
    );
}

export default ListUserProfilePage;
