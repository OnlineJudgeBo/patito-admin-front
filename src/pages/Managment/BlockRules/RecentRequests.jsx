import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "../../../services/apiService";

// Latest requests from Traefik's access log, with a shortcut to block their IP or User-Agent.
export function RecentRequests({ onBlock }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState({ ip: "", text: "" });
    const [loading, setLoading] = useState(false);

    const load = async (e) => {
        e?.preventDefault();
        setLoading(true);
        try {
            setRequests(await apiService.fetchRecentRequests({ ...filter, limit: 300 }));
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const topIps = Object.entries(requests.reduce((count, r) => ({ ...count, [r.ip]: (count[r.ip] ?? 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold mb-2">Últimas peticiones</h2>
            <form onSubmit={load} className="flex flex-wrap gap-2 mb-3">
                <Input className="w-48" placeholder="IP (o su inicio)" value={filter.ip} onChange={e => setFilter({ ...filter, ip: e.target.value })} />
                <Input className="w-64" placeholder="Texto en URL, navegador u origen" value={filter.text} onChange={e => setFilter({ ...filter, text: e.target.value })} />
                <Button type="submit" disabled={loading}>{loading ? "Cargando..." : "Buscar"}</Button>
            </form>
            {topIps.length > 0 && (
                <p className="text-sm text-gray-600 mb-3">
                    IPs con más peticiones en esta lista:{" "}
                    {topIps.map(([ip, n]) => (
                        <button key={ip} type="button" className="mr-3 font-mono text-indigo-700 hover:underline" onClick={() => setFilter({ ...filter, ip })}>{ip} ({n})</button>
                    ))}
                </p>
            )}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse text-sm">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="p-2 font-semibold">Hora</th>
                            <th className="p-2 font-semibold">IP</th>
                            <th className="p-2 font-semibold">Petición</th>
                            <th className="p-2 font-semibold">Estado</th>
                            <th className="p-2 font-semibold">ms</th>
                            <th className="p-2 font-semibold">Navegador / origen</th>
                            <th className="p-2 font-semibold">Bloquear</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((r, i) => (
                            <tr key={i} className={r.blocked ? "bg-red-50" : ""}>
                                <td className="p-2 whitespace-nowrap text-gray-500">{new Date(r.time).toLocaleTimeString()}</td>
                                <td className="p-2 font-mono whitespace-nowrap">{r.ip}</td>
                                <td className="p-2 font-mono break-all">{r.method} {r.url}</td>
                                <td className="p-2">{r.blocked ? <span className="text-red-600 font-semibold">bloqueada</span> : r.status}</td>
                                <td className={`p-2 ${r.durationMs > 3000 ? "text-red-600 font-semibold" : "text-gray-500"}`}>{Math.round(r.durationMs)}</td>
                                <td className="p-2 text-gray-500 break-all max-w-md">{r.userAgent}{r.referer && <div className="text-xs">desde {r.referer}</div>}</td>
                                <td className="p-2 whitespace-nowrap space-x-1">
                                    <Button size="sm" variant="outline" onClick={() => onBlock("ip", r.ip)}>IP</Button>
                                    {r.userAgent && <Button size="sm" variant="outline" onClick={() => onBlock("text", r.userAgent)}>Navegador</Button>}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && !loading && (
                            <tr><td colSpan={7} className="p-4 text-gray-500 text-center">No hay peticiones (el registro de Traefik solo existe en producción).</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
