import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

function ListProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [filter, setFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [problemsPerPage] = useState(100);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        apiService.fetchProblems()
            .then(data => {
                console.log(data);
                setProblems(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    const sortedAndFilteredProblems = React.useMemo(() => {
        let sortableItems = [...problems];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filter ? sortableItems.filter(problem =>
            problem.title.toLowerCase().includes(filter.toLowerCase()) ||
            problem.classifications.some(classification =>
                classification.topic.name.toLowerCase().includes(filter.toLowerCase()) ||
                classification.name.toLowerCase().includes(filter.toLowerCase())
            )
        ) : sortableItems;

    }, [problems, sortConfig, filter]);

    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = sortedAndFilteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const requestSort = key => {
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
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o tema..."
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
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('problemId')}>Id</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('title')}>Nombre▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('inDate')}>Fecha de Creación▲▼</th>
                                <th className="px-4 py-2">Se puede usar? ▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('submit')}>Intentos▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('accepted')}>Resuelto por▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('topic')}>Tema▲▼</th>
                                <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('classification')}>Clasificación▲▼</th>
                                <th className="px-4 py-2">TestData</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProblems.map((problem) => (
                                <tr key={problem.problemId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.problemId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900"
                                            target="_blank"
                                            href={`/admin/problems/edit/${problem.problemId}`}>
                                            {problem.title}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(problem.inDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.defunct === 'Y' ? 'No' : 'Sí'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.submit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.accepted}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {
                                            problem.classifications ?
                                                Array.from(new Set(problem.classifications.map(classification => classification.topic.name)))
                                                    .map((name, index) => (
                                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                                            {name}<br />
                                                        </span>
                                                    )) : ""
                                        }
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {
                                            problem.classifications ?
                                                Array.from(new Set(problem.classifications.map(classification => classification.name)))
                                                    .map((name, index) => (
                                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                                            {name}<br />
                                                        </span>
                                                    )) : ""
                                        }
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a className="text-blue-600 hover:text-blue-900" href={`/admin/fileManager/${problem.problemId}`}>Tes Data</a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-4">
                                        <a className="text-blue-600 hover:text-blue-900" href={`/admin/problems/edit/${problem.problemId}`}>Editar</a>
                                        <a className="text-red-600 hover:text-red-900" href="#" onClick={(e) => { e.preventDefault(); alert('Función de borrar no implementada.'); }}>Borrar</a>
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

export default ListProblemsPage;
