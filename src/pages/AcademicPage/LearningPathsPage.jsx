import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiService } from '../../services/apiService';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { LearningPathImport } from './LearningPathImport';

const inputClass = 'w-full rounded border px-3 py-2 text-sm';

function LearningPathsPage() {
    const navigate = useNavigate();
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({ key: '', title: '', description: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        apiService.fetchManagedLearningPaths()
            .then(response => setPaths(Array.isArray(response) ? response : []))
            .catch(apiError => setMessage(getApiErrorMessage(apiError, 'No se pudieron cargar las rutas.')))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (event) => {
        event.preventDefault();
        setCreating(true);
        setMessage('');
        try {
            const created = await apiService.createAcademicLearningPath({ ...form, version: 1 });
            navigate(`/admin/academic/learning-paths/${encodeURIComponent(created.track.id)}`);
        } catch (apiError) {
            setMessage(getApiErrorMessage(apiError, 'No se pudo crear la ruta.'));
            setCreating(false);
        }
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full space-y-4">
            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <h1 className="text-xl font-semibold text-gray-900">Rutas de aprendizaje</h1>
                <p className="text-sm text-gray-500">Una ruta tiene etapas, cada etapa tiene temas con teoría y problemas. Un tema se completa solo cuando el estudiante resuelve todos sus problemas obligatorios.</p>
            </section>

            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Crear ruta</h2>
                <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
                    <input required className={inputClass} placeholder="Clave (ej. icpc)" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} />
                    <input required className={inputClass} placeholder="Título (ej. Ruta ICPC)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <input className={inputClass} placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    <div className="md:col-span-3">
                        <button type="submit" disabled={creating} className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
                            {creating ? 'Creando...' : 'Crear ruta'}
                        </button>
                    </div>
                </form>
                {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                    <span className="text-sm text-gray-500">¿Tienes la ruta en un archivo?</span>
                    <LearningPathImport pathKey={null} onDone={key => navigate(`/admin/academic/learning-paths/${encodeURIComponent(key)}`)} />
                </div>
            </section>

            <section className="bg-white border rounded-lg shadow-sm">
                {loading ? (
                    <p className="p-4 text-center text-gray-500">Cargando...</p>
                ) : paths.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">Todavía no hay rutas.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">Ruta</th>
                                <th className="px-4 py-2 text-left">Clave</th>
                                <th className="px-4 py-2">Etapas</th>
                                <th className="px-4 py-2">Problemas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paths.map(path => (
                                <tr key={path.id} className="border-b">
                                    <td className="px-4 py-2">
                                        <Link to={`/admin/academic/learning-paths/${encodeURIComponent(path.id)}`} className="font-semibold text-blue-600">{path.title}</Link>
                                    </td>
                                    <td className="px-4 py-2 font-mono text-gray-500">{path.id}</td>
                                    <td className="px-4 py-2 text-center">{path.stageCount}</td>
                                    <td className="px-4 py-2 text-center">{path.estimatedTotalProblems}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default LearningPathsPage;
