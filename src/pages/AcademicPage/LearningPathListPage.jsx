import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiService } from '../../services/apiService';
import { buttonClass, emptyPath, errorMessage, inputClass, slugify } from './learningPathShared';

function LearningPathListPage() {
    const navigate = useNavigate();

    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [pathForm, setPathForm] = useState(emptyPath);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const pathKeyIsAuto = useRef(true);

    const loadPaths = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.fetchAcademicLearningPaths();
            setPaths(Array.isArray(data) ? data : []);
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPaths();
    }, [loadPaths]);

    const summary = useMemo(() => {
        return paths.reduce((accumulator, path) => ({
            totalPaths: accumulator.totalPaths + 1,
            totalStages: accumulator.totalStages + (path.stageCount || 0)
        }), {
            totalPaths: 0,
            totalStages: 0
        });
    }, [paths]);

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

    const createPath = async event => {
        event.preventDefault();
        const body = { ...pathForm, version: Number(pathForm.version) };
        setCreating(true);
        setMessage('');
        try {
            await apiService.createAcademicLearningPath(body);
            setShowCreateForm(false);
            navigate(`/admin/academic/learning-paths/${body.key}`);
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            setCreating(false);
        }
    };

    const removePath = async path => {
        if (!window.confirm('¿Eliminar esta ruta y todo su contenido?')) return;
        setMessage('');
        try {
            await apiService.deleteAcademicLearningPath(path.id);
            setMessage('Ruta eliminada.');
            await loadPaths();
        } catch (error) {
            setMessage(errorMessage(error));
        }
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full space-y-4">
            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Rutas de aprendizaje</h1>
                        <p className="text-sm text-gray-600">
                            Configura el contenido que aparece en “Aprende programación competitiva paso a paso”.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(previous => !previous)}
                            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            {showCreateForm ? 'Cancelar' : '+ Crear ruta de aprendizaje'}
                        </button>
                        <button
                            type="button"
                            onClick={() => void loadPaths()}
                            className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Actualizar
                        </button>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded border bg-gray-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Rutas</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">{summary.totalPaths}</div>
                    </div>
                    <div className="rounded border bg-gray-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Etapas totales</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">{summary.totalStages}</div>
                    </div>
                </div>
            </section>

            {showCreateForm && (
            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Crear ruta de aprendizaje</h2>
                    <p className="text-sm text-gray-600">Una vez creada, podrás agregar sus etapas y temas desde su detalle.</p>
                </div>

                <form onSubmit={createPath} className="grid gap-3 md:grid-cols-2">
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
                            Identificador único usado en las URLs. Se genera automáticamente desde el título;
                            puedes editarlo si lo necesitas.
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

                    <div className="md:col-span-2">
                        <button disabled={creating} className={`${buttonClass} bg-indigo-600 text-white disabled:opacity-50`}>
                            {creating ? 'Creando...' : 'Crear ruta de aprendizaje'}
                        </button>
                    </div>
                </form>
            </section>
            )}

            {message && (
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    {String(message)}
                </section>
            )}

            <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="border-b px-4 py-3">
                    <h2 className="text-lg font-semibold text-gray-900">Rutas publicadas</h2>
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-gray-600">Cargando rutas...</div>
                ) : paths.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">No hay rutas disponibles para gestionar.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse">
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Título</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Lenguaje</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Etapas</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Clave</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paths.map(path => (
                                    <tr key={path.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">{path.title}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{path.category}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{path.languagePrimary}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-700">{path.stageCount}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{path.id}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => void removePath(path)}
                                                    className="rounded border px-3 py-1.5 text-red-600 hover:bg-red-50"
                                                >
                                                    Eliminar
                                                </button>
                                                <Link
                                                    to={`/admin/academic/learning-paths/${path.id}`}
                                                    className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-500"
                                                >
                                                    Gestionar
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default LearningPathListPage;
