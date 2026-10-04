import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';

const REFRESH_MS = 5000;

const problemLetter = (num) => (num >= 0 ? String.fromCharCode(65 + num) : '—');

export default function SimilarityPage() {
    const { contestId } = useParams();
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        apiService.get(`contests/${contestId}/similarity`)
            .then(data => { setReport(data); setError(null); })
            .catch(err => setError(err?.response?.data?.message ?? 'No se pudo cargar el reporte de similitud.'));
    }, [contestId]);

    useEffect(() => { load(); }, [load]);

    // Poll only while the judge is still working on a requested run.
    useEffect(() => {
        if (!report?.running) return undefined;
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [report?.running, load]);

    const run = () => {
        if (!window.confirm('Se borrarán las similitudes anteriores de este concurso y se volverán a calcular. ¿Continuar?')) return;
        apiService.post(`contests/${contestId}/similarity/run`)
            .then(load)
            .catch(err => setError(err?.response?.data?.message ?? 'No se pudo iniciar el anti-plagio.'));
    };

    if (error && !report) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    if (!report) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-2xl font-bold">Similitud de código: concurso {contestId}</h1>
                <button type="button" onClick={run} disabled={report.running}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    {report.running ? 'Analizando…' : 'Ejecutar anti-plagio'}
                </button>
            </div>

            {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

            <p className="mb-3 text-xs text-gray-500">
                La similitud es un indicio, no una prueba. Solo se comparan soluciones aceptadas del mismo problema y lenguaje, entre usuarios distintos.
            </p>

            {report.items.length === 0
                ? <p className="text-sm text-gray-500">{report.running ? 'Análisis en proceso…' : 'Sin coincidencias registradas.'}</p>
                : (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Problema</th>
                                <th className="px-4 py-2">Usuario</th>
                                <th className="px-4 py-2">Similar a</th>
                                <th className="px-4 py-2">Similitud</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {report.items.map(item => (
                                <tr key={`${item.solutionId}-${item.similarSolutionId}`}>
                                    <td className="px-4 py-2">{problemLetter(item.problemNum)} <span className="text-gray-400">({item.problemId})</span></td>
                                    <td className="px-4 py-2">{item.userId} <span className="text-gray-400">#{item.solutionId}</span></td>
                                    <td className="px-4 py-2">{item.similarUserId} <span className="text-gray-400">#{item.similarSolutionId}</span></td>
                                    <td className="px-4 py-2 font-semibold">{Math.round(item.percentage)}%</td>
                                    <td className="px-4 py-2">
                                        <a className="text-blue-600 hover:text-blue-900" target="_blank" rel="noreferrer"
                                            href={`/diff_code.php?solution_id=${item.solutionId}&solution_id2=${item.similarSolutionId}`}>Comparar</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
}
