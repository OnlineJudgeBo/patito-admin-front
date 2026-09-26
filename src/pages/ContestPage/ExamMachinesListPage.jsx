/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

// Entry point for lab machines: every exam, running ones first.
const parse = (value) => new Date(String(value).replace(' ', 'T'));

function ExamRow({ contest, now }) {
    const start = parse(contest.startTime);
    const end = parse(contest.endTime);
    const state = now < start ? 'Próximo' : now > end ? 'Terminado' : 'En curso';
    const tone = state === 'En curso' ? 'bg-green-100 text-green-800' : state === 'Próximo' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600';
    return (
        <tr className="border-b">
            <td className="px-4 py-2 text-sm">{contest.contestId}</td>
            <td className="px-4 py-2 text-sm font-medium">{contest.title}</td>
            <td className="px-4 py-2 text-sm text-gray-500">{contest.startTime} → {contest.endTime}</td>
            <td className="px-4 py-2 text-sm"><span className={`rounded px-2 py-0.5 text-xs ${tone}`}>{state}</span></td>
            <td className="px-4 py-2 text-sm">
                <a href={`/admin/contests/${contest.contestId}/machines`} className="mr-3 font-semibold text-blue-600">Máquinas</a>
                <a href={`/admin/contests/${contest.contestId}/monitor`} className="text-blue-600">Monitoreo de IPs</a>
            </td>
        </tr>
    );
}

export default function ExamMachinesListPage() {
    const [contests, setContests] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiService.fetchContestsList()
            .then(data => setContests((data || []).filter(contest => contest.isExam)))
            .catch(err => setError(err?.response?.data?.message ?? 'No se pudieron cargar los exámenes.'));
    }, []);

    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!contests) return <div className="p-4 text-center">Cargando...</div>;

    const now = new Date();
    const order = (contest) => (now > parse(contest.endTime) ? 2 : now < parse(contest.startTime) ? 1 : 0);
    const sorted = [...contests].sort((a, b) => order(a) - order(b) || parse(b.startTime) - parse(a.startTime));

    return (
        <div className="container mx-auto w-full min-w-full p-4">
            <h1 className="mb-1 text-2xl font-bold">Máquinas de laboratorio</h1>
            <p className="mb-4 text-sm text-gray-500">Exámenes con PCs del laboratorio. Para que un concurso aparezca aquí, márcalo como examen al crearlo o editarlo.</p>
            {sorted.length === 0 ? <p className="text-gray-500">No hay exámenes.</p> : (
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-gray-700 text-left text-white">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Examen</th>
                            <th className="px-4 py-2">Horario</th>
                            <th className="px-4 py-2">Estado</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>{sorted.map(contest => <ExamRow key={contest.contestId} contest={contest} now={now} />)}</tbody>
                </table>
            )}
        </div>
    );
}
