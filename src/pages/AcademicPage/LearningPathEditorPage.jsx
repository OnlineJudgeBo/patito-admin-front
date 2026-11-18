/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { apiService } from '../../services/apiService';
import { LearningPathImport } from './LearningPathImport';
import { exportLearningPath } from './learningPathYaml';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

const inputClass = 'w-full rounded border px-3 py-2 text-sm';
const buttonClass = 'rounded px-3 py-1.5 text-sm disabled:opacity-50';
const DIFFICULTIES = [['basic', 'Básico'], ['intermediate', 'Intermedio'], ['advanced', 'Avanzado']];

const parseIds = (text) => [...new Set(text.split(/[\s,]+/).map(Number).filter(id => Number.isInteger(id) && id > 0))];
const toKey = (text) => text.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function Field({ label, children }) {
    return (
        <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{label}</span>
            {children}
        </label>
    );
}

function SitesPanel({ sites, onToggle, busy }) {
    return (
        <section className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Disponible en</h2>
            <p className="mb-3 text-sm text-gray-500">Activa la ruta en cada sitio donde quieras mostrarla. Los problemas que un sitio no tiene no se muestran ahí.</p>
            <div className="space-y-2">
                {sites.map(site => (
                    <label key={site.siteId} className="flex flex-wrap items-center gap-3 rounded border px-3 py-2">
                        <input type="checkbox" checked={site.isActive} disabled={busy} onChange={() => onToggle(site)} />
                        <span className="font-medium">{site.name}</span>
                        {site.isOwner && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">se edita aquí</span>}
                        {site.missingProblemCount > 0 && (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                                Faltan {site.missingProblemCount} problema(s) en este sitio
                            </span>
                        )}
                    </label>
                ))}
            </div>
        </section>
    );
}

function PathForm({ track, onSave, busy }) {
    const [form, setForm] = useState(track);
    useEffect(() => setForm(track), [track]);

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="bg-white border rounded-lg p-4 shadow-sm grid gap-3 md:grid-cols-2">
            <Field label="Título"><input required className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Categoría"><input className={inputClass} value={form.category ?? ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="ej. universidad" /></Field>
            <div className="md:col-span-2">
                <Field label="Descripción"><textarea rows={2} className={inputClass} value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <Field label="Lenguaje principal"><input className={inputClass} value={form.languagePrimary ?? ''} onChange={e => setForm({ ...form, languagePrimary: e.target.value })} placeholder="cpp" /></Field>
            <div className="flex items-end">
                <button type="submit" disabled={busy} className={`${buttonClass} bg-gray-900 text-white hover:bg-gray-800`}>Guardar datos de la ruta</button>
            </div>
        </form>
    );
}

