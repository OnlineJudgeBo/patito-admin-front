import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

function ListUserProfilePage() {
    const [problems, setProblems] = useState([]);
    const [filter, setFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [problemsPerPage] = useState(500);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        apiService.fetchUserProfileList()
            .then(data => {
                setProblems(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    const sortedAndFilteredProblems = React.useMemo(() => {
        let sortableItems = [...problems];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = getNestedValue(a, sortConfig.key);
                const bValue = getNestedValue(b, sortConfig.key);
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                  }
                  if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                  }
                return 0;
            });
        }
        return filter ? sortableItems.filter(problem =>
            problem.userId.toLowerCase().includes(filter.toLowerCase()) ||
            (problem.userProfile.email && problem.userProfile.email.toLowerCase().includes(filter.toLowerCase())) ||
            (problem.userProfile.nick && problem.userProfile.nick.toLowerCase().includes(filter.toLowerCase())) ||
            (problem.userProfile.lastname && problem.userProfile.lastname.toLowerCase().includes(filter.toLowerCase()))
        ) : sortableItems;


    }, [problems, sortConfig, filter]);

    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = sortedAndFilteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };


    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(sortedAndFilteredProblems.length / problemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o nombre de usuario..."
                    onChange={(e) => setFilter(e.target.value)}
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
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userProfile.email')}>Correo▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userId')}>Nombre de Usuario▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userProfile.nick')}>Nombre▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userProfile.lastname')}>Apellido▲▼</th>
                                <th className="px-4 py-2">Editar</th>
                                <th className="px-4 py-2">Cambiar Clave</th>
                                <th className="px-4 py-2">Desactivar</th>

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProblems.map((problem) => (
                                <tr key={problem.userId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.userProfile.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.userId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.userProfile.nick}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.userProfile.lastname}</td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900"
                                            target="_blank"
                                            href={`https://jv.umsa.bo/oj/problem.php?id=${problem.userId}`}>
                                            Editar
                                        </a>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900"
                                            target="_blank"
                                            href={`https://jv.umsa.bo/oj/problem.php?id=${problem.UserId}`}>
                                            Cambiar Clave
                                        </a>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900"
                                            target="_blank"
                                            href={`https://jv.umsa.bo/oj/problem.php?id=${problem.problemId}`}>
                                            Desactivar
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedAndFilteredProblems.length === 0 && <div className="text-center my-4">No se encontraron problemas con esos criterios de búsqueda.</div>}
                    <nav className="flex justify-center mt-4">
                        {pageNumbers.map(number => (
                            <a key={number} onClick={() => paginate(number)} href="#!" className="mx-1 px-3 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer">
                                {number}
                            </a>
                        ))}
                    </nav>
                </>
            )}
        </div>
    );
}

export default ListUserProfilePage;
