import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AsyncSelect from 'react-select/async';

import { apiService } from '../../services/apiService';
import {
    buildProblemOption,
    buttonClass,
    emptyPath,
    emptyStage,
    emptyTopic,
    errorMessage,
    inputClass,
    parseList,
    slugify
} from './learningPathShared';

function LearningPathDetailPage() {
    const { pathId } = useParams();
    const navigate = useNavigate();

    const [detail, setDetail] = useState(null);
    const [pathForm, setPathForm] = useState(emptyPath);
    const [stageEditor, setStageEditor] = useState(null);
    const [topicEditor, setTopicEditor] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    const [stageOrderIds, setStageOrderIds] = useState([]);
    const [topicOrderIds, setTopicOrderIds] = useState({});
    const draggedStageId = useRef(null);
    const draggedTopic = useRef(null);

    const pathKeyIsAuto = useRef(false);
    const stageKeyIsAuto = useRef(true);
    const topicKeyIsAuto = useRef(true);

    const loadDetail = useCallback(async () => {
        if (!pathId) return;
        const data = await apiService.fetchAcademicLearningPath(pathId);
        setDetail(data);
        setPathForm({
            key: data.track.id,
            title: data.track.title,
            description: data.track.description,
            version: data.track.version,
            languagePrimary: data.track.languagePrimary || 'cpp',
            category: data.track.category || 'competitive-programming',
            slug: data.track.slug || data.track.id
        });
    }, [pathId]);

    useEffect(() => {
        loadDetail().catch(error => setMessage(errorMessage(error)));
    }, [loadDetail]);

    useEffect(() => {
        if (!detail) return;
        setStageOrderIds(detail.stages.map(stage => stage.stageId));
        const nextTopicOrderIds = {};
        detail.stages.forEach(stage => {
            nextTopicOrderIds[stage.stageId] = stage.topics.map(topic => topic.topicId);
        });
        setTopicOrderIds(nextTopicOrderIds);
    }, [detail]);

    async function run(action, success) {
        setBusy(true);
        setMessage('');
        try {
            await action();
            await loadDetail();
            setMessage(success);
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            setBusy(false);
        }
    }

    function updatePathField(field, fieldValue) {
        setPathForm(previous => {
            const next = { ...previous, [field]: fieldValue };
            if (field === 'title' && pathKeyIsAuto.current) {
                next.key = slugify(fieldValue);
            }
            return next;
        });
    }

    function updatePathKey(fieldValue) {
        pathKeyIsAuto.current = false;
        setPathForm(previous => ({ ...previous, key: fieldValue }));
    }

    const savePath = event => {
        event.preventDefault();
        const body = { ...pathForm, version: Number(pathForm.version) };
        run(() => apiService.updateAcademicLearningPath(pathId, body), 'Ruta actualizada.');
    };

    const removePath = async () => {
        if (!window.confirm('¿Eliminar esta ruta y todo su contenido?')) return;
        setBusy(true);
        setMessage('');
        try {
            await apiService.deleteAcademicLearningPath(pathId);
            navigate('/admin/academic/learning-paths');
        } catch (error) {
            setMessage(errorMessage(error));
            setBusy(false);
        }
    };

    const saveStage = event => {
        event.preventDefault();
        const body = { ...stageEditor.form, order: Number(stageEditor.form.order) };
        const action = stageEditor.id
            ? () => apiService.updateAcademicLearningPathStage(pathId, stageEditor.id, body)
            : () => apiService.createAcademicLearningPathStage(pathId, body);
        run(action, stageEditor.id ? 'Etapa actualizada.' : 'Etapa creada.').then(() => setStageEditor(null));
    };

    const saveTopic = event => {
        event.preventDefault();
        const form = topicEditor.form;
        const body = {
            ...form,
            order: Number(form.order),
            learningObjectives: parseList(form.learningObjectives),
            problemIds: parseList(form.problemIds).map(Number)
        };
        const action = topicEditor.id
            ? () => apiService.updateAcademicLearningPathTopic(pathId, topicEditor.stageId, topicEditor.id, body)
            : () => apiService.createAcademicLearningPathTopic(pathId, topicEditor.stageId, body);
        run(action, topicEditor.id ? 'Tema actualizado.' : 'Tema creado.').then(() => setTopicEditor(null));
    };

    function openStageEditor(stage) {
        stageKeyIsAuto.current = !stage;
        if (!stage) {
            const nextOrder = (detail?.stages?.length || 0) + 1;
            setStageEditor({ id: null, form: { ...emptyStage, order: nextOrder } });
            return;
        }
        setStageEditor({
            id: stage.stageId,
            form: { key: stage.stageKey, name: stage.name, order: stage.sortOrder, unlockedByDefault: stage.unlockedByDefault }
        });
    }

    function updateStageName(fieldValue) {
        setStageEditor(previous => {
            const form = { ...previous.form, name: fieldValue };
            if (stageKeyIsAuto.current) form.key = slugify(fieldValue);
            return { ...previous, form };
        });
    }

    function updateStageKey(fieldValue) {
        stageKeyIsAuto.current = false;
        setStageEditor(previous => ({ ...previous, form: { ...previous.form, key: fieldValue } }));
    }

    function updateStageField(field, fieldValue) {
        setStageEditor(previous => ({ ...previous, form: { ...previous.form, [field]: fieldValue } }));
    }

    function openTopicEditor(stage, topic, index) {
        topicKeyIsAuto.current = !topic;
        if (!topic) {
            setTopicEditor({ id: null, stageId: stage.stageId, form: { ...emptyTopic, order: stage.topics.length + 1 } });
            return;
        }
        setTopicEditor({
            id: topic.topicId,
            stageId: stage.stageId,
            form: {
                key: topic.topicKey,
                title: topic.title,
                summary: topic.description || '',
                theory: topic.theory || '',
                learningObjectives: topic.skills.join('\n'),
                difficulty: stage.difficulty || 'basic',
                order: index + 1,
                problemIds: topic.recommendedProblems.join(', ')
            }
        });
    }

    function updateTopicTitle(fieldValue) {
        setTopicEditor(previous => {
            const form = { ...previous.form, title: fieldValue };
            if (topicKeyIsAuto.current) form.key = slugify(fieldValue);
            return { ...previous, form };
        });
    }

    function updateTopicKey(fieldValue) {
        topicKeyIsAuto.current = false;
        setTopicEditor(previous => ({ ...previous, form: { ...previous.form, key: fieldValue } }));
    }

    function updateTopicField(field, fieldValue) {
        setTopicEditor(previous => ({ ...previous, form: { ...previous.form, [field]: fieldValue } }));
    }

    const removeStage = stage => {
        if (!window.confirm('¿Eliminar la etapa y sus temas?')) return;
        run(() => apiService.deleteAcademicLearningPathStage(pathId, stage.stageId), 'Etapa eliminada.');
    };

    const removeTopic = (stage, topic) => {
        if (!window.confirm('¿Eliminar este tema?')) return;
        run(() => apiService.deleteAcademicLearningPathTopic(pathId, stage.stageId, topic.topicId), 'Tema eliminado.');
    };

    // --- Reordenar etapas por arrastre -------------------------------------------------

    function handleStageDragStart(event, stageId) {
        if (busy) {
            event.preventDefault();
            return;
        }
        draggedStageId.current = stageId;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(stageId));
    }

    function handleStageDragEnd() {
        draggedStageId.current = null;
    }

    function handleStageDragOver(event, overStageId) {
        if (busy) return;
        const draggedId = draggedStageId.current;
        if (draggedId == null || draggedId === overStageId) return;
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const insertBefore = event.clientY - rect.top < rect.height / 2;
        setStageOrderIds(previous => {
            const withoutDragged = previous.filter(id => id !== draggedId);
            const overIndex = withoutDragged.indexOf(overStageId);
            if (overIndex === -1) return previous;
            const insertIndex = insertBefore ? overIndex : overIndex + 1;
            const next = [...withoutDragged];
            next.splice(insertIndex, 0, draggedId);
            return next;
        });
    }

    function handleStageDrop(event) {
        event.preventDefault();
        const draggedId = draggedStageId.current;
        draggedStageId.current = null;
        if (draggedId == null) return;
        void persistStageOrder();
    }

    function buildStageBody(stage, order) {
        return { key: stage.stageKey, name: stage.name, order, unlockedByDefault: stage.unlockedByDefault };
    }

    async function persistStageOrder() {
        if (!detail) return;
        const stagesById = new Map(detail.stages.map(stage => [stage.stageId, stage]));
        const orderedStages = stageOrderIds.map(id => stagesById.get(id)).filter(Boolean);
        if (orderedStages.length < 2) return;

        setBusy(true);
        setMessage('');
        try {
            // Paso 1: valores de orden temporales, fuera de rango y únicos, para
            // evitar chocar con la restricción de unicidad de `order` del backend
            // mientras se reacomodan los elementos.
            for (const [index, stage] of orderedStages.entries()) {
                await apiService.updateAcademicLearningPathStage(pathId, stage.stageId, buildStageBody(stage, 10000 + index));
            }
            // Paso 2: valores de orden definitivos (1-based).
            for (const [index, stage] of orderedStages.entries()) {
                await apiService.updateAcademicLearningPathStage(pathId, stage.stageId, buildStageBody(stage, index + 1));
            }
            await loadDetail();
            setMessage('Orden de etapas actualizado.');
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            setBusy(false);
        }
    }

    // --- Reordenar temas por arrastre (dentro de una misma etapa) ----------------------

    function handleTopicDragStart(event, stageId, topicId) {
        if (busy) {
            event.preventDefault();
            return;
        }
        event.stopPropagation();
        draggedTopic.current = { stageId, topicId };
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(topicId));
    }

    function handleTopicDragEnd(event) {
        event.stopPropagation();
        draggedTopic.current = null;
    }

    function handleTopicDragOver(event, stageId, overTopicId) {
        if (busy) return;
        const dragged = draggedTopic.current;
        if (!dragged || dragged.stageId !== stageId || dragged.topicId === overTopicId) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const insertBefore = event.clientY - rect.top < rect.height / 2;
        setTopicOrderIds(previous => {
            const list = previous[stageId] || [];
            const withoutDragged = list.filter(id => id !== dragged.topicId);
            const overIndex = withoutDragged.indexOf(overTopicId);
            if (overIndex === -1) return previous;
            const insertIndex = insertBefore ? overIndex : overIndex + 1;
            const nextList = [...withoutDragged];
            nextList.splice(insertIndex, 0, dragged.topicId);
            return { ...previous, [stageId]: nextList };
        });
    }

    function handleTopicDrop(event, stageId) {
        event.preventDefault();
        event.stopPropagation();
        const dragged = draggedTopic.current;
        draggedTopic.current = null;
        if (!dragged || dragged.stageId !== stageId) return;
        void persistTopicOrder(stageId);
    }

    function buildTopicBody(stage, topic, order) {
        return {
            key: topic.topicKey,
            title: topic.title,
            summary: topic.description || '',
            theory: topic.theory || '',
            learningObjectives: topic.skills,
            difficulty: stage.difficulty || 'basic',
            order,
            problemIds: topic.recommendedProblems
        };
    }

    async function persistTopicOrder(stageId) {
        if (!detail) return;
        const stage = detail.stages.find(item => item.stageId === stageId);
        if (!stage) return;
        const topicsById = new Map(stage.topics.map(topic => [topic.topicId, topic]));
        const orderedTopics = (topicOrderIds[stageId] || []).map(id => topicsById.get(id)).filter(Boolean);
        if (orderedTopics.length < 2) return;

        setBusy(true);
        setMessage('');
        try {
            // Mismo patrón de dos pasadas que para las etapas: primero órdenes
            // temporales fuera de rango, luego los definitivos.
            for (const [index, topic] of orderedTopics.entries()) {
                await apiService.updateAcademicLearningPathTopic(
                    pathId,
                    stageId,
                    topic.topicId,
                    buildTopicBody(stage, topic, 10000 + index)
                );
            }
            for (const [index, topic] of orderedTopics.entries()) {
                await apiService.updateAcademicLearningPathTopic(
                    pathId,
                    stageId,
                    topic.topicId,
                    buildTopicBody(stage, topic, index + 1)
                );
            }
            await loadDetail();
            setMessage('Orden de temas actualizado.');
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="container mx-auto p-4 w-full min-w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link to="/admin/academic/learning-paths" className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Volver a rutas de aprendizaje
                </Link>
                <button
                    type="button"
                    onClick={() => void removePath()}
                    disabled={busy}
                    className="rounded bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                    Eliminar ruta
                </button>
            </div>

            {message && (
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    {String(message)}
                </section>
            )}

            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Datos generales</h2>
                </div>

                <form onSubmit={savePath}>
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm font-medium">
                            Título
                            <input
                                required
                                className={inputClass}
                                value={pathForm.title}
                                onChange={e => updatePathField('title', e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium">
                            Clave
                            <input
                                required
                                className={inputClass}
                                value={pathForm.key}
                                onChange={e => updatePathKey(e.target.value)}
                            />
                            <span className="mt-1 block text-xs font-normal text-gray-500">
                                Identificador único usado en las URLs.
                            </span>
                        </label>

                        <label className="text-sm font-medium">
                            Lenguaje principal
                            <input
                                required
                                className={inputClass}
                                value={pathForm.languagePrimary}
                                onChange={e => updatePathField('languagePrimary', e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium">
                            Categoría
                            <input
                                required
                                className={inputClass}
                                value={pathForm.category}
                                onChange={e => updatePathField('category', e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium">
                            Versión
                            <input
                                required
                                min="1"
                                type="number"
                                className={inputClass}
                                value={pathForm.version}
                                onChange={e => updatePathField('version', e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium">
                            Slug
                            <input
                                className={inputClass}
                                value={pathForm.slug}
                                onChange={e => updatePathField('slug', e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium md:col-span-2">
                            Descripción
                            <textarea
                                required
                                className={inputClass}
                                rows="3"
                                value={pathForm.description}
                                onChange={e => updatePathField('description', e.target.value)}
                            />
                        </label>
                    </div>

                    <button disabled={busy} className={`${buttonClass} mt-4 bg-indigo-600 text-white disabled:opacity-50`}>
                        Guardar cambios
                    </button>
                </form>
            </section>

            {detail && (
                <section className="space-y-4">
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold">Etapas y temas</h2>
                            <button
                                className={`${buttonClass} bg-green-600 text-white`}
                                onClick={() => openStageEditor(null)}
                            >
                                Agregar etapa
                            </button>
                        </div>
                    </div>

                    {(() => {
                        const stagesById = new Map(detail.stages.map(stage => [stage.stageId, stage]));
                        const orderedStages = stageOrderIds.map(id => stagesById.get(id)).filter(Boolean);
                        const canDragStages = orderedStages.length > 1;

                        return orderedStages.map((stage, stageIndex) => {
                            const topicsById = new Map(stage.topics.map(topic => [topic.topicId, topic]));
                            const orderedTopics = (topicOrderIds[stage.stageId] || [])
                                .map(id => topicsById.get(id))
                                .filter(Boolean);
                            const canDragTopics = orderedTopics.length > 1;

                            return (
                                <article
                                    key={stage.stageId}
                                    draggable={canDragStages && !busy}
                                    onDragStart={event => handleStageDragStart(event, stage.stageId)}
                                    onDragEnd={handleStageDragEnd}
                                    onDragOver={event => handleStageDragOver(event, stage.stageId)}
                                    onDrop={handleStageDrop}
                                    className="rounded border bg-white p-4 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            {canDragStages && (
                                                <span
                                                    className={`mt-1 select-none text-lg text-gray-300 hover:text-gray-500 ${busy ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
                                                    title="Arrastra para reordenar la etapa"
                                                    aria-hidden="true"
                                                >
                                                    ⠿
                                                </span>
                                            )}
                                            <div>
                                                <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                                    Etapa {stageIndex + 1}
                                                </span>
                                                <h3 className="font-semibold">{stage.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {stage.stageKey} · {stage.unlockedByDefault ? 'Disponible inicialmente' : 'Bloqueada inicialmente'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-x-2">
                                            <button className={`${buttonClass} bg-gray-100`} onClick={() => openStageEditor(stage)}>
                                                Editar
                                            </button>
                                            <button
                                                className={`${buttonClass} bg-red-100 text-red-700`}
                                                onClick={() => removeStage(stage)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {orderedTopics.map((topic, topicIndex) => (
                                            <div
                                                key={topic.topicId}
                                                draggable={canDragTopics && !busy}
                                                onDragStart={event => handleTopicDragStart(event, stage.stageId, topic.topicId)}
                                                onDragEnd={handleTopicDragEnd}
                                                onDragOver={event => handleTopicDragOver(event, stage.stageId, topic.topicId)}
                                                onDrop={event => handleTopicDrop(event, stage.stageId)}
                                                className="flex flex-wrap justify-between gap-2 rounded bg-gray-50 p-3"
                                            >
                                                <div className="flex items-start gap-2">
                                                    {canDragTopics && (
                                                        <span
                                                            className={`mt-1 select-none text-lg text-gray-300 hover:text-gray-500 ${busy ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
                                                            title="Arrastra para reordenar el tema"
                                                            aria-hidden="true"
                                                        >
                                                            ⠿
                                                        </span>
                                                    )}
                                                    <div>
                                                        <span className="inline-block rounded-full border bg-white px-2 py-0.5 text-xs font-semibold text-gray-600">
                                                            Tema {topicIndex + 1}
                                                        </span>
                                                        <strong className="block">{topic.title}</strong>
                                                        <p className="text-sm text-gray-600">
                                                            {topic.topicKey} · {topic.recommendedProblems.length} problemas
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-x-2">
                                                    <button
                                                        className={`${buttonClass} bg-white`}
                                                        onClick={() => openTopicEditor(stage, topic, topicIndex)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className={`${buttonClass} bg-red-100 text-red-700`}
                                                        onClick={() => removeTopic(stage, topic)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className={`${buttonClass} mt-3 border border-indigo-300 text-indigo-700`}
                                        onClick={() => openTopicEditor(stage, null)}
                                    >
                                        Agregar tema
                                    </button>
                                </article>
                            );
                        });
                    })()}
                </section>
            )}

            {stageEditor && (
                <Editor
                    title={stageEditor.id ? 'Editar etapa' : 'Nueva etapa'}
                    onClose={() => setStageEditor(null)}
                    onSubmit={saveStage}
                >
                    <label className="text-sm font-medium">
                        Nombre
                        <input
                            required
                            className={inputClass}
                            value={stageEditor.form.name}
                            onChange={e => updateStageName(e.target.value)}
                        />
                    </label>

                    <label className="text-sm font-medium">
                        Clave
                        <input
                            required
                            className={inputClass}
                            value={stageEditor.form.key}
                            onChange={e => updateStageKey(e.target.value)}
                        />
                        <span className="mt-1 block text-xs font-normal text-gray-500">
                            Identificador único usado en las URLs. Se genera automáticamente desde el nombre;
                            puedes editarlo si lo necesitas.
                        </span>
                    </label>

                    <label className="text-sm font-medium">
                        Orden
                        <input
                            required
                            type="number"
                            className={inputClass}
                            value={stageEditor.form.order}
                            onChange={e => updateStageField('order', e.target.value)}
                        />
                    </label>

                    <label className="flex gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={stageEditor.form.unlockedByDefault}
                            onChange={e => updateStageField('unlockedByDefault', e.target.checked)}
                        />
                        Disponible desde el inicio
                    </label>
                </Editor>
            )}

            {topicEditor && (
                <Editor
                    title={topicEditor.id ? 'Editar tema' : 'Nuevo tema'}
                    onClose={() => setTopicEditor(null)}
                    onSubmit={saveTopic}
                    wide
                >
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm font-medium">
                            Título
                            <input
                                required
                                className={inputClass}
                                value={topicEditor.form.title}
                                onChange={e => updateTopicTitle(e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium">
                            Clave
                            <input
                                required
                                className={inputClass}
                                value={topicEditor.form.key}
                                onChange={e => updateTopicKey(e.target.value)}
                            />
                            <span className="mt-1 block text-xs font-normal text-gray-500">
                                Identificador único usado en las URLs. Se genera automáticamente desde el nombre;
                                puedes editarlo si lo necesitas.
                            </span>
                        </label>

                        <label className="text-sm font-medium">
                            Dificultad
                            <input
                                required
                                className={inputClass}
                                value={topicEditor.form.difficulty}
                                onChange={e => updateTopicField('difficulty', e.target.value)}
                            />
                        </label>

                        <label className="text-sm font-medium">
                            Orden
                            <input
                                required
                                type="number"
                                className={inputClass}
                                value={topicEditor.form.order}
                                onChange={e => updateTopicField('order', e.target.value)}
                            />
                        </label>
                    </div>

                    <label className="text-sm font-medium">
                        Resumen
                        <textarea
                            className={inputClass}
                            rows={2}
                            value={topicEditor.form.summary}
                            onChange={e => updateTopicField('summary', e.target.value)}
                        />
                    </label>

                    <label className="text-sm font-medium">
                        Objetivos (uno por línea)
                        <textarea
                            className={inputClass}
                            rows={3}
                            value={topicEditor.form.learningObjectives}
                            onChange={e => updateTopicField('learningObjectives', e.target.value)}
                        />
                    </label>

                    <MarkdownEditor value={topicEditor.form.theory} onChange={value => updateTopicField('theory', value)} />
                    <ProblemItemsEditor
                        value={topicEditor.form.problemIds}
                        onChange={value => updateTopicField('problemIds', value)}
                    />
                </Editor>
            )}
        </div>
    );
}

// eslint-disable-next-line react/prop-types
function Editor({ title, onClose, onSubmit, children, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <form
                onSubmit={onSubmit}
                className={`max-h-[94vh] w-full ${wide ? 'max-w-6xl' : 'max-w-2xl'} space-y-4 overflow-y-auto rounded-xl bg-white p-6 shadow-2xl`}
            >
                <div className="sticky top-0 z-10 flex justify-between border-b bg-white pb-3">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button type="button" aria-label="Cerrar" className="rounded px-3 py-1 hover:bg-gray-100" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {children}

                <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white pt-3">
                    <button type="button" className={`${buttonClass} bg-gray-100`} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={`${buttonClass} bg-indigo-600 text-white`}>Guardar tema</button>
                </div>
            </form>
        </div>
    );
}

// eslint-disable-next-line react/prop-types
function MarkdownEditor({ value, onChange }) {
    const [mobileTab, setMobileTab] = useState('edit');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInput = useRef(null);

    const uploadImage = async event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
            setUploadError('Usa una imagen PNG, JPG, GIF o WebP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('La imagen no puede superar 5 MB.');
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const body = new FormData();
            body.append('file', file);
            const url = await apiService.postFile('filemanager/cloud-storage', body);
            const alternativeText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
            const currentValue = String(value || '');
            onChange(`${currentValue}${currentValue && !currentValue.endsWith('\n') ? '\n' : ''}![${alternativeText}](${url})\n`);
            setMobileTab('preview');
        } catch (error) {
            setUploadError(errorMessage(error));
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="overflow-hidden rounded-lg border border-slate-300">
            <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2">
                <div>
                    <strong className="text-sm">Contenido del tema</strong>
                    <span className="ml-2 text-xs text-slate-500">Markdown</span>
                </div>
                <div className="flex md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileTab('edit')}
                        className={`rounded px-2 py-1 text-xs ${mobileTab === 'edit' ? 'bg-indigo-600 text-white' : ''}`}
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab('preview')}
                        className={`rounded px-2 py-1 text-xs ${mobileTab === 'preview' ? 'bg-indigo-600 text-white' : ''}`}
                    >
                        Vista previa
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 md:divide-x">
                <div className={`${mobileTab === 'edit' ? 'block' : 'hidden'} md:block`}>
                    <div className="flex flex-wrap gap-1 border-b bg-white p-2">
                        <MarkdownTool label="Título" snippet={'\n## Título\n'} onInsert={snippet => onChange(value + snippet)} />
                        <MarkdownTool label="Negrita" snippet="**texto**" onInsert={snippet => onChange(value + snippet)} />
                        <MarkdownTool label="Lista" snippet={'\n- Elemento\n'} onInsert={snippet => onChange(value + snippet)} />
                        <MarkdownTool
                            label="Código"
                            snippet={'\n```cpp\n// código\n```\n'}
                            onInsert={snippet => onChange(value + snippet)}
                        />
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={() => fileInput.current?.click()}
                            className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                        >
                            {uploading ? 'Subiendo…' : '🖼 Subir imagen'}
                        </button>
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={uploadImage}
                        />
                    </div>
                    {uploadError && <p className="bg-red-50 px-3 py-2 text-xs text-red-700">{uploadError}</p>}
                    <textarea
                        aria-label="Contenido Markdown"
                        className="min-h-80 w-full resize-y p-4 font-mono text-sm outline-none"
                        value={value}
                        onChange={event => onChange(event.target.value)}
                        placeholder={'# Título\n\nExplica el concepto con ejemplos.\n\n```cpp\ncout << "Hola";\n```'}
                    />
                </div>

                <div className={`${mobileTab === 'preview' ? 'block' : 'hidden'} min-h-80 bg-slate-50 md:block`}>
                    <div className="border-b bg-white px-3 py-1 text-xs font-medium text-slate-500">VISTA PREVIA</div>
                    <MarkdownPreview markdown={value} />
                </div>
            </div>
        </section>
    );
}

// Renderizado seguro y liviano: nunca inyecta HTML recibido del usuario.
// eslint-disable-next-line react/prop-types
function MarkdownPreview({ markdown }) {
    const lines = String(markdown || '').split('\n');
    const nodes = [];
    let code = [];
    let inCode = false;

    lines.forEach((line, index) => {
        if (line.trim().startsWith('```')) {
            if (inCode) {
                nodes.push(
                    <pre key={`code-${index}`} className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-emerald-300">
                        <code>{code.join('\n')}</code>
                    </pre>
                );
                code = [];
            }
            inCode = !inCode;
            return;
        }
        if (inCode) {
            code.push(line);
            return;
        }

        const imageMatch = line.trim().match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/i);
        if (imageMatch) {
            nodes.push(
                <figure key={index} className="my-4 overflow-hidden rounded-lg border bg-white p-2 shadow-sm">
                    <img
                        src={imageMatch[2]}
                        alt={imageMatch[1] || 'Imagen del tema'}
                        loading="lazy"
                        className="mx-auto max-h-[28rem] max-w-full rounded object-contain"
                    />
                    <figcaption className="mt-2 text-center text-xs text-slate-500">{imageMatch[1]}</figcaption>
                </figure>
            );
        } else if (line.startsWith('### ')) {
            nodes.push(
                <h3 key={index} className="mb-2 mt-5 text-lg font-bold">
                    <InlineMarkdown text={line.slice(4)} />
                </h3>
            );
        } else if (line.startsWith('## ')) {
            nodes.push(
                <h2 key={index} className="mb-2 mt-5 text-xl font-bold text-indigo-900">
                    <InlineMarkdown text={line.slice(3)} />
                </h2>
            );
        } else if (line.startsWith('# ')) {
            nodes.push(
                <h1 key={index} className="mb-3 mt-2 text-2xl font-bold text-indigo-950">
                    <InlineMarkdown text={line.slice(2)} />
                </h1>
            );
        } else if (/^[-*] /.test(line)) {
            nodes.push(
                <div key={index} className="my-1 flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span><InlineMarkdown text={line.slice(2)} /></span>
                </div>
            );
        } else if (/^\d+\. /.test(line)) {
            nodes.push(<div key={index} className="my-1 pl-2">{line}</div>);
        } else if (line.startsWith('> ')) {
            nodes.push(
                <blockquote key={index} className="my-3 border-l-4 border-indigo-400 bg-indigo-50 px-4 py-2 text-slate-700">
                    {line.slice(2)}
                </blockquote>
            );
        } else if (line.trim()) {
            nodes.push(
                <p key={index} className="my-2 leading-7 text-slate-700">
                    <InlineMarkdown text={line} />
                </p>
            );
        } else {
            nodes.push(<div key={index} className="h-2" />);
        }
    });

    if (code.length) {
        nodes.push(
            <pre key="code-last" className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-emerald-300">
                <code>{code.join('\n')}</code>
            </pre>
        );
    }

    return (
        <div className="p-5">
            {nodes.length ? nodes : (
                <div className="flex min-h-64 items-center justify-center text-center text-sm text-slate-400">
                    La vista previa aparecerá aquí mientras escribes.
                </div>
            )}
        </div>
    );
}

// eslint-disable-next-line react/prop-types
function MarkdownTool({ label, snippet, onInsert }) {
    return (
        <button
            type="button"
            title="Insertar formato Markdown"
            onClick={() => onInsert(snippet)}
            className="rounded border bg-slate-50 px-2 py-1 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700"
        >
            {label}
        </button>
    );
}

function InlineMarkdown({ text }) {
    return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={index} className="rounded bg-slate-200 px-1 py-0.5 font-mono text-sm text-pink-700">
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

// eslint-disable-next-line react/prop-types
function ProblemItemsEditor({ value, onChange }) {
    const ids = parseList(value).filter(item => /^\d+$/.test(item));

    const loadProblemOptions = async inputValue => {
        const query = inputValue?.trim() || '';
        if (!query) return [];
        try {
            const response = await apiService.fetchProblemList({ searchTerm: query });
            const items = Array.isArray(response) ? response : [];
            return items
                .map(buildProblemOption)
                .filter(option => !ids.includes(String(option.value)))
                .sort((left, right) => left.label.localeCompare(right.label));
        } catch (error) {
            console.error('Error al buscar problemas:', error);
            return [];
        }
    };

    const addProblem = option => {
        const id = String(option?.value || '').trim();
        if (!/^\d+$/.test(id) || ids.includes(id)) return;
        onChange([...ids, id].join(', '));
    };

    const removeProblem = id => {
        onChange(ids.filter(item => item !== id).join(', '));
    };

    return (
        <section className="rounded-lg border border-slate-300 p-4">
            <div className="mb-2">
                <strong className="text-sm">Problemas sugeridos</strong>
                <p className="text-xs text-slate-500">Busca por título o ID y selecciona los problemas que practicarán este tema.</p>
            </div>

            <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadProblemOptions}
                value={null}
                onChange={addProblem}
                placeholder="Busca un problema por título o ID…"
                noOptionsMessage={({ inputValue }) => (inputValue ? 'Sin resultados' : 'Escribe para buscar problemas')}
                className="text-sm"
            />

            <div className="mt-3 flex min-h-10 flex-wrap gap-2">
                {ids.map(id => (
                    <span key={id} className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                        Problema #{id}
                        <button
                            type="button"
                            aria-label={`Quitar problema ${id}`}
                            onClick={() => removeProblem(id)}
                            className="text-indigo-500 hover:text-red-600"
                        >
                            ×
                        </button>
                    </span>
                ))}
                {!ids.length && <span className="text-sm text-slate-400">Aún no hay problemas sugeridos.</span>}
            </div>
        </section>
    );
}

export default LearningPathDetailPage;
