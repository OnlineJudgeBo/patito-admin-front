import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Choice, KINDS } from '../../components/JudgeFiles/JudgeFilesSection';
import ScoringGroupsEditor, { groupsForApi } from '../../components/JudgeFiles/ScoringGroupsEditor';
import { apiService } from '../../services/apiService';

/* eslint-disable react/prop-types */
// Subtasks of a problem: points of each one and which tests belong to it. `embedded` is the edit page, which has its own title.
export default function ScoringPage({ embedded }) {
    const { problemId } = useParams();
    const [groups, setGroups] = useState(null);
    const [tests, setTests] = useState([]);
    const [kind, setKind] = useState('icpc');
    const [message, setMessage] = useState(null);

    const apply = useCallback((data) => {
        setTests(data.availableTests ?? []);
        setKind((data.groups ?? []).length > 0 ? 'ioi' : 'icpc');
        setGroups((data.groups ?? []).map(group => ({ ...group, tests: (group.tests ?? []).join(', ') })));
    }, []);

    useEffect(() => {
        apiService.get(`problems/${problemId}/scoring`)
            .then(apply)
            .catch(err => setMessage({ error: true, text: err?.response?.data?.message ?? 'No se pudo cargar el puntaje.' }));
    }, [problemId, apply]);

    const save = () => {
        if (kind === 'ioi' && groups.length === 0) {
            setMessage({ error: true, text: 'Un problema por puntos necesita al menos una subtarea.' });
            return;
        }
        apiService.put(`problems/${problemId}/scoring`, { groups: kind === 'ioi' ? groupsForApi(groups) : [] })
            .then(data => { apply(data); setMessage({ error: false, text: 'Puntaje guardado.' }); })
            .catch(err => setMessage({ error: true, text: err?.response?.data?.message ?? 'No se pudo guardar el puntaje.' }));
    };

    if (!groups) {
        return <div className="p-4">{message ? <span className="text-red-600">{message.text}</span> : 'Cargando...'}</div>;
    }

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            {!embedded && <h1 className="text-2xl font-bold">Subtareas y puntaje: problema {problemId}</h1>}
            <div className="mb-4 mt-2">
                <Choice name="problem-kind" label="Tipo de problema" options={KINDS} selected={kind} onSelect={setKind} />
            </div>

            {kind === 'ioi' && <ScoringGroupsEditor groups={groups} tests={tests} onChange={setGroups} />}
            {message && <p className={`mt-2 text-sm ${message.error ? 'text-red-600' : 'text-green-700'}`}>{message.text}</p>}

            <div className="mt-4">
                <button type="button" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    onClick={save}>Guardar tipo y puntaje</button>
            </div>
        </div>
    );
}
