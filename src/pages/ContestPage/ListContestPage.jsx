import parse from 'html-react-parser';
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

function ListContestPage() {
    const [problems, setProblems] = useState([]);
    const [filter, setFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [problemsPerPage] = useState(20);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        apiService.fetchContestsList()
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
            (problem.contestId && problem.contestId.toString().includes(filter)) ||
            (problem.title && problem.title.toLowerCase().includes(filter.toLowerCase())) ||
            (problem.startTime && problem.startTime.toLowerCase().includes(filter.toLowerCase())) ||
            (problem.endTime && problem.endTime.toLowerCase().includes(filter.toLowerCase()))
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
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userProfile.email')}>Id</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userId')}>Titulo▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userProfile.nick')}>Fecha de Inicio▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('userProfile.lastname')}>Fecha de Fin▲▼</th>
                                <th className="px-4 py-2">Tipo de concurso</th>
                                <th className="px-4 py-2">Editar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProblems.map((problem) => (
                                <tr key={problem.contestId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.contestId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900"
                                            href={`/admin/contests/edit/${problem.contestId}`}>
                                            {parse(problem.title)}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.startTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.endTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.private == false ? "Publico" : "Privado"}</td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900"
                                            target="_blank"
                                            href={`/admin/contests/edit/${problem.contestId}`}>
                                            Editar
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

export default ListContestPage;
