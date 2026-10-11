import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ScoringGroupsEditor, { groupsForApi } from '../../components/JudgeFiles/ScoringGroupsEditor';
import { apiService } from '../../services/apiService';

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

    const save = () => {
        apiService.put(`problems/${problemId}/scoring`, { groups: groupsForApi(groups) })
            .then(data => { apply(data); setMessage({ error: false, text: 'Puntaje guardado.' }); })
            .catch(err => setMessage({ error: true, text: err?.response?.data?.message ?? 'No se pudo guardar el puntaje.' }));
    };

    if (!groups) {
        return <div className="p-4">{message ? <span className="text-red-600">{message.text}</span> : 'Cargando...'}</div>;
    }

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-2xl font-bold">Puntaje por grupos: problema {problemId}</h1>
            <p className="mb-4 mt-1 text-sm text-gray-500">
                Cada grupo reparte sus puntos entre sus casos. Sin grupos, el problema se juzga como aceptado o rechazado.
                Los casos se eligen por nombre con comodines, separados por comas: <span className="font-mono">s1_*</span>, <span className="font-mono">caso?</span>.
            </p>

            <ScoringGroupsEditor groups={groups} tests={tests} onChange={setGroups} />
            {message && <p className={`mt-2 text-sm ${message.error ? 'text-red-600' : 'text-green-700'}`}>{message.text}</p>}

            <div className="mt-4">
                <button type="button" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    onClick={save}>Guardar</button>
            </div>
        </div>
    );
}
