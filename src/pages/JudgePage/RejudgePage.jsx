import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from 'react';
import { apiService } from "../../services/apiService";

const initialForms = {
    solutionId: '',
    problemId: '',
    contestId: '',
    fromSolutionId: '',
    toSolutionId: '',
    languageId: '',
};

function RejudgePage() {
    const { toast } = useToast();
    const [forms, setForms] = useState(initialForms);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [submitting, setSubmitting] = useState(null);

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await apiService.get('judge/rejudge/history?limit=50');
            setHistory(data.items || []);
        } catch (err) {
            toast({ variant: "destructive", title: "Error al cargar el historial", description: err.toString() });
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleChange = (field) => (event) => {
        setForms((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const runRejudge = async (scope, endpoint) => {
        setSubmitting(scope);
        try {
            const data = await apiService.get(endpoint);
            toast({
                variant: "success",
                title: "Rejudge enviado",
                description: `${data.matched} solución(es) marcadas para reevaluar (${data.scope}).`,
            });
            await loadHistory();
        } catch (err) {
            toast({ variant: "destructive", title: "Error al reevaluar", description: err.toString() });
        } finally {
            setSubmitting(null);
        }
    };

    const handleBySolution = (event) => {
        event.preventDefault();
        if (!forms.solutionId) return;
        runRejudge('solution', `judge/rejudge/solution/${forms.solutionId}`);
    };

    const handleByProblem = (event) => {
        event.preventDefault();
        if (!forms.problemId) return;
        runRejudge('problem', `judge/rejudge/problem/${forms.problemId}`);
    };

    const handleByContest = (event) => {
        event.preventDefault();
        if (!forms.contestId) return;
        runRejudge('contest', `judge/rejudge/contest/${forms.contestId}`);
    };

    const handleByRange = (event) => {
        event.preventDefault();
        if (!forms.fromSolutionId || !forms.toSolutionId) return;
        runRejudge('range', `judge/rejudge/range?fromSolutionId=${forms.fromSolutionId}&toSolutionId=${forms.toSolutionId}`);
    };

    const handleByLanguage = (event) => {
        event.preventDefault();
        if (!forms.languageId) return;
        runRejudge('language', `judge/rejudge/language/${forms.languageId}`);
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-2xl font-bold mb-4">Rejudge</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <form onSubmit={handleBySolution} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Por solución (ID)</label>
                    <input type="number" min="1" value={forms.solutionId} onChange={handleChange('solutionId')}
                        className="w-full border rounded px-3 py-2" />
                    <button type="submit" disabled={submitting === 'solution'}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 disabled:opacity-50">
                        {submitting === 'solution' ? 'Enviando...' : 'Reevaluar'}
                    </button>
                </form>

                <form onSubmit={handleByProblem} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Por problema (ID)</label>
                    <input type="number" min="1" value={forms.problemId} onChange={handleChange('problemId')}
                        className="w-full border rounded px-3 py-2" />
                    <button type="submit" disabled={submitting === 'problem'}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 disabled:opacity-50">
                        {submitting === 'problem' ? 'Enviando...' : 'Reevaluar'}
                    </button>
                </form>

                <form onSubmit={handleByContest} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Por concurso (ID)</label>
                    <input type="number" min="1" value={forms.contestId} onChange={handleChange('contestId')}
                        className="w-full border rounded px-3 py-2" />
                    <button type="submit" disabled={submitting === 'contest'}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 disabled:opacity-50">
                        {submitting === 'contest' ? 'Enviando...' : 'Reevaluar'}
                    </button>
                </form>

                <form onSubmit={handleByRange} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Por rango de soluciones</label>
                    <div className="flex gap-2">
                        <input type="number" min="1" placeholder="Desde" value={forms.fromSolutionId} onChange={handleChange('fromSolutionId')}
                            className="w-full border rounded px-3 py-2" />
                        <input type="number" min="1" placeholder="Hasta" value={forms.toSolutionId} onChange={handleChange('toSolutionId')}
                            className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit" disabled={submitting === 'range'}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 disabled:opacity-50">
                        {submitting === 'range' ? 'Enviando...' : 'Reevaluar'}
                    </button>
                </form>

                <form onSubmit={handleByLanguage} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Por lenguaje (ID)</label>
                    <input type="number" min="1" value={forms.languageId} onChange={handleChange('languageId')}
                        className="w-full border rounded px-3 py-2" />
                    <button type="submit" disabled={submitting === 'language'}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 disabled:opacity-50">
                        {submitting === 'language' ? 'Enviando...' : 'Reevaluar'}
                    </button>
                </form>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Historial reciente</h2>
                    <button type="button" onClick={loadHistory} className="text-sm text-blue-600 hover:underline">
                        Actualizar
                    </button>
                </div>
                {loadingHistory ? (
                    <div className="p-4 text-sm text-gray-500">Cargando historial...</div>
                ) : history.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">Sin reevaluaciones recientes.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                                <th className="px-4 py-2">Solución</th>
                                <th className="px-4 py-2">Problema</th>
                                <th className="px-4 py-2">Concurso</th>
                                <th className="px-4 py-2">Usuario</th>
                                <th className="px-4 py-2">Lenguaje</th>
                                <th className="px-4 py-2">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map((item) => (
                                <tr key={item.solutionId}>
                                    <td className="px-4 py-2">{item.solutionId}</td>
                                    <td className="px-4 py-2">{item.problemId}</td>
                                    <td className="px-4 py-2">{item.contestId ?? '-'}</td>
                                    <td className="px-4 py-2">{item.userId}</td>
                                    <td className="px-4 py-2">{item.languageId}</td>
                                    <td className="px-4 py-2">{new Date(item.createdAtUtc).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default RejudgePage;
