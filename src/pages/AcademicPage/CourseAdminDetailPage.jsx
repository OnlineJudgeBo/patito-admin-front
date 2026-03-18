import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AsyncSelect from 'react-select/async';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { apiService } from '../../services/apiService';
import { fixTimeFormat } from '../../utils/Utils';

function formatDateTime(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return 'Sin fecha';
    }

    return parsed.toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });
}

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toTimeInputValue(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function buildDateTimeValue(date, time) {
    if (!date || !time) {
        return undefined;
    }

    return `${date} ${fixTimeFormat(time)}`;
}

function parseDateTimeRange(date, time) {
    if (!date || !time) {
        return null;
    }

    const parsed = new Date(`${date}T${fixTimeFormat(time)}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateTimeInputParts(value) {
    if (!value) {
        return {
            date: '',
            time: ''
        };
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return {
            date: '',
            time: ''
        };
    }

    return {
        date: toDateInputValue(parsed),
        time: toTimeInputValue(parsed)
    };
}

function parseProblemIds(rawValue) {
    return Array.from(new Set(
        rawValue
            .split(/[\s,;]+/)
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)
    ));
}

function buildAssignmentRequest({
    title,
    description,
    problems,
    opensDate,
    opensTime,
    dueDate,
    dueTime,
    isActive = true
}) {
    const problemIds = parseProblemIds(problems);
    if (!title.trim()) {
        return { error: 'El título de la tarea es obligatorio.' };
    }

    if (problemIds.length === 0) {
        return { error: 'Ingresa al menos un problem ID.' };
    }

    if (!opensDate || !opensTime || !dueDate || !dueTime) {
        return { error: 'Completa fecha y hora de inicio y fin.' };
    }

    const opensAt = parseDateTimeRange(opensDate, opensTime);
    const dueAt = parseDateTimeRange(dueDate, dueTime);

    if (!opensAt || !dueAt) {
        return { error: 'Las fechas ingresadas no son válidas.' };
    }

    if (dueAt < opensAt) {
        return { error: 'La fecha de fin no puede ser menor a la fecha de inicio.' };
    }

    return {
        payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            opensAt: buildDateTimeValue(opensDate, opensTime),
            dueAt: buildDateTimeValue(dueDate, dueTime),
            isActive,
            problemIds
        }
    };
}

function buildProblemOption(problem) {
    return {
        value: Number(problem.problemId),
        label: `${problem.problemId} - ${problem.title}`
    };
}

function CourseAdminDetailPage() {
    const { courseId } = useParams();
    const numericCourseId = Number(courseId);

    const [course, setCourse] = useState(null);
    const [members, setMembers] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const [memberUserId, setMemberUserId] = useState('');
    const [memberOption, setMemberOption] = useState(null);
    const [addingMember, setAddingMember] = useState(false);

    const [assignmentTitle, setAssignmentTitle] = useState('Contest clase 1');
    const [assignmentDescription, setAssignmentDescription] = useState('');
    const [assignmentProblems, setAssignmentProblems] = useState('');
    const [assignmentOpensDate, setAssignmentOpensDate] = useState(() => toDateInputValue(new Date()));
    const [assignmentOpensTime, setAssignmentOpensTime] = useState(() => toTimeInputValue(new Date()));
    const [assignmentDueDate, setAssignmentDueDate] = useState(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return toDateInputValue(nextWeek);
    });
    const [assignmentDueTime, setAssignmentDueTime] = useState(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return toTimeInputValue(nextWeek);
    });
    const [assignmentProblemOptions, setAssignmentProblemOptions] = useState([]);
    const [assignmentProblemErrors, setAssignmentProblemErrors] = useState([]);
    const [creatingAssignment, setCreatingAssignment] = useState(false);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [editingAssignmentId, setEditingAssignmentId] = useState(null);
    const [editingAssignmentTitle, setEditingAssignmentTitle] = useState('');
    const [editingAssignmentDescription, setEditingAssignmentDescription] = useState('');
    const [editingAssignmentProblems, setEditingAssignmentProblems] = useState('');
    const [editingAssignmentOpensDate, setEditingAssignmentOpensDate] = useState('');
    const [editingAssignmentOpensTime, setEditingAssignmentOpensTime] = useState('');
    const [editingAssignmentDueDate, setEditingAssignmentDueDate] = useState('');
    const [editingAssignmentDueTime, setEditingAssignmentDueTime] = useState('');
    const [editingAssignmentProblemOptions, setEditingAssignmentProblemOptions] = useState([]);
    const [editingAssignmentProblemErrors, setEditingAssignmentProblemErrors] = useState([]);
    const [savingAssignmentId, setSavingAssignmentId] = useState(null);
    const [downloadingReport, setDownloadingReport] = useState(false);

    const loadPage = async () => {
        if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
            setError('Curso inválido.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const [courseResponse, membersResponse, reportResponse] = await Promise.all([
                apiService.fetchAcademicCourse(numericCourseId),
                apiService.fetchAcademicCourseMembers(numericCourseId),
                apiService.fetchAcademicCourseReport(numericCourseId)
            ]);

            setCourse(courseResponse);
            setMembers(Array.isArray(membersResponse) ? membersResponse : []);
            setReport(reportResponse);
            setAssignmentTitle(`Contest clase ${(courseResponse.assignments?.length || 0) + 1}`);
        } catch (apiError) {
            setError(apiError?.response?.data?.message || apiError?.message || 'No se pudo abrir el curso.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadPage();
    }, [courseId]);

    const inviteLink = useMemo(() => {
        if (!course?.inviteCode) {
            return '';
        }

        return `${window.location.origin}/courses?invite=${encodeURIComponent(course.inviteCode)}`;
    }, [course]);

    const loadProblemOptions = async (inputValue) => {
        const query = inputValue?.trim() || '';
        if (query.length === 0) {
            return [];
        }

        try {
        const response = await apiService.fetchProblemList({ searchTerm: query });
        const items = Array.isArray(response) ? response : [];
        return items
            .map(buildProblemOption)
            .sort((left, right) => left.label.localeCompare(right.label));
        } catch (apiError) {
            console.error('Error al cargar problemas del selector de tareas:', apiError);
            return [];
        }
    };

    const loadUserOptions = async (inputValue) => {
        const query = inputValue?.trim() || '';
        if (query.length < 2) {
            return [];
        }

        try {
            const response = await apiService.fetchUserProfileList({ searchTerm: query });
            const items = Array.isArray(response) ? response : [];
            return items
                .map((user) => ({
                    value: user.userId,
                    label: `${user?.userProfile?.nick || user.userId} ${user?.userProfile?.lastname || ''}`.trim(),
                    meta: `@${user.userId}`
                }))
                .sort((left, right) => left.label.localeCompare(right.label));
        } catch (apiError) {
            console.error('Error al cargar usuarios del selector de miembros:', apiError);
            return [];
        }
    };

    const syncProblemOptionsFromText = async (rawValue, setOptions, setErrors, setText) => {
        const problemIds = parseProblemIds(rawValue);
        if (problemIds.length === 0) {
            setOptions([]);
            setErrors([]);
            setText('');
            return;
        }

        const validOptions = [];
        const errors = [];

        for (const problemId of problemIds) {
            try {
                const response = await apiService.fetchProblemList({ searchTerm: String(problemId) });
                const items = Array.isArray(response) ? response : [];
                const exactMatch = items.find((problem) => Number(problem.problemId) === problemId);
                if (!exactMatch) {
                    errors.push(`Problema ${problemId} no encontrado.`);
                    continue;
                }

                validOptions.push(buildProblemOption(exactMatch));
            } catch (apiError) {
                errors.push(`Error al validar el problema ${problemId}.`);
            }
        }

        setOptions(validOptions);
        setErrors(errors);
        setText(validOptions.map((problem) => problem.value).join('\n'));
    };

    const handleProblemOptionChange = (newValue, setOptions, setText, setErrors) => {
        const options = Array.isArray(newValue) ? newValue : [];
        setOptions(options);
        setText(options.map((problem) => problem.value).join('\n'));
        setErrors([]);
    };

    const handleCopyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setActionMessage('Link de invitación copiado.');
        } catch {
            setActionMessage('No se pudo copiar el link de invitación.');
        }
    };

    const handleAddMember = async (event) => {
        event.preventDefault();

        if (!memberUserId.trim()) {
            setActionMessage('Ingresa el username del estudiante o auxiliar.');
            return;
        }

        setAddingMember(true);
        setActionMessage('');

        try {
            await apiService.addAcademicCourseMember(numericCourseId, {
                userId: memberUserId.trim(),
                role: 'student'
            });

            setMemberUserId('');
            setMemberOption(null);
            setActionMessage('Miembro agregado correctamente.');
            await loadPage();
        } catch (apiError) {
            setActionMessage(apiError?.response?.data?.message || apiError?.message || 'No se pudo agregar el miembro.');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        const confirmed = window.confirm(`¿Quitar a ${userId} de este curso?`);
        if (!confirmed) {
            return;
        }

        setActionMessage('');

        try {
            await apiService.removeAcademicCourseMember(numericCourseId, userId);
            setActionMessage('Miembro removido correctamente.');
            await loadPage();
        } catch (apiError) {
            setActionMessage(apiError?.response?.data?.message || apiError?.message || 'No se pudo quitar al miembro.');
        }
    };

    const handleStartEditingAssignment = (assignment) => {
        const opensAt = toDateTimeInputParts(assignment.opensAt);
        const dueAt = toDateTimeInputParts(assignment.dueAt);
        const problemOptions = (assignment.problems || []).map((problem) => buildProblemOption({
            problemId: problem.problemId,
            title: problem.title
        }));

        setEditingAssignmentId(assignment.assignmentId);
        setEditingAssignmentTitle(assignment.title || '');
        setEditingAssignmentDescription(assignment.description || '');
        setEditingAssignmentProblems(problemOptions.map((problem) => problem.value).join('\n'));
        setEditingAssignmentOpensDate(opensAt.date);
        setEditingAssignmentOpensTime(opensAt.time);
        setEditingAssignmentDueDate(dueAt.date);
        setEditingAssignmentDueTime(dueAt.time);
        setEditingAssignmentProblemOptions(problemOptions);
        setEditingAssignmentProblemErrors([]);
        setIsAssignmentDialogOpen(true);
        setActionMessage('');
    };

    const handleCancelEditingAssignment = () => {
        setEditingAssignmentId(null);
        setEditingAssignmentTitle('');
        setEditingAssignmentDescription('');
        setEditingAssignmentProblems('');
        setEditingAssignmentOpensDate('');
        setEditingAssignmentOpensTime('');
        setEditingAssignmentDueDate('');
        setEditingAssignmentDueTime('');
        setEditingAssignmentProblemOptions([]);
        setEditingAssignmentProblemErrors([]);
        setIsAssignmentDialogOpen(false);
    };

    const handleOpenCreateAssignmentDialog = () => {
        setEditingAssignmentId(null);
        setEditingAssignmentTitle('');
        setEditingAssignmentDescription('');
        setEditingAssignmentProblems('');
        setEditingAssignmentOpensDate('');
        setEditingAssignmentOpensTime('');
        setEditingAssignmentDueDate('');
        setEditingAssignmentDueTime('');
        setEditingAssignmentProblemOptions([]);
        setEditingAssignmentProblemErrors([]);
        setIsAssignmentDialogOpen(true);
        setActionMessage('');
    };

    const handleCreateAssignment = async (event) => {
        event.preventDefault();
        const { error: assignmentError, payload } = buildAssignmentRequest({
            title: assignmentTitle,
            description: assignmentDescription,
            problems: assignmentProblems,
            opensDate: assignmentOpensDate,
            opensTime: assignmentOpensTime,
            dueDate: assignmentDueDate,
            dueTime: assignmentDueTime
        });

        if (assignmentError) {
            setActionMessage(assignmentError);
            return;
        }

        setCreatingAssignment(true);
        setActionMessage('');

        try {
            await apiService.createAcademicCourseAssignment(numericCourseId, payload);

            setAssignmentDescription('');
            setAssignmentProblems('');
            setAssignmentProblemOptions([]);
            setAssignmentProblemErrors([]);
            setActionMessage('Tarea creada correctamente.');
            setIsAssignmentDialogOpen(false);
            await loadPage();
        } catch (apiError) {
            setActionMessage(apiError?.response?.data?.message || apiError?.message || 'No se pudo crear la tarea.');
        } finally {
            setCreatingAssignment(false);
        }
    };

    const handleUpdateAssignment = async (event) => {
        event.preventDefault();

        if (!editingAssignmentId) {
            return;
        }

        const { error: assignmentError, payload } = buildAssignmentRequest({
            title: editingAssignmentTitle,
            description: editingAssignmentDescription,
            problems: editingAssignmentProblems,
            opensDate: editingAssignmentOpensDate,
            opensTime: editingAssignmentOpensTime,
            dueDate: editingAssignmentDueDate,
            dueTime: editingAssignmentDueTime
        });

        if (assignmentError) {
            setActionMessage(assignmentError);
            return;
        }

        setSavingAssignmentId(editingAssignmentId);
        setActionMessage('');

        try {
            await apiService.updateAcademicCourseAssignment(numericCourseId, editingAssignmentId, payload);
            handleCancelEditingAssignment();
            setActionMessage('Tarea actualizada correctamente.');
            await loadPage();
        } catch (apiError) {
            setActionMessage(apiError?.response?.data?.message || apiError?.message || 'No se pudo actualizar la tarea.');
        } finally {
            setSavingAssignmentId(null);
        }
    };

    const handleDownloadReport = async () => {
        setDownloadingReport(true);
        setActionMessage('');

        try {
            const blob = await apiService.downloadAcademicCourseReportCsv(numericCourseId);
            const downloadUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = `course-${numericCourseId}-report.csv`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (apiError) {
            setActionMessage(apiError?.response?.data?.message || apiError?.message || 'No se pudo descargar el reporte.');
        } finally {
            setDownloadingReport(false);
        }
    };

    if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
        return <div className="container mx-auto p-4">Curso inválido.</div>;
    }

    const isEditingAssignment = editingAssignmentId !== null;
    const currentAssignmentTitle = isEditingAssignment ? editingAssignmentTitle : assignmentTitle;
    const currentAssignmentDescription = isEditingAssignment ? editingAssignmentDescription : assignmentDescription;
    const currentAssignmentProblems = isEditingAssignment ? editingAssignmentProblems : assignmentProblems;
    const currentAssignmentOpensDate = isEditingAssignment ? editingAssignmentOpensDate : assignmentOpensDate;
    const currentAssignmentOpensTime = isEditingAssignment ? editingAssignmentOpensTime : assignmentOpensTime;
    const currentAssignmentDueDate = isEditingAssignment ? editingAssignmentDueDate : assignmentDueDate;
    const currentAssignmentDueTime = isEditingAssignment ? editingAssignmentDueTime : assignmentDueTime;
    const currentAssignmentProblemOptions = isEditingAssignment ? editingAssignmentProblemOptions : assignmentProblemOptions;
    const currentAssignmentProblemErrors = isEditingAssignment ? editingAssignmentProblemErrors : assignmentProblemErrors;
    const isSubmittingAssignment = creatingAssignment || savingAssignmentId !== null;

    return (
        <div className="container mx-auto p-4 w-full min-w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link to="/admin/academic/courses" className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Volver a cursos
                </Link>

                <div className="flex gap-2">
                    {report?.canDownloadCsv && (
                        <button
                            type="button"
                            onClick={() => void handleDownloadReport()}
                            disabled={downloadingReport}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            {downloadingReport ? 'Descargando...' : 'Descargar CSV'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => void loadPage()}
                        className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

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

            {loading ? (
                <section className="bg-white border rounded-lg p-4 text-sm text-gray-600">Cargando curso...</section>
            ) : course && (
                <>
                    <section className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
                                <p className="mt-1 text-sm text-gray-600">{course.description || 'Este curso no tiene descripción.'}</p>
                            </div>

                            <div className="text-sm text-gray-600">
                                <div>Rol: <strong className="text-gray-900">{course.memberRole}</strong></div>
                                <div>Administrador: <strong className="text-gray-900">{course.ownerUserId}</strong></div>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <div className="rounded border bg-gray-50 px-4 py-3">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Estudiantes</div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">{course.studentCount}</div>
                            </div>
                            <div className="rounded border bg-gray-50 px-4 py-3">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Tareas</div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">{course.assignmentCount}</div>
                            </div>
                            <div className="rounded border bg-gray-50 px-4 py-3">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Código</div>
                                <div className="mt-1 text-sm font-mono text-gray-900">{course.inviteCode}</div>
                            </div>
                            <div className="rounded border bg-gray-50 px-4 py-3">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Invitación</div>
                                <button
                                    type="button"
                                    onClick={() => void handleCopyInviteLink()}
                                    className="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-500"
                                >
                                    Copiar link público
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500 break-all">{inviteLink}</div>
                    </section>

                    <section className="bg-white border rounded-lg p-3 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className={`rounded px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Curso
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('report')}
                                className={`rounded px-4 py-2 text-sm font-medium ${activeTab === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Reporte del curso
                            </button>
                        </div>
                    </section>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <section className="bg-white border rounded-lg p-4 shadow-sm">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Tareas del curso</h2>
                                        <p className="text-sm text-gray-600">Gestiona las tareas desde una ventana dedicada, con búsqueda de problemas y fechas más cómodas.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOpenCreateAssignmentDialog}
                                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                                    >
                                        Agregar tarea
                                    </button>
                                </div>

                                <div className="mt-5 overflow-x-auto">
                                    <table className="table-auto w-full border-collapse">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-sm font-semibold">Tarea</th>
                                                <th className="px-3 py-2 text-left text-sm font-semibold">Ventana</th>
                                                <th className="px-3 py-2 text-right text-sm font-semibold">Problemas</th>
                                                <th className="px-3 py-2 text-right text-sm font-semibold">Tus envíos</th>
                                                <th className="px-3 py-2 text-right text-sm font-semibold">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {(course.assignments || []).map((assignment) => (
                                                <tr key={assignment.assignmentId} className={editingAssignmentId === assignment.assignmentId ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                                    <td className="px-3 py-2 text-sm text-gray-700">
                                                        <div className="font-medium text-gray-900">{assignment.title}</div>
                                                        <div className="text-xs text-gray-500">{assignment.statusLabel}</div>
                                                        {(assignment.problems || []).length > 0 && (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                IDs: {(assignment.problems || []).map((problem) => problem.problemId).join(', ')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-700">
                                                        <div>{formatDateTime(assignment.opensAt)}</div>
                                                        <div className="text-xs text-gray-500">{formatDateTime(assignment.lateDueAt || assignment.dueAt)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-right text-gray-700">{assignment.problemCount}</td>
                                                    <td className="px-3 py-2 text-sm text-right text-gray-700">{assignment.attemptsByCurrentUser}</td>
                                                    <td className="px-3 py-2 text-sm text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (editingAssignmentId === assignment.assignmentId) {
                                                                    handleCancelEditingAssignment();
                                                                    return;
                                                                }

                                                                handleStartEditingAssignment(assignment);
                                                            }}
                                                            className="rounded border px-3 py-1.5 text-blue-700 hover:bg-blue-50"
                                                        >
                                                            {editingAssignmentId === assignment.assignmentId ? 'Editando' : 'Editar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="bg-white border rounded-lg p-4 shadow-sm">
                                <div className="mb-3">
                                    <h2 className="text-lg font-semibold text-gray-900">Miembros del curso</h2>
                                    <p className="text-sm text-gray-600">Los nuevos miembros se agregan como estudiantes por defecto.</p>
                                </div>

                                <form onSubmit={handleAddMember} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={loadUserOptions}
                                        value={memberOption}
                                        onChange={(option) => {
                                            setMemberOption(option);
                                            setMemberUserId(option?.value || '');
                                        }}
                                        placeholder="Busca por username o nombre"
                                        className="text-base w-full"
                                        noOptionsMessage={() => 'Sin resultados'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={addingMember}
                                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                                    >
                                        {addingMember ? 'Agregando...' : 'Agregar estudiante'}
                                    </button>
                                </form>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="table-auto w-full border-collapse">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-sm font-semibold">Usuario</th>
                                                <th className="px-3 py-2 text-left text-sm font-semibold">Contacto</th>
                                                <th className="px-3 py-2 text-right text-sm font-semibold">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {members.map((member) => (
                                                <tr key={member.userId} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-sm text-gray-700">
                                                        <div className="font-medium text-gray-900">{member.nick || member.userId}</div>
                                                        <div className="text-xs text-gray-500">@{member.userId}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-700">
                                                        <div>{member.email || 'Sin correo'}</div>
                                                        <div className="text-xs text-gray-500">{member.lastname || 'Sin apellido'}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-right">
                                                        {member.role === 'teacher' ? (
                                                            <span className="text-xs text-gray-500">Protegido</span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleRemoveMember(member.userId)}
                                                                className="rounded border px-3 py-1.5 text-red-600 hover:bg-red-50"
                                                            >
                                                                Quitar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    <Dialog open={isAssignmentDialogOpen} onOpenChange={(open) => {
                        setIsAssignmentDialogOpen(open);
                        if (!open) {
                            handleCancelEditingAssignment();
                        }
                    }}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white p-0 sm:max-w-6xl">
                            <div className="p-6">
                                <DialogHeader className="mb-6">
                                    <DialogTitle>{isEditingAssignment ? 'Editar tarea del curso' : 'Crear tarea o contest del curso'}</DialogTitle>
                                    <DialogDescription>
                                        Interfaz similar al creador de concursos: información principal a la izquierda y selección de problemas a la derecha.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={isEditingAssignment ? handleUpdateAssignment : handleCreateAssignment}>
                                    <div className="flex flex-col gap-6 xl:flex-row xl:divide-x xl:divide-gray-200">
                                        <div className="xl:w-1/2 xl:pr-6">
                                            <div className="mb-4">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la tarea</label>
                                                <input
                                                    type="text"
                                                    value={currentAssignmentTitle}
                                                    onChange={(event) => {
                                                        if (isEditingAssignment) {
                                                            setEditingAssignmentTitle(event.target.value);
                                                            return;
                                                        }

                                                        setAssignmentTitle(event.target.value);
                                                    }}
                                                    placeholder="Contest clase 1"
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                                                <textarea
                                                    value={currentAssignmentDescription}
                                                    onChange={(event) => {
                                                        if (isEditingAssignment) {
                                                            setEditingAssignmentDescription(event.target.value);
                                                            return;
                                                        }

                                                        setAssignmentDescription(event.target.value);
                                                    }}
                                                    placeholder="Descripción opcional"
                                                    className="w-full border rounded px-3 py-2 text-sm min-h-[128px]"
                                                />
                                            </div>

                                            <div className="flex mb-4 space-x-4">
                                                <div className="w-1/2">
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de inicio</label>
                                                    <input
                                                        type="date"
                                                        value={currentAssignmentOpensDate}
                                                        onChange={(event) => {
                                                            if (isEditingAssignment) {
                                                                setEditingAssignmentOpensDate(event.target.value);
                                                                return;
                                                            }

                                                            setAssignmentOpensDate(event.target.value);
                                                        }}
                                                        className="w-full border rounded px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Hora de inicio</label>
                                                    <input
                                                        type="time"
                                                        value={currentAssignmentOpensTime}
                                                        onChange={(event) => {
                                                            if (isEditingAssignment) {
                                                                setEditingAssignmentOpensTime(event.target.value);
                                                                return;
                                                            }

                                                            setAssignmentOpensTime(event.target.value);
                                                        }}
                                                        className="w-full border rounded px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex mb-4 space-x-4">
                                                <div className="w-1/2">
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de fin</label>
                                                    <input
                                                        type="date"
                                                        value={currentAssignmentDueDate}
                                                        onChange={(event) => {
                                                            if (isEditingAssignment) {
                                                                setEditingAssignmentDueDate(event.target.value);
                                                                return;
                                                            }

                                                            setAssignmentDueDate(event.target.value);
                                                        }}
                                                        className="w-full border rounded px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Hora de fin</label>
                                                    <input
                                                        type="time"
                                                        value={currentAssignmentDueTime}
                                                        onChange={(event) => {
                                                            if (isEditingAssignment) {
                                                                setEditingAssignmentDueTime(event.target.value);
                                                                return;
                                                            }

                                                            setAssignmentDueTime(event.target.value);
                                                        }}
                                                        className="w-full border rounded px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="xl:w-1/2 xl:pl-6">
                                            <h3 className="text-base font-semibold text-gray-900">Agregar problemas</h3>
                                            <p className="mb-4 text-sm text-gray-600">Busca por ID o título, o pega varios IDs manualmente.</p>

                                            <div className="mb-4">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Seleccionar problemas</label>
                                                <AsyncSelect
                                                    isMulti
                                                    cacheOptions
                                                    defaultOptions
                                                    loadOptions={loadProblemOptions}
                                                    onChange={(newValue) => handleProblemOptionChange(
                                                        newValue,
                                                        isEditingAssignment ? setEditingAssignmentProblemOptions : setAssignmentProblemOptions,
                                                        isEditingAssignment ? setEditingAssignmentProblems : setAssignmentProblems,
                                                        isEditingAssignment ? setEditingAssignmentProblemErrors : setAssignmentProblemErrors
                                                    )}
                                                    value={currentAssignmentProblemOptions}
                                                    placeholder="Busca por id o título"
                                                    className="text-base w-full"
                                                    noOptionsMessage={() => 'Sin resultados'}
                                                />
                                            </div>

                                            <Separator />

                                            <div className="mt-4">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Adicionar problemas</label>
                                                <textarea
                                                    value={currentAssignmentProblems}
                                                    onChange={(event) => {
                                                        if (isEditingAssignment) {
                                                            setEditingAssignmentProblems(event.target.value);
                                                            return;
                                                        }

                                                        setAssignmentProblems(event.target.value);
                                                    }}
                                                    onBlur={() => void syncProblemOptionsFromText(
                                                        currentAssignmentProblems,
                                                        isEditingAssignment ? setEditingAssignmentProblemOptions : setAssignmentProblemOptions,
                                                        isEditingAssignment ? setEditingAssignmentProblemErrors : setAssignmentProblemErrors,
                                                        isEditingAssignment ? setEditingAssignmentProblems : setAssignmentProblems
                                                    )}
                                                    placeholder={'1000\n1001\n1002'}
                                                    className="w-full border rounded px-3 py-2 text-sm min-h-[180px]"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Puedes usar una línea por problema o separar por coma.</p>
                                            </div>

                                            {currentAssignmentProblemErrors.length > 0 && (
                                                <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                    {currentAssignmentProblemErrors.map((message, index) => (
                                                        <div key={`${message}-${index}`}>{message}</div>
                                                    ))}
                                                </div>
                                            )}

                                            {currentAssignmentProblemOptions.length > 0 && (
                                                <div className="mt-4">
                                                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Problemas seleccionados</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentAssignmentProblemOptions.map((problem) => (
                                                            <span key={problem.value} className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-700">
                                                                {problem.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingAssignment}
                                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                                        >
                                            {isEditingAssignment
                                                ? (savingAssignmentId ? 'Guardando...' : 'Guardar cambios')
                                                : (creatingAssignment ? 'Creando...' : 'Crear tarea')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEditingAssignment}
                                            className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {activeTab === 'report' && (
                        <section className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold text-gray-900">Reporte del curso</h2>
                                <p className="text-sm text-gray-600">Cada columna de tarea muestra resueltos / envíos / AC.</p>
                            </div>

                            {!report || !Array.isArray(report.items) || report.items.length === 0 ? (
                                <div className="text-sm text-gray-600">No hay actividad registrada todavía.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table-auto w-full border-collapse">
                                        <thead className="bg-gray-900 text-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Resueltos</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Envíos</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">AC</th>
                                                {(report.assignments || []).map((assignment) => (
                                                    <th key={assignment.assignmentId} className="px-4 py-3 text-right text-sm font-semibold">
                                                        {assignment.title}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {report.items.map((item) => (
                                                <tr key={item.userId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700">#{item.rank}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        <div className="font-medium text-gray-900">{item.nick}</div>
                                                        <div className="text-xs text-gray-500">@{item.userId}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{item.totalSolved}</td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{item.totalAttempts}</td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{item.totalAccepted}</td>
                                                    {(report.assignments || []).map((assignment) => {
                                                        const stats = (item.assignments || []).find((cell) => cell.assignmentId === assignment.assignmentId);
                                                        return (
                                                            <td key={`${item.userId}-${assignment.assignmentId}`} className="px-4 py-3 text-sm text-right text-gray-700">
                                                                {stats ? `${stats.solved}/${stats.attempts}/${stats.accepted}` : '0/0/0'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

export default CourseAdminDetailPage;
