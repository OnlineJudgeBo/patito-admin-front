import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Search, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import UseAuth from '../../hooks/UseAuth';
import { apiService } from '../../services/apiService';
import { DEFUNCT } from '../../utils/defunctStates';
import { ChangeStatusComponent } from './ChangeStatusComponent';

const PAGE_SIZE = 50;
const VISIBILITY_FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'visible', label: 'Visibles' },
    { key: 'hidden', label: 'Ocultos' },
];

function ListProblemsPage() {
    const { roles } = UseAuth();
    const isAdmin = roles.some((role) => String(role).trim().toLowerCase() === 'administrador');
    const [problems, setProblems] = useState([]);
    const [filter, setFilter] = useState('');
    const [visibility, setVisibility] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'problemId', direction: 'descending' });
    const [exportingId, setExportingId] = useState(null);

    const handleExport = async (problemId) => {
        setExportingId(problemId);
        try {
            const blob = await apiService.exportProblem(problemId);
            const downloadUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = `problem-${problemId}.zip`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (apiError) {
            alert(apiError?.response?.data?.message || apiError?.message || 'No se pudo exportar el problema.');
        } finally {
            setExportingId(null);
        }
    };

    const handleRejudge = (problem) => {
        if (confirm(`¿Volver a juzgar todos los envíos de "${problem.title}"?`)) {
            apiService.get(`judge/rejudge/problem/${problem.problemId}`).then(() => window.location.reload());
        }
    };

    const handleDelete = (problem) => {
        if (confirm(`¿Borrar el problema ${problem.problemId} "${problem.title}"?`)) {
            apiService.delete(`problems/${problem.problemId}`).then(() => window.location.reload());
        }
    };

    useEffect(() => {
        apiService.fetchProblems()
            .then(data => {
                setProblems(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    const sortedAndFilteredProblems = React.useMemo(() => {
        const text = filter.trim().toLowerCase();
        const items = problems.filter((problem) =>
            (visibility === 'all' || (visibility === 'hidden') === (problem.defunct === DEFUNCT.HIDDEN)) &&
            (!text ||
                problem.problemId.toString().includes(text) ||
                problem.title.toLowerCase().includes(text) ||
                problem.classifications?.some((classification) =>
                    classification.topic.name.toLowerCase().includes(text) ||
                    classification.name.toLowerCase().includes(text)
                ))
        );
        const { key, direction } = sortConfig;
        const sign = direction === 'ascending' ? 1 : -1;
        return items.sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0));
    }, [problems, sortConfig, filter, visibility]);

    const pageCount = Math.max(1, Math.ceil(sortedAndFilteredProblems.length / PAGE_SIZE));
    const page = Math.min(currentPage, pageCount);
    const currentProblems = sortedAndFilteredProblems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hiddenCount = problems.filter((problem) => problem.defunct === DEFUNCT.HIDDEN).length;

    const requestSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
        setSortConfig({ key, direction });
    };

    const SortHeader = ({ sortKey, children, className = '', title }) => {
        const Icon = sortConfig.key !== sortKey ? ArrowUpDown : sortConfig.direction === 'ascending' ? ArrowUp : ArrowDown;
        return (
            <th className={`px-3 py-2 font-medium ${className}`} title={title}>
                <button type="button" onClick={() => requestSort(sortKey)} className="inline-flex items-center gap-1 hover:text-gray-900">
                    {children}
                    <Icon className={`h-3.5 w-3.5 ${sortConfig.key === sortKey ? 'text-indigo-600' : 'text-gray-400'}`} />
                </button>
            </th>
        );
    };

    const menuItem = 'block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-gray-100';

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Problemas</h1>
                    {!isLoading && !error && (
                        <p className="text-sm text-gray-500">{problems.length} problemas · {hiddenCount} ocultos</p>
                    )}
                </div>
                {isAdmin && (
                    <a
                        href="/admin/problems/import"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded"
                    >
                        <Upload className="h-4 w-4" /> Importar problema
                    </a>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[16rem]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        value={filter}
                        placeholder="Buscar por ID, nombre, tema o clasificación..."
                        onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div className="inline-flex rounded border border-gray-300 p-0.5 text-sm">
                    {VISIBILITY_FILTERS.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => { setVisibility(option.key); setCurrentPage(1); }}
                            className={`rounded px-3 py-1.5 ${visibility === option.key ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-gray-500">Cargando...</div>
            ) : error ? (
                <div className="text-red-500 text-center">Error al cargar los datos: {error}</div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded border bg-white">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 text-left text-gray-600">
                                <tr className="border-b">
                                    <SortHeader sortKey="problemId" className="w-20">ID</SortHeader>
                                    <SortHeader sortKey="title">Problema</SortHeader>
                                    <SortHeader sortKey="defunct" className="w-28">Visible</SortHeader>
                                    <SortHeader sortKey="accepted" className="w-32" title="Resueltos / intentos">Resueltos</SortHeader>
                                    <SortHeader sortKey="inDate" className="w-28">Creación</SortHeader>
                                    <th className="w-36 px-3 py-2 text-right font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentProblems.map((problem) => {
                                    const topics = [...new Set((problem.classifications ?? []).map((classification) => classification.topic.name))];
                                    const names = [...new Set((problem.classifications ?? []).map((classification) => classification.name))];
                                    const rate = problem.submit > 0 ? Math.round((problem.accepted / problem.submit) * 100) : null;
                                    return (
                                        <tr key={problem.problemId} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-mono text-gray-500">{problem.problemId}</td>
                                            <td className="px-3 py-2">
                                                <a className="font-medium text-indigo-700 hover:underline" href={`/admin/problems/edit/${problem.problemId}`}>
                                                    {problem.title}
                                                </a>
                                                {(topics.length > 0 || names.length > 0) && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {topics.map((name) => (
                                                            <span key={`t-${name}`} className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{name}</span>
                                                        ))}
                                                        {names.map((name) => (
                                                            <span key={`c-${name}`} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <ChangeStatusComponent problemId={problem.problemId} initialDefunct={problem.defunct} />
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                                {problem.accepted} / {problem.submit}
                                                {rate !== null && <span className="ml-1 text-xs text-gray-400">({rate}%)</span>}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-500">{new Date(problem.inDate).toLocaleDateString()}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a
                                                        href={`/admin/problems/edit/${problem.problemId}`}
                                                        className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1 text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" /> Editar
                                                    </a>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button type="button" className="rounded p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Más acciones">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="end" className="w-48 p-1">
                                                            <a className={menuItem} href={`/admin/fileManager/${problem.problemId}`}>Casos de prueba</a>
                                                            <a className={menuItem} href={`/admin/fileManager/${problem.problemId}/ac`}>Soluciones</a>
                                                            <a className={menuItem} href={`/admin/problems/${problem.problemId}/scoring`}>Puntaje</a>
                                                            {isAdmin && (
                                                                <button type="button" className={menuItem} onClick={() => handleExport(problem.problemId)}>
                                                                    {exportingId === problem.problemId ? 'Exportando...' : 'Exportar .zip'}
                                                                </button>
                                                            )}
                                                            <button type="button" className={menuItem} onClick={() => handleRejudge(problem)}>Rejudge</button>
                                                            <div className="my-1 border-t" />
                                                            <button type="button" className={`${menuItem} text-red-600 hover:bg-red-50`} onClick={() => handleDelete(problem)}>Borrar</button>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {sortedAndFilteredProblems.length === 0 && (
                            <div className="py-10 text-center text-gray-500">No se encontraron problemas con esos criterios de búsqueda.</div>
                        )}
                    </div>

                    {pageCount > 1 && (
                        <nav className="mt-4 flex items-center justify-between text-sm text-gray-600">
                            <span>
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedAndFilteredProblems.length)} de {sortedAndFilteredProblems.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button type="button" disabled={page === 1} onClick={() => setCurrentPage(page - 1)}
                                    className="rounded border px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40">Anterior</button>
                                <span>Página {page} de {pageCount}</span>
                                <button type="button" disabled={page === pageCount} onClick={() => setCurrentPage(page + 1)}
                                    className="rounded border px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40">Siguiente</button>
                            </div>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}

export default ListProblemsPage;
