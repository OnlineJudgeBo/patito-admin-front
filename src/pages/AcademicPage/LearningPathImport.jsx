/* eslint-disable react/prop-types */
import { useState } from 'react';

import { apiService } from '../../services/apiService';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { applyImport, parseDocument, planImport } from './learningPathYaml';

const buttonClass = 'rounded px-3 py-1.5 text-sm disabled:opacity-50';

/**
 * Reads a YAML file, shows what would change and applies it.
 * `pathKey` is the path being edited, or null on the list page (the file decides which path).
 */
export function LearningPathImport({ pathKey, onDone }) {
    const [state, setState] = useState(null);   // { doc, plan, errors, existing }
    const [deleteIds, setDeleteIds] = useState(new Set());
    const [busy, setBusy] = useState(false);
    const [step, setStep] = useState('');
    const [message, setMessage] = useState('');

    const readFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setMessage('');
        setDeleteIds(new Set());
        const { doc, errors } = parseDocument(await file.text());
        if (errors) return setState({ errors });
        if (pathKey && doc.key !== pathKey)
            return setState({ errors: [`El archivo es de la ruta "${doc.key}" y estás editando "${pathKey}".`] });
        let existing = null;
        try {
            const paths = pathKey ? [{ id: pathKey }] : await apiService.fetchManagedLearningPaths();
            if (paths.some(path => path.id === doc.key)) existing = await apiService.fetchManagedLearningPath(doc.key);
        } catch (apiError) {
            return setState({ errors: [getApiErrorMessage(apiError, 'No se pudo leer la ruta guardada.')] });
        }
        setState({ doc, existing, plan: planImport(existing, doc) });
    };

    const apply = async () => {
        setBusy(true);
        setMessage('');
        try {
            const key = await applyImport(apiService, state.existing ? state.doc.key : null, state.plan, deleteIds, setStep);
            setState(null);
            onDone?.(key);
        } catch (apiError) {
            const detail = getApiErrorMessage(apiError, 'No se pudo guardar el cambio.');
            setMessage(`Se detuvo en "${apiError.importStep ?? step}": ${detail}. Lo anterior ya quedó guardado; corrige el archivo e impórtalo otra vez para seguir.`);
        } finally {
            setBusy(false);
            setStep('');
        }
    };

    const toggle = (id) => setDeleteIds(current => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const plan = state?.plan;
    const total = plan ? plan.changes.length + deleteIds.size : 0;

    return (
        <>
            <label className={`${buttonClass} cursor-pointer bg-gray-200 hover:bg-gray-300`}>
                {pathKey ? 'Importar YAML' : 'Importar ruta desde YAML'}
                <input type="file" accept=".yml,.yaml" className="hidden" onChange={readFile} />
            </label>

            {state && (
                <section className="w-full basis-full rounded-lg border bg-white p-4 text-sm shadow-sm">
                    {state.errors ? (
                        <>
                            <h2 className="font-semibold text-red-700">El archivo tiene errores</h2>
                            <ul className="mt-2 list-disc pl-5 text-red-700">{state.errors.map(error => <li key={error}>{error}</li>)}</ul>
                        </>
                    ) : (
                        <>
                            <h2 className="font-semibold text-gray-900">
                                {state.existing ? `Cambios en "${state.doc.title}"` : `Ruta nueva: "${state.doc.title}"`}
                            </h2>
                            {plan.changes.length === 0 && plan.deletions.length === 0 && <p className="mt-2 text-gray-600">El archivo es igual a lo guardado. No hay nada que cambiar.</p>}
                            {plan.changes.length > 0 && (
                                <ul className="mt-2 max-h-64 list-disc overflow-y-auto pl-5">{plan.changes.map((change, i) => <li key={i}>{change.label}</li>)}</ul>
                            )}
                            {plan.deletions.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-medium text-gray-900">Están guardados pero no aparecen en el archivo. Marca los que quieras eliminar (se pierde su progreso):</p>
                                    {plan.deletions.map(item => (
                                        <label key={item.id} className="mt-1 flex items-center gap-2">
                                            <input type="checkbox" checked={deleteIds.has(item.id)} onChange={() => toggle(item.id)} />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {message && <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-red-800">{message}</p>}
                    {busy && <p className="mt-3 text-gray-600">Guardando: {step}</p>}
                    <div className="mt-3 flex gap-2">
                        {plan && total > 0 && (
                            <button type="button" disabled={busy} onClick={apply} className={`${buttonClass} bg-gray-900 text-white hover:bg-gray-800`}>
                                Aplicar {total} cambio(s)
                            </button>
                        )}
                        <button type="button" disabled={busy} onClick={() => setState(null)} className={`${buttonClass} bg-gray-200 hover:bg-gray-300`}>Cerrar</button>
                    </div>
                </section>
            )}
        </>
    );
}
