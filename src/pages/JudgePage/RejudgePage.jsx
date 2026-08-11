import { useEffect, useMemo, useState } from 'react';

import { apiService } from '../../services/apiService';

const EMPTY_REQUEST = {
    scope: 'solution',
    primaryId: '',
    secondaryId: '',
    languageId: ''
};

const SCOPE_OPTIONS = [
    { value: 'solution', label: 'Una solución', fieldLabel: 'ID de solución' },
    { value: 'problem', label: 'Todas las soluciones de un problema', fieldLabel: 'ID de problema' },
    { value: 'contest', label: 'Todas las soluciones de un concurso', fieldLabel: 'ID de concurso' },
    { value: 'range', label: 'Rango de soluciones', fieldLabel: 'Desde solución' },
    { value: 'language', label: 'Todas las soluciones por lenguaje', fieldLabel: 'Lenguaje' }
];

function getApiErrorMessage(error, fallback) {
    return error?.response?.data?.message || error?.response?.data?.title || error?.message || fallback;
}

function getLanguageId(language) {
    return language.languageId ?? language.langId ?? language.id;
}

function getLanguageName(language) {
    return language.name ?? language.languageName ?? language.langName ?? `Lenguaje ${getLanguageId(language)}`;
}

function parsePositiveInteger(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function RejudgePage() {
    const [request, setRequest] = useState(EMPTY_REQUEST);
    const [languages, setLanguages] = useState([]);
    const [history, setHistory] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [historyError, setHistoryError] = useState('');

    const selectedScope = useMemo(
        () => SCOPE_OPTIONS.find((option) => option.value === request.scope) || SCOPE_OPTIONS[0],
        [request.scope]
    );

    const loadHistory = async () => {
        setLoadingHistory(true);
        setHistoryError('');

        try {
            const response = await apiService.fetchRejudgeHistory(50);
            setHistory(response);
        } catch (apiError) {
            setHistoryError(getApiErrorMessage(apiError, 'No se pudo cargar la cola de rejudge.'));
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        void Promise.all([
            apiService.fetchProgrammingLanguages()
                .then((response) => setLanguages(Array.isArray(response) ? response : []))
                .catch(() => setLanguages([])),
            loadHistory()
        ]);
    }, []);

    const updateRequest = (field, value) => {
        setRequest((current) => ({ ...current, [field]: value }));
    };

    const validateRequest = () => {
        if (request.scope === 'language') {
            return parsePositiveInteger(request.languageId) ? '' : 'Selecciona un lenguaje.';
        }

        const primaryId = parsePositiveInteger(request.primaryId);
        if (!primaryId) {
            return `${selectedScope.fieldLabel} debe ser un número positivo.`;
        }

        if (request.scope === 'range') {
            const secondaryId = parsePositiveInteger(request.secondaryId);
            if (!secondaryId) {
                return 'Hasta solución debe ser un número positivo.';
            }
            if (primaryId > secondaryId) {
                return 'El inicio del rango no puede ser mayor que el final.';
            }
        }

        return '';
    };

    const submitRejudge = async (event) => {
        event.preventDefault();
        const validationError = validateRequest();
        if (validationError) {
            setError(validationError);
            setMessage('');
            return;
        }

        if (!window.confirm(`¿Confirmas el rejudge para: ${selectedScope.label.toLowerCase()}?`)) {
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            const primaryId = Number(request.primaryId);
            let response;

            if (request.scope === 'solution') response = await apiService.rejudgeSolution(primaryId);
            if (request.scope === 'problem') response = await apiService.rejudgeProblem(primaryId);
            if (request.scope === 'contest') response = await apiService.rejudgeContest(primaryId);
            if (request.scope === 'range') response = await apiService.rejudgeRange(primaryId, Number(request.secondaryId));
            if (request.scope === 'language') response = await apiService.rejudgeLanguage(Number(request.languageId));

            setMessage(`Solicitud registrada: ${response?.matched ?? 0} soluciones enviadas a la cola.`);
            setRequest((current) => ({ ...EMPTY_REQUEST, scope: current.scope }));
            await loadHistory();
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, 'No se pudo solicitar el rejudge.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto min-w-full space-y-4 p-4">
            <section className="rounded-lg border bg-white p-5 shadow-sm">
                <h1 className="text-xl font-semibold text-gray-900">Centro de rejudge</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Reenvía soluciones existentes al kernel por solución, problema, concurso, rango o lenguaje.
                </p>
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
                <form onSubmit={submitRejudge} className="grid gap-4 lg:grid-cols-4 lg:items-end">
                    <label className="space-y-1 text-sm font-medium text-gray-700">
                        Alcance
                        <select
                            value={request.scope}
                            onChange={(event) => updateRequest('scope', event.target.value)}
                            className="w-full rounded border px-3 py-2 font-normal"
                        >
                            {SCOPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>

                    {request.scope === 'language' ? (
                        <label className="space-y-1 text-sm font-medium text-gray-700 lg:col-span-2">
                            Lenguaje
                            <select
                                value={request.languageId}
                                onChange={(event) => updateRequest('languageId', event.target.value)}
                                className="w-full rounded border px-3 py-2 font-normal"
                            >
                                <option value="">Selecciona un lenguaje</option>
                                {languages.map((language) => (
                                    <option key={getLanguageId(language)} value={getLanguageId(language)}>{getLanguageName(language)}</option>
                                ))}
                            </select>
                        </label>
                    ) : (
                        <>
                            <label className="space-y-1 text-sm font-medium text-gray-700">
                                {selectedScope.fieldLabel}
                                <input
                                    type="number"
                                    min="1"
                                    value={request.primaryId}
                                    onChange={(event) => updateRequest('primaryId', event.target.value)}
                                    className="w-full rounded border px-3 py-2 font-normal"
                                />
                            </label>
                            {request.scope === 'range' && (
                                <label className="space-y-1 text-sm font-medium text-gray-700">
                                    Hasta solución
                                    <input
                                        type="number"
                                        min="1"
                                        value={request.secondaryId}
                                        onChange={(event) => updateRequest('secondaryId', event.target.value)}
                                        className="w-full rounded border px-3 py-2 font-normal"
                                    />
                                </label>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                    >
                        {submitting ? 'Enviando...' : 'Solicitar rejudge'}
                    </button>
                </form>
            </section>

            {message && <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
            {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Cola pendiente</h2>
                        <p className="text-xs text-gray-500">{history?.total ?? 0} soluciones esperando rejudge.</p>
                    </div>
                    <button type="button" disabled={loadingHistory} onClick={() => void loadHistory()} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60">
                        {loadingHistory ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>

                {historyError ? (
                    <div className="p-4 text-sm text-red-700">{historyError}</div>
                ) : loadingHistory ? (
                    <div className="p-4 text-sm text-gray-600">Cargando cola...</div>
                ) : !history?.items?.length ? (
                    <div className="p-4 text-sm text-gray-600">No hay soluciones pendientes de rejudge.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-sm">
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Solución</th>
                                    <th className="px-4 py-3 text-left">Problema</th>
                                    <th className="px-4 py-3 text-left">Concurso</th>
                                    <th className="px-4 py-3 text-left">Usuario</th>
                                    <th className="px-4 py-3 text-left">Lenguaje</th>
                                    <th className="px-4 py-3 text-left">Creada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {history.items.map((item) => (
                                    <tr key={item.solutionId}>
                                        <td className="px-4 py-3">#{item.solutionId}</td>
                                        <td className="px-4 py-3">#{item.problemId}</td>
                                        <td className="px-4 py-3">{item.contestId ? `#${item.contestId}` : '—'}</td>
                                        <td className="px-4 py-3">{item.userId}</td>
                                        <td className="px-4 py-3">{getLanguageName(languages.find((language) => Number(getLanguageId(language)) === Number(item.languageId)) || { id: item.languageId })}</td>
                                        <td className="px-4 py-3">{new Date(item.createdAtUtc).toLocaleString()}</td>
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

export default RejudgePage;
