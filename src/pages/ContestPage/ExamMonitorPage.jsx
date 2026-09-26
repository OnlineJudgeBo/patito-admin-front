import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';

const REFRESH_MS = 30000;

const ALERT_LABELS = {
    OUTSIDE_LAB: 'Fuera del laboratorio',
    CONCURRENT_USE: 'Actividad simultánea probable',
    MULTIPLE_IPS: 'Varias IPs',
    SHARED_IP: 'IP compartida',
    IP_CAPTURE: 'IP del proxy',
};

const SEVERITY_STYLES = {
    high: 'border-red-300 bg-red-50 text-red-800',
    medium: 'border-amber-300 bg-amber-50 text-amber-800',
};

const formatTime = (value) => new Date(value).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function ExamMonitorPage() {
    const { contestId } = useParams();
    const [monitor, setMonitor] = useState(null);
    const [error, setError] = useState(null);
    const [onlyFlagged, setOnlyFlagged] = useState(false);

    const load = useCallback(() => {
        apiService.get(`contests/${contestId}/exam-monitor`)
            .then(data => { setMonitor(data); setError(null); })
            .catch(err => setError(err?.response?.data?.message ?? 'No se pudo cargar el monitoreo.'));
    }, [contestId]);

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);

    if (error && !monitor) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    if (!monitor) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    const participants = onlyFlagged
        ? monitor.participants.filter(participant => participant.alertCodes.length > 0)
        : monitor.participants;

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold">Monitoreo de examen: {monitor.title}</h1>
                    <p className="text-sm text-gray-500">
                        {monitor.startTime} → {monitor.endTime} · Actualizado {formatTime(monitor.generatedAt)} (cada 30 s)
                        {monitor.labIps.length > 0 && <> · Laboratorio: <span className="font-mono">{monitor.labIps.join(', ')}</span></>}
                    </p>
                </div>
                <button type="button" onClick={load} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Actualizar ahora</button>
            </div>

            {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

            <p className="mb-3 text-xs text-gray-500">
                La IP es un indicio, no una prueba: se marca actividad desde IP distintas con 5 minutos o menos de diferencia. Los datos móviles cambian de IP y un laboratorio comparte una sola IP pública.
            </p>

            <section className="mb-6 space-y-2">
                {monitor.alerts.length === 0
                    ? <div className="rounded border border-green-300 bg-green-50 p-3 text-green-800">Sin alertas.</div>
                    : monitor.alerts.map((alert, index) => (
                        <div key={index} className={`rounded border p-3 ${SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.medium}`}>
                            <span className="mr-2 font-semibold">{ALERT_LABELS[alert.code] ?? alert.code}</span>
                            {alert.message}
                            {alert.ips.length > 0 && <span className="ml-2 font-mono text-xs">[{alert.ips.join(', ')}]</span>}
                        </div>
                    ))}
            </section>

            <label className="mb-2 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={onlyFlagged} onChange={() => setOnlyFlagged(value => !value)} />
                Solo participantes con alertas
            </label>

            <table className="table-auto w-full border-collapse">
                <thead className="bg-gray-700 text-white">
                    <tr>
                        <th className="px-4 py-2 text-left">Usuario</th>
                        <th className="px-4 py-2 text-left">Alertas</th>
                        <th className="px-4 py-2 text-left">IP</th>
                        <th className="px-4 py-2">Logins</th>
                        <th className="px-4 py-2">Envíos</th>
                        <th className="px-4 py-2">Primera vez</th>
                        <th className="px-4 py-2">Última vez</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {participants.map(participant => {
                        const rows = participant.ips.length > 0 ? participant.ips : [null];
                        const flagged = participant.alertCodes.length > 0;
                        return rows.map((usage, index) => (
                            <tr key={`${participant.userId}-${usage?.ip ?? 'none'}`} className={`border-b ${flagged ? 'bg-red-50' : ''}`}>
                                {index === 0 && (
                                    <>
                                        <td rowSpan={rows.length} className="px-4 py-2 align-top text-sm">
                                            <div className="font-medium">{participant.userId}</div>
                                            {participant.nick !== participant.userId && <div className="text-xs text-gray-500">{participant.nick}</div>}
                                        </td>
                                        <td rowSpan={rows.length} className="px-4 py-2 align-top text-xs">
                                            {participant.alertCodes.map(code => (
                                                <span key={code} className="mr-1 mb-1 inline-block rounded bg-red-100 px-2 py-0.5 text-red-800">{ALERT_LABELS[code] ?? code}</span>
                                            ))}
                                        </td>
                                    </>
                                )}
                                {usage ? (
                                    <>
                                        <td className="px-4 py-2 font-mono text-sm">
                                            {usage.ip}
                                            {usage.isLab && <span className="ml-2 rounded bg-green-100 px-1 text-xs text-green-800">lab</span>}
                                        </td>
                                        <td className="px-4 py-2 text-center text-sm">{usage.logins}</td>
                                        <td className="px-4 py-2 text-center text-sm">{usage.submissions}</td>
                                        <td className="px-4 py-2 text-center text-sm">{formatTime(usage.firstSeen)}</td>
                                        <td className="px-4 py-2 text-center text-sm">{formatTime(usage.lastSeen)}</td>
                                    </>
                                ) : (
                                    <td colSpan={5} className="px-4 py-2 text-sm text-gray-400">Sin actividad todavía</td>
                                )}
                            </tr>
                        ));
                    })}
                </tbody>
            </table>
            {participants.length === 0 && <div className="my-4 text-center text-gray-500">No hay participantes para mostrar.</div>}
        </div>
    );
}
