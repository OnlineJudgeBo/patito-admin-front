import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';

const TYPES = [
    { value: 'sum', label: 'Proporcional a los casos pasados' },
    { value: 'min', label: 'Todo o nada' },
    { value: 'mul', label: 'Producto' },
];

// Same glob the judge uses: *, ? and [set].
const matches = (pattern, test) => {
    const escaped = pattern.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    try {
        return new RegExp(`^${escaped}$`).test(test);
    } catch {
        return false;
    }
};

const patternsOf = (text) => text.split(',').map(item => item.trim()).filter(Boolean);

// Test groups (subtasks) of a problem: points per group and which tests belong to each.
export default function ScoringPage() {
    const { problemId } = useParams();
    const [groups, setGroups] = useState(null);
    const [tests, setTests] = useState([]);
    const [message, setMessage] = useState(null);

    const apply = useCallback((data) => {
        setTests(data.availableTests ?? []);
        setGroups((data.groups ?? []).map(group => ({ ...group, tests: (group.tests ?? []).join(', ') })));
    }, []);

    useEffect(() => {
        apiService.get(`problems/${problemId}/scoring`)
            .then(apply)
            .catch(err => setMessage({ error: true, text: err?.response?.data?.message ?? 'No se pudo cargar el puntaje.' }));
    }, [problemId, apply]);

    const update = (index, field, value) =>
        setGroups(groups.map((group, i) => (i === index ? { ...group, [field]: value } : group)));

    const save = () => {
        const body = { groups: groups.map(group => ({ ...group, points: Number(group.points), tests: patternsOf(group.tests) })) };
        apiService.put(`problems/${problemId}/scoring`, body)
            .then(data => { apply(data); setMessage({ error: false, text: 'Puntaje guardado.' }); })
            .catch(err => setMessage({ error: true, text: err?.response?.data?.message ?? 'No se pudo guardar el puntaje.' }));
    };

    if (!groups) {
        return <div className="p-4">{message ? <span className="text-red-600">{message.text}</span> : 'Cargando...'}</div>;
    }

    const total = groups.reduce((sum, group) => sum + (Number(group.points) || 0), 0);
    const unassigned = tests.filter(test => !groups.some(group => patternsOf(group.tests).some(pattern => matches(pattern, test))));

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-2xl font-bold">Puntaje por grupos: problema {problemId}</h1>
            <p className="mb-4 mt-1 text-sm text-gray-500">
                Cada grupo reparte sus puntos entre sus casos. Sin grupos, el problema se juzga como aceptado o rechazado.
                Los casos se eligen por nombre con comodines, separados por comas: <span className="font-mono">s1_*</span>, <span className="font-mono">caso?</span>.
            </p>

            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                        <th className="px-3 py-2">Nombre</th>
                        <th className="px-3 py-2">Puntos</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Casos</th>
                        <th className="px-3 py-2">Coinciden</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {groups.map((group, index) => (
                        <tr key={index}>
                            <td className="px-3 py-2">
                                <input className="w-full rounded border border-gray-300 px-2 py-1" aria-label="Nombre del grupo"
                                    value={group.name ?? ''} onChange={event => update(index, 'name', event.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                                <input type="number" min="1" className="w-24 rounded border border-gray-300 px-2 py-1" aria-label="Puntos"
                                    value={group.points} onChange={event => update(index, 'points', event.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                                <select className="rounded border border-gray-300 px-2 py-1" aria-label="Tipo de grupo"
                                    value={group.type} onChange={event => update(index, 'type', event.target.value)}>
                                    {TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                            </td>
                            <td className="px-3 py-2">
                                <input className="w-full rounded border border-gray-300 px-2 py-1 font-mono" aria-label="Casos del grupo"
                                    value={group.tests} onChange={event => update(index, 'tests', event.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                                {tests.filter(test => patternsOf(group.tests).some(pattern => matches(pattern, test))).length}
                            </td>
                            <td className="px-3 py-2">
                                <button type="button" className="text-red-600 hover:text-red-900"
                                    onClick={() => setGroups(groups.filter((_, i) => i !== index))}>Quitar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="mt-3 text-sm">Total: <strong>{total}</strong> puntos · {tests.length} casos de prueba</p>
            {groups.length > 0 && unassigned.length > 0 && (
                <p className="mt-1 text-sm text-amber-700">
                    Casos sin grupo (no dan puntos): <span className="font-mono">{unassigned.join(', ')}</span>
                </p>
            )}
            {message && <p className={`mt-2 text-sm ${message.error ? 'text-red-600' : 'text-green-700'}`}>{message.text}</p>}

            <div className="mt-4 flex gap-3">
                <button type="button" className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                    onClick={() => setGroups([...groups, { name: '', points: 10, type: 'sum', tests: '' }])}>Agregar grupo</button>
                <button type="button" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    onClick={save}>Guardar</button>
            </div>
        </div>
    );
}