function TopicForm({ topic, nextOrder, onSave, onCancel, busy }) {
    const [form, setForm] = useState(() => ({
        key: topic?.topicKey ?? '',
        title: topic?.title ?? '',
        summary: topic?.description ?? '',
        difficulty: topic?.difficulty ?? 'basic',
        order: topic?.sortOrder || nextOrder,
        objectives: (topic?.skills ?? []).join('\n'),
        theory: topic?.theory ?? '',
        problems: (topic?.recommendedProblems ?? []).join(', '),
        challenge: (topic?.challengeProblems ?? []).join(', ')
    }));
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const submit = (e) => {
        e.preventDefault();
        onSave({
            key: form.key || toKey(form.title),
            title: form.title,
            summary: form.summary,
            difficulty: form.difficulty,
            order: Number(form.order),
            learningObjectives: form.objectives.split('\n').map(line => line.trim()).filter(Boolean),
            theory: form.theory,
            problemIds: parseIds(form.problems),
            challengeProblemIds: parseIds(form.challenge)
        });
    };

    return (
        <form onSubmit={submit} className="mt-2 grid gap-3 rounded border border-indigo-200 bg-indigo-50/40 p-3 md:grid-cols-4">
            <div className="md:col-span-2"><Field label="Título"><input required className={inputClass} value={form.title} onChange={set('title')} /></Field></div>
            <Field label="Clave"><input className={inputClass} value={form.key} onChange={set('key')} placeholder={toKey(form.title) || 'se genera del título'} /></Field>
            <Field label="Orden"><input type="number" min={1} required className={inputClass} value={form.order} onChange={set('order')} /></Field>
            <div className="md:col-span-3"><Field label="Resumen"><input className={inputClass} value={form.summary} onChange={set('summary')} /></Field></div>
            <Field label="Dificultad">
                <select className={inputClass} value={form.difficulty} onChange={set('difficulty')}>
                    {DIFFICULTIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </Field>
            <div className="md:col-span-2">
                <Field label="Problemas obligatorios (IDs)"><input className={inputClass} value={form.problems} onChange={set('problems')} placeholder="1001, 1002, 1003" /></Field>
                <p className="mt-1 text-xs text-gray-500">El tema se completa cuando el estudiante resuelve todos.</p>
            </div>
            <div className="md:col-span-2">
                <Field label="Problemas de desafío (IDs)"><input className={inputClass} value={form.challenge} onChange={set('challenge')} placeholder="Opcionales, no cuentan para completar" /></Field>
            </div>
            <div className="md:col-span-4"><Field label="Objetivos (uno por línea)"><textarea rows={2} className={inputClass} value={form.objectives} onChange={set('objectives')} /></Field></div>
            <div className="md:col-span-4">
                <Field label="Teoría (Markdown, código y LaTeX con $...$)">
                    <textarea rows={10} className={`${inputClass} font-mono`} value={form.theory} onChange={set('theory')} />
                </Field>
            </div>
            <div className="md:col-span-4 flex gap-2">
                <button type="submit" disabled={busy} className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-500`}>Guardar tema</button>
                <button type="button" onClick={onCancel} className={`${buttonClass} bg-gray-200 hover:bg-gray-300`}>Cancelar</button>
            </div>
        </form>
    );
}

function StageCard({ stage, pathKey, run, busy }) {
    const [editingStage, setEditingStage] = useState(false);
    const [stageForm, setStageForm] = useState({ name: stage.name, description: stage.description ?? '', order: stage.sortOrder, unlockedByDefault: stage.unlockedByDefault });
    const [editingTopicId, setEditingTopicId] = useState(null);
    const nextTopicOrder = Math.max(0, ...stage.topics.map(topic => topic.sortOrder || 0)) + 1;

    const saveStage = (e) => {
        e.preventDefault();
        run(() => apiService.updateAcademicLearningPathStage(pathKey, stage.stageId, { key: stage.stageKey, name: stageForm.name, description: stageForm.description, order: Number(stageForm.order), unlockedByDefault: stageForm.unlockedByDefault }))
            .then(ok => ok && setEditingStage(false));
    };

    const saveTopic = (topic) => (body) => run(() => topic
        ? apiService.updateAcademicLearningPathTopic(pathKey, stage.stageId, topic.topicId, body)
        : apiService.createAcademicLearningPathTopic(pathKey, stage.stageId, body))
        .then(ok => ok && setEditingTopicId(null));

    return (
        <section className="bg-white border rounded-lg p-4 shadow-sm">
            {editingStage ? (
                <form onSubmit={saveStage} className="flex flex-wrap items-end gap-3">
                    <Field label="Nombre"><input required className={inputClass} value={stageForm.name} onChange={e => setStageForm({ ...stageForm, name: e.target.value })} /></Field>
                    <Field label="Orden"><input type="number" min={1} className={`${inputClass} w-24`} value={stageForm.order} onChange={e => setStageForm({ ...stageForm, order: e.target.value })} /></Field>
                    <div className="w-full"><Field label="Descripción"><textarea rows={2} className={inputClass} value={stageForm.description} onChange={e => setStageForm({ ...stageForm, description: e.target.value })} /></Field></div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={stageForm.unlockedByDefault} onChange={e => setStageForm({ ...stageForm, unlockedByDefault: e.target.checked })} />
                        Abierta sin completar la anterior
                    </label>
                    <button type="submit" disabled={busy} className={`${buttonClass} bg-gray-900 text-white`}>Guardar</button>
                    <button type="button" onClick={() => setEditingStage(false)} className={`${buttonClass} bg-gray-200`}>Cancelar</button>
                </form>
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        <span className="mr-2 text-gray-400">{stage.sortOrder}.</span>{stage.name}
                        {stage.unlockedByDefault && <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-normal text-green-800">abierta</span>}
                    </h3>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setEditingStage(true)} className={`${buttonClass} bg-gray-200 hover:bg-gray-300`}>Editar etapa</button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => window.confirm(`¿Eliminar la etapa "${stage.name}" con todos sus temas?`) && run(() => apiService.deleteAcademicLearningPathStage(pathKey, stage.stageId), true)}
                            className={`${buttonClass} bg-red-100 text-red-700 hover:bg-red-200`}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            )}

            <ul className="mt-3 divide-y">
                {stage.topics.map(topic => (
                    <li key={topic.topicId} className="py-2">
                        {editingTopicId === topic.topicId ? (
                            <TopicForm topic={topic} nextOrder={nextTopicOrder} busy={busy} onSave={saveTopic(topic)} onCancel={() => setEditingTopicId(null)} />
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <span className="font-medium">{topic.title}</span>
                                    <span className="ml-2 text-xs text-gray-500">
                                        {topic.recommendedProblems.length} obligatorios · {topic.challengeProblems?.length ?? 0} desafío · {topic.hasTheory ? 'con teoría' : 'sin teoría'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setEditingTopicId(topic.topicId)} className={`${buttonClass} bg-gray-100 hover:bg-gray-200`}>Editar</button>
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => window.confirm(`¿Eliminar el tema "${topic.title}"?`) && run(() => apiService.deleteAcademicLearningPathTopic(pathKey, stage.stageId, topic.topicId), true)}
                                        className={`${buttonClass} text-red-700 hover:bg-red-50`}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {editingTopicId === 'new' ? (
                <TopicForm nextOrder={nextTopicOrder} busy={busy} onSave={saveTopic(null)} onCancel={() => setEditingTopicId(null)} />
            ) : (
                <button type="button" onClick={() => setEditingTopicId('new')} className={`${buttonClass} mt-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}>+ Agregar tema</button>
            )}
        </section>
    );
}

