import { useEffect, useMemo, useState } from 'react';

import { apiService } from '../../../services/apiService';

function getApiErrorMessage(error, fallback) {
    return error?.response?.data?.message || error?.response?.data?.title || error?.message || fallback;
}

function RoleManagementPage() {
    const [assignments, setAssignments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchError, setSearchError] = useState('');

    const manageableRoles = useMemo(
        () => roles.filter((role) => Number(role.roleId) !== 1),
        [roles]
    );

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [assignedUsers, availableRoles] = await Promise.all([
                apiService.fetchRoles(),
                apiService.fetchAvailableRoles()
            ]);

            setAssignments(Array.isArray(assignedUsers) ? assignedUsers : []);
            setRoles(Array.isArray(availableRoles) ? availableRoles : []);
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, 'No se pudo cargar la gestión de permisos.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        const normalizedSearch = searchTerm.trim();
        if (normalizedSearch.length < 2) {
            setUsers([]);
            setSearchError('');
            return;
        }

        let active = true;
        const timer = window.setTimeout(() => {
            setSearchError('');
            apiService.fetchUserProfileList({ searchTerm: normalizedSearch })
                .then((response) => {
                    if (active) setUsers(Array.isArray(response) ? response : []);
                })
                .catch((apiError) => {
                    if (!active) return;
                    setUsers([]);
                    setSearchError(getApiErrorMessage(apiError, 'No se pudo buscar usuarios.'));
                });
        }, 250);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [searchTerm]);

    const flattenedAssignments = useMemo(() => assignments.flatMap((user) => (
        (user.userRoles || []).map((userRole) => ({
            userId: user.userId,
            profile: user.userProfile || {},
            roleId: userRole.role?.roleId,
            roleName: userRole.role?.roleName || 'Sin nombre'
        }))
    )), [assignments]);

    const selectedUserRoleIds = useMemo(() => new Set(
        flattenedAssignments
            .filter((assignment) => assignment.userId === selectedUserId)
            .map((assignment) => Number(assignment.roleId))
    ), [flattenedAssignments, selectedUserId]);

    const assignableRoles = useMemo(
        () => manageableRoles.filter((role) => !selectedUserRoleIds.has(Number(role.roleId))),
        [manageableRoles, selectedUserRoleIds]
    );

    const assignRole = async (event) => {
        event.preventDefault();
        if (!selectedUserId || !selectedRoleId) {
            setError('Selecciona un usuario y un rol.');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            await apiService.addRoleToUser(selectedUserId, Number(selectedRoleId));
            setMessage(`Permiso asignado correctamente a ${selectedUserId}.`);
            setSearchTerm('');
            setSelectedUserId('');
            setSelectedRoleId('');
            setUsers([]);
            await loadData();
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, 'No se pudo asignar el permiso.'));
        } finally {
            setSaving(false);
        }
    };

    const removeRole = async (assignment) => {
        if (!window.confirm(`¿Quitar el rol ${assignment.roleName} a ${assignment.userId}?`)) {
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            await apiService.removeRoleFromUser(assignment.userId, assignment.roleId);
            setMessage('Permiso retirado correctamente.');
            await loadData();
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, 'No se pudo retirar el permiso.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto min-w-full space-y-4 p-4">
            <section className="rounded-lg border bg-white p-5 shadow-sm">
                <h1 className="text-xl font-semibold text-gray-900">Roles y permisos</h1>
                <p className="mt-1 text-sm text-gray-600">Asigna o retira permisos de gestión a usuarios del sitio actual.</p>
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Asignar permiso</h2>
                <form onSubmit={assignRole} className="mt-4 grid gap-4 lg:grid-cols-3 lg:items-end">
                    <label className="space-y-1 text-sm font-medium text-gray-700">
                        Buscar usuario
                        <input
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setSelectedUserId('');
                                setSelectedRoleId('');
                            }}
                            placeholder="Username, nombre o correo"
                            className="w-full rounded border px-3 py-2 font-normal"
                        />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-gray-700">
                        Usuario
                        <select
                            value={selectedUserId}
                            onChange={(event) => {
                                setSelectedUserId(event.target.value);
                                setSelectedRoleId('');
                            }}
                            className="w-full rounded border px-3 py-2 font-normal"
                        >
                            <option value="">Selecciona un usuario</option>
                            {users.map((user) => (
                                <option key={user.userId} value={user.userId}>
                                    {user.userId} — {user.userProfile?.nick || user.userProfile?.email || 'Sin perfil'}
                                </option>
                            ))}
                        </select>
                        {searchError && <span className="block text-xs font-normal text-red-600">{searchError}</span>}
                    </label>
                    <div className="flex gap-2">
                        <label className="flex-1 space-y-1 text-sm font-medium text-gray-700">
                            Rol
                            <select
                                value={selectedRoleId}
                                onChange={(event) => setSelectedRoleId(event.target.value)}
                                className="w-full rounded border px-3 py-2 font-normal"
                            >
                                <option value="">Selecciona un rol</option>
                                {assignableRoles.map((role) => <option key={role.roleId} value={role.roleId}>{role.roleName}</option>)}
                            </select>
                        </label>
                        <button
                            type="submit"
                            disabled={saving}
                            className="self-end rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            {saving ? 'Guardando...' : 'Asignar'}
                        </button>
                    </div>
                </form>
            </section>

            {message && <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
            {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Permisos asignados</h2>
                        <p className="text-xs text-gray-500">{flattenedAssignments.length} asignaciones activas.</p>
                    </div>
                    <button type="button" onClick={() => void loadData()} className="rounded border px-3 py-2 text-sm hover:bg-gray-50">Actualizar</button>
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-gray-600">Cargando permisos...</div>
                ) : flattenedAssignments.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">No hay permisos de gestión asignados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-sm">
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Usuario</th>
                                    <th className="px-4 py-3 text-left">Nombre</th>
                                    <th className="px-4 py-3 text-left">Correo</th>
                                    <th className="px-4 py-3 text-left">Rol</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {flattenedAssignments.map((assignment) => (
                                    <tr key={`${assignment.userId}-${assignment.roleId}`}>
                                        <td className="px-4 py-3 font-medium">{assignment.userId}</td>
                                        <td className="px-4 py-3">{`${assignment.profile.nick || ''} ${assignment.profile.lastname || ''}`.trim() || '—'}</td>
                                        <td className="px-4 py-3">{assignment.profile.email || '—'}</td>
                                        <td className="px-4 py-3">{assignment.roleName}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() => void removeRole(assignment)}
                                                className="rounded border border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-50 disabled:opacity-60"
                                            >
                                                Retirar
                                            </button>
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

export default RoleManagementPage;
