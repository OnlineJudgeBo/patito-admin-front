import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { StatementPreview } from '../../components/Statement/StatementPreview';
import { apiService } from '../../services/apiService';

function ListAcademicCoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    const loadCourses = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiService.fetchManageableAcademicCourses();
            setCourses(Array.isArray(response) ? response : []);
        } catch (apiError) {
            setError(apiError?.response?.data?.message || apiError?.message || 'No se pudieron cargar los cursos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCourses();
    }, []);

    const summary = useMemo(() => {
        return courses.reduce((accumulator, course) => ({
            totalCourses: accumulator.totalCourses + 1,
            totalStudents: accumulator.totalStudents + (course.studentCount || 0),
            totalAssignments: accumulator.totalAssignments + (course.assignmentCount || 0)
        }), {
            totalCourses: 0,
            totalStudents: 0,
            totalAssignments: 0
        });
    }, [courses]);

    const handleCreateCourse = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setActionMessage('El nombre del curso es obligatorio.');
            return;
        }

        setCreating(true);
        setActionMessage('');

        try {
            const createdCourse = await apiService.createAcademicCourse({
                name: name.trim(),
                description: description.trim() || undefined
            });

            setName('');
            setDescription('');
            setActionMessage(`Curso creado correctamente. Código de invitación: ${createdCourse.inviteCode}`);
            await loadCourses();
        } catch (apiError) {
            setActionMessage(apiError?.response?.data?.message || apiError?.message || 'No se pudo crear el curso.');
        } finally {
            setCreating(false);
        }
    };

    const handleCopyInviteLink = async (inviteCode) => {
        try {
            const inviteLink = `${window.location.origin}/courses?invite=${encodeURIComponent(inviteCode)}`;
            await navigator.clipboard.writeText(inviteLink);
            setActionMessage('Link de invitación copiado.');
        } catch {
            setActionMessage('No se pudo copiar el link de invitación.');
        }
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full space-y-4">
            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Cursos académicos</h1>
                        <p className="text-sm text-gray-600">Docentes y auxiliares ven aquí los cursos creados por su usuario. Administrador ve todos los cursos.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void loadCourses()}
                        className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
                    >
                        Actualizar
                    </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded border bg-gray-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Cursos</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">{summary.totalCourses}</div>
                    </div>
                    <div className="rounded border bg-gray-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Estudiantes</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">{summary.totalStudents}</div>
                    </div>
                    <div className="rounded border bg-gray-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Tareas</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">{summary.totalAssignments}</div>
                    </div>
                </div>
            </section>

            <section className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Crear curso</h2>
                    <p className="text-sm text-gray-600">La inscripción de estudiantes por username se administra luego desde el detalle del curso. Esta acción está pensada para docentes y administrador.</p>
                </div>

                <form onSubmit={handleCreateCourse} className="grid gap-3 md:grid-cols-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Nombre del curso"
                        className="border rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Descripción"
                        className="border rounded px-3 py-2 text-sm"
                    />
                    <div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            {creating ? 'Creando...' : 'Crear curso'}
                        </button>
                    </div>
                </form>
            </section>

            {actionMessage && (
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    {actionMessage}
                </section>
            )}

            {error && (
                <section className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    {error}
                </section>
            )}

            <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="border-b px-4 py-3">
                    <h2 className="text-lg font-semibold text-gray-900">Cursos del panel</h2>
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-gray-600">Cargando cursos...</div>
                ) : courses.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">No hay cursos disponibles para gestionar.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse">
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Curso</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Administrador</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Estudiantes</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Tareas</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {courses.map((course) => (
                                    <tr key={course.courseId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <StatementPreview html={course.name} className="font-medium text-gray-900" />
                                            {course.description && (
                                                <StatementPreview html={course.description} className="mt-1 text-xs text-gray-500" />
                                            )}
                                            <div className="text-xs text-gray-500">Curso #{course.courseId}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{course.ownerUserId || 'Sin definir'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{course.role}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-700">{course.studentCount}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-700">{course.assignmentCount}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{course.inviteCode}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleCopyInviteLink(course.inviteCode)}
                                                    className="rounded border px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Copiar link
                                                </button>
                                                <Link
                                                    to={`/admin/academic/courses/${course.courseId}`}
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

export default ListAcademicCoursePage;
