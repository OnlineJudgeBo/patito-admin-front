import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "../../../services/apiService";

const REFRESH_MS = 4000;

const statusColor = (status) =>
    status >= 500 ? "text-red-400" : status >= 400 ? "text-amber-400" : status >= 300 ? "text-sky-400" : "text-emerald-400";

const methodColor = (method) => (method === "GET" ? "text-slate-400" : "text-violet-400");

// "BO" -> 🇧🇴 (regional indicator letters).
const flag = (code) => (code ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "");

const durationColor = (ms) => (ms > 3000 ? "text-red-400 font-bold" : ms > 1000 ? "text-amber-400" : "text-slate-500");

// Latest requests from Traefik's access log, refreshed live, with a shortcut to block their IP or User-Agent.
export function RecentRequests({ onBlock }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState({ ip: "", text: "" });
    const [live, setLive] = useState(true);
    const [loading, setLoading] = useState(false);
    const filterRef = useRef(filter);
    const busy = useRef(false);

    const load = async (next = filterRef.current) => {
        if (busy.current) return;
        busy.current = true;
        setLoading(true);
        try {
            setRequests(await apiService.fetchRecentRequests({ ...next, limit: 300 }));
        } catch {
            // keep the last list; the next refresh retries
        } finally {
            busy.current = false;
            setLoading(false);
        }
    };

    const applyFilter = (next) => {
        setFilter(next);
        filterRef.current = next;
        load(next);
    };

    useEffect(() => {
        load();
        if (!live) return undefined;
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") load();
        }, REFRESH_MS);
        return () => clearInterval(timer);
    }, [live]);

    const topIps = Object.entries(requests.reduce((count, r) => ({ ...count, [r.ip]: (count[r.ip] ?? 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return (
        <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <h2 className="text-xl font-bold mr-2">Últimas peticiones</h2>
                <form onSubmit={(e) => { e.preventDefault(); applyFilter(filter); }} className="flex flex-wrap gap-2">
                    <Input className="w-44" placeholder="IP (o su inicio)" value={filter.ip} onChange={e => setFilter({ ...filter, ip: e.target.value })} />
                    <Input className="w-64" placeholder="Texto en URL, navegador u origen" value={filter.text} onChange={e => setFilter({ ...filter, text: e.target.value })} />
                    <Button type="submit" variant="outline">Filtrar</Button>
                    {(filterRef.current.ip || filterRef.current.text) && (
                        <Button type="button" variant="outline" onClick={() => applyFilter({ ip: "", text: "" })}>Ver todo</Button>
                    )}
                </form>
                <button
                    type="button"
                    onClick={() => setLive(!live)}
                    className={`ml-auto flex items-center gap-2 rounded-md border px-3 h-10 text-sm ${live ? "border-emerald-500 text-emerald-600" : "border-gray-300 text-gray-500"}`}
                >
                    <span className={`h-2.5 w-2.5 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                    {live ? "En vivo" : "Pausado"}
                </button>
            </div>

            {topIps.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                    <span className="text-gray-500">IPs con más peticiones:</span>
                    {topIps.map(([ip, n]) => (
                        <button
                            key={ip}
                            type="button"
                            onClick={() => applyFilter({ ...filterRef.current, ip })}
                            className={`rounded-full border px-2.5 py-0.5 font-mono hover:border-indigo-500 ${filterRef.current.ip === ip ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-300"}`}
                        >
                            {ip} <span className="opacity-70">{n}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="rounded-lg bg-slate-950 text-slate-200 font-mono text-xs shadow-inner overflow-auto max-h-[70vh]">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-900 text-slate-400 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Hora</th>
                            <th className="px-3 py-2 font-medium">IP</th>
                            <th className="px-3 py-2 font-medium">País</th>
                            <th className="px-3 py-2 font-medium">Petición</th>
                            <th className="px-3 py-2 font-medium">Estado</th>
                            <th className="px-3 py-2 font-medium text-right">ms</th>
                            <th className="px-3 py-2 font-medium">Navegador / origen</th>
                            <th className="px-3 py-2 font-medium">Bloquear</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r, i) => (
                            <tr key={`${r.time}-${r.ip}-${i}`} className={`border-t border-slate-800 hover:bg-slate-900 ${r.blocked ? "bg-red-950/60" : ""}`}>
                                <td className="px-3 py-1.5 whitespace-nowrap text-slate-500">{new Date(r.time).toLocaleTimeString()}</td>
                                <td className="px-3 py-1.5 whitespace-nowrap">
                                    <button type="button" className="text-cyan-300 hover:underline" onClick={() => applyFilter({ ...filterRef.current, ip: r.ip })}>{r.ip}</button>
                                </td>
                                <td className="px-3 py-1.5 whitespace-nowrap" title={r.country ?? "desconocido"}>
                                    {r.country ? <>{flag(r.country)} <span className={r.country === "BO" ? "text-slate-500" : "text-orange-300"}>{r.country}</span></> : <span className="text-slate-600">—</span>}
                                </td>
                                <td className="px-3 py-1.5 break-all">
                                    <span className={`${methodColor(r.method)} mr-2`}>{r.method}</span>{r.url}
                                </td>
                                <td className="px-3 py-1.5 whitespace-nowrap">
                                    {r.blocked ? <span className="text-red-400 font-bold">BLOQUEADA</span> : <span className={statusColor(r.status)}>{r.status}</span>}
                                </td>
                                <td className={`px-3 py-1.5 text-right whitespace-nowrap ${durationColor(r.durationMs)}`}>{Math.round(r.durationMs)}</td>
                                <td className="px-3 py-1.5 text-slate-400 break-all max-w-lg">
                                    {r.userAgent}
                                    {r.referer && <div className="text-slate-500">← {r.referer}</div>}
                                </td>
                                <td className="px-3 py-1.5 whitespace-nowrap space-x-1">
                                    <button type="button" className="rounded border border-slate-700 px-2 py-0.5 hover:border-red-500 hover:text-red-400" onClick={() => onBlock("ip", r.ip)}>IP</button>
                                    {r.userAgent && (
                                        <button type="button" className="rounded border border-slate-700 px-2 py-0.5 hover:border-red-500 hover:text-red-400" onClick={() => onBlock("text", r.userAgent)}>Navegador</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && !loading && (
                            <tr><td colSpan={8} className="px-3 py-6 text-slate-500 text-center">No hay peticiones (el registro de Traefik solo existe en producción).</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
                Países: <a className="hover:underline" href="https://db-ip.com" target="_blank" rel="noreferrer">IP Geolocation by DB-IP</a>
            </p>
        </div>
    );
}
