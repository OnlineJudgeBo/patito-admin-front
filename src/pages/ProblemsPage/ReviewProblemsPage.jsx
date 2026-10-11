import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

// What to look for, most serious first. "unsolved" is only a hint, so it does not count as a problem to fix.
const KINDS = [
    { code: 'no-tests', label: 'Sin casos de prueba' },
    { code: 'only-samples', label: 'Solo casos de ejemplo' },
    { code: 'unpaired', label: 'Entradas o salidas sueltas' },
    { code: 'no-checker', label: 'Juez especial sin checker' },
    { code: 'subtasks', label: 'Subtareas mal armadas' },
    { code: 'no-description', label: 'Sin descripción' },
    { code: 'no-input', label: 'Sin descripción de la entrada' },
    { code: 'no-output', label: 'Sin descripción de la salida' },
    { code: 'no-samples', label: 'Sin casos de ejemplo' },
    { code: 'unsolved', label: 'Nadie lo ha resuelto' },
];

const serious = (problem) => problem.issues.filter(issue => issue.code !== 'unsolved');

// Read-only review of the problems: what each one is missing in its statement and in its judge files.
export default function ReviewProblemsPage() {
    const [problems, setProblems] = useState(null);
    const [error, setError] = useState('');
    const [kind, setKind] = useState('');

    useEffect(() => {
        apiService.get('problems/review')
            .then(setProblems)
            .catch(err => setError(err?.response?.data?.message ?? 'No se pudo revisar los problemas.'));
    }, []);

    if (!problems) {
        return <div className="p-4">{error ? <span className="text-red-600">{error}</span> : 'Revisando los problemas...'}</div>;
    }

    const count = (code) => problems.filter(problem => problem.issues.some(issue => issue.code === code)).length;
    const shown = problems.filter(problem => kind
        ? problem.issues.some(issue => issue.code === kind)
        : serious(problem).length > 0);
    // The administrator sees every site; the others only their own, so the column would repeat one name.
    const manySites = new Set(problems.flatMap(problem => problem.sites)).size > 1;

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-xl font-semibold">Revisión de problemas</h1>
            <p className="mt-1 mb-4 text-sm text-gray-600">
                {problems.length} problemas revisados, {problems.filter(problem => serious(problem).length > 0).length} con algo por corregir.
                Esta página solo revisa, no cambia nada.
            </p>

            <label htmlFor="review-kind" className="mr-2 text-sm font-medium text-gray-700">Mostrar</label>
            <select id="review-kind" className="mb-4 rounded border border-gray-300 px-2 py-1 text-sm"
                value={kind} onChange={event => setKind(event.target.value)}>
                <option value="">Todo lo que hay que corregir</option>
                {KINDS.map(item => <option key={item.code} value={item.code}>{item.label} ({count(item.code)})</option>)}
            </select>

            {shown.length === 0 ? (
                <p className="text-sm text-gray-600">Ningún problema con esa observación.</p>
            ) : (
                <div className="overflow-x-auto border rounded">
                    <table className="table-auto w-full border-collapse text-sm">
                        <thead className="bg-gray-700 text-left text-white">
                            <tr>
                                <th className="px-3 py-2">Id</th>
                                <th className="px-3 py-2">Nombre</th>
                                {manySites && <th className="px-3 py-2">Sitio</th>}
                                <th className="px-3 py-2">Casos</th>
                                <th className="px-3 py-2">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shown.map(problem => (
                                <tr key={problem.problemId} className="align-top">
                                    <td className="px-3 py-2 text-gray-500">{problem.problemId}</td>
                                    <td className="px-3 py-2">
                                        <a className="text-blue-600 hover:text-blue-900" href={`/admin/problems/edit/${problem.problemId}`}>{problem.title}</a>
                                        {problem.hidden && <span className="ml-2 text-xs text-gray-500">(oculto)</span>}
                                    </td>
                                    {manySites && <td className="px-3 py-2 text-gray-500">{problem.sites.join(', ')}</td>}
                                    <td className="px-3 py-2 text-gray-500">{problem.tests}</td>
                                    <td className="px-3 py-2">
                                        {problem.issues.map((issue, index) => (
                                            <div key={index} className={issue.code === 'unsolved' ? 'text-gray-500' : 'text-red-700'}>{issue.message}</div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