function LearningPathEditorPage() {
    const { pathKey } = useParams();
    const navigate = useNavigate();
    const [path, setPath] = useState(null);
    const [sites, setSites] = useState([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [newStageName, setNewStageName] = useState('');

    const load = useCallback(() => Promise.all([apiService.fetchManagedLearningPath(pathKey), apiService.fetchLearningPathSites(pathKey)])
        .then(([pathResponse, sitesResponse]) => { setPath(pathResponse); setSites(sitesResponse); })
        .catch(apiError => setMessage(getApiErrorMessage(apiError, 'No se pudo cargar la ruta.'))), [pathKey]);

    useEffect(() => { void load(); }, [load]);

    // Runs one change; mutations that return the path update it in place, deletes reload everything.
    const run = async (action, reload = false) => {
        setBusy(true);
        setMessage('');
        try {
            const response = await action();
            if (reload || !response?.stages) await load();
            else setPath(response);
            void apiService.fetchLearningPathSites(pathKey).then(setSites).catch(() => undefined);
            return true;
        } catch (apiError) {
            setMessage(getApiErrorMessage(apiError, 'No se pudo guardar el cambio.'));
            return false;
        } finally {
            setBusy(false);
        }
    };

    if (!path) {
        return <div className="p-4 text-center">{message || 'Cargando...'}</div>;
    }

    const nextStageOrder = Math.max(0, ...path.stages.map(stage => stage.sortOrder)) + 1;

    const addStage = (e) => {
        e.preventDefault();
        run(() => apiService.createAcademicLearningPathStage(pathKey, {
            key: `${pathKey}_${toKey(newStageName)}`,
            name: newStageName.trim(),
            order: nextStageOrder,
            unlockedByDefault: false
        })).then(ok => ok && setNewStageName(''));
    };

    const deletePath = () => {
        if (!window.confirm(`¿Eliminar la ruta "${path.track.title}" con todas sus etapas y el progreso de los estudiantes?`)) return;
        run(() => apiService.deleteAcademicLearningPath(pathKey), true).then(ok => ok && navigate('/admin/academic/learning-paths'));
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <Link to="/admin/academic/learning-paths" className="text-sm text-blue-600">← Rutas</Link>
                    <h1 className="text-2xl font-bold">{path.track.title} <span className="font-mono text-base font-normal text-gray-400">{path.track.id}</span></h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => exportLearningPath(path)} className={`${buttonClass} bg-gray-200 hover:bg-gray-300`}>Exportar YAML</button>
                    <LearningPathImport pathKey={pathKey} onDone={() => load()} />
                    <button type="button" onClick={deletePath} disabled={busy} className={`${buttonClass} bg-red-600 text-white hover:bg-red-500`}>Eliminar ruta</button>
                </div>
            </div>

            {message && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{message}</div>}

            <PathForm
                track={path.track}
                busy={busy}
                onSave={form => run(() => apiService.updateAcademicLearningPath(pathKey, {
                    key: pathKey,
                    title: form.title,
                    description: form.description,
                    version: form.version || 1,
                    languagePrimary: form.languagePrimary,
                    category: form.category,
                    slug: form.slug
                }))}
            />

            <SitesPanel sites={sites} busy={busy} onToggle={site => run(() => apiService.setLearningPathSite(pathKey, site.siteId, !site.isActive))} />

            {path.stages.map(stage => <StageCard key={stage.stageId} stage={stage} pathKey={pathKey} run={run} busy={busy} />)}

            <form onSubmit={addStage} className="flex flex-wrap items-end gap-3 bg-white border rounded-lg p-4 shadow-sm">
                <Field label={`Nueva etapa (${nextStageOrder})`}>
                    <input required className={inputClass} value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder="ej. Programación dinámica" />
                </Field>
                <button type="submit" disabled={busy || !toKey(newStageName)} className={`${buttonClass} bg-gray-900 text-white hover:bg-gray-800`}>+ Agregar etapa</button>
            </form>
        </div>
    );
}

export default LearningPathEditorPage;
