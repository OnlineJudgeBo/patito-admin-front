import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "../../../services/apiService";

// IPs and texts rejected with an empty 403 by the API and the PHP web (applied within 30 s).
function BlockRulesPage() {
    const [rules, setRules] = useState([]);
    const [form, setForm] = useState({ type: "ip", value: "", note: "" });
    const [error, setError] = useState("");

    const load = () => apiService.fetchBlockRules().then(setRules).catch(() => setError("No se pudieron cargar las reglas."));
    useEffect(() => { load(); }, []);

    const add = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await apiService.addBlockRule(form);
            setForm({ ...form, value: "", note: "" });
            load();
        } catch (err) {
            setError(err.response?.data?.message ?? "No se pudo agregar la regla.");
        }
    };

    const remove = async (rule) => {
        if (!window.confirm(`¿Quitar el bloqueo de "${rule.value}"?`)) return;
        await apiService.deleteBlockRule(rule.id);
        load();
    };

    return (
        <div className="container mx-auto p-4 w-full">
            <h1 className="text-2xl font-bold mb-2">Bloqueos</h1>
            <p className="text-sm text-gray-600 mb-4">
                Una <b>IP</b> bloquea esa dirección o rango (por ejemplo <code>190.129.0.0/16</code>).
                Un <b>texto</b> bloquea las visitas cuyo navegador, página de origen o URL lo contengan (por ejemplo <code>GPTBot</code>).
                Cuidado: en la universidad muchos estudiantes comparten la misma IP.
            </p>
            <form onSubmit={add} className="flex flex-wrap gap-2 mb-2">
                <select className="border rounded-md px-3 h-10" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="ip">IP</option>
                    <option value="text">Texto</option>
                </select>
                <Input className="w-64" required maxLength={255} placeholder={form.type === "ip" ? "200.87.1.5" : "GPTBot"} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                <Input className="w-64" maxLength={255} placeholder="Nota (opcional)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                <Button type="submit">Bloquear</Button>
            </form>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <table className="table-auto w-full border-collapse mt-4">
                <thead className="bg-gray-700 text-white">
                    <tr>
                        <th className="p-3 px-8 font-semibold border-r border-gray-200">Tipo</th>
                        <th className="p-3 px-8 font-semibold border-r border-gray-200">Valor</th>
                        <th className="p-3 px-8 font-semibold border-r border-gray-200">Nota</th>
                        <th className="p-3 px-8 font-semibold border-r border-gray-200">Creado</th>
                        <th className="p-3 px-8 font-semibold">Quitar</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map(rule => (
                        <tr key={rule.id}>
                            <td className="px-8 py-4 text-sm text-gray-500 border-r border-gray-200">{rule.type === "ip" ? "IP" : "Texto"}</td>
                            <td className="px-8 py-4 text-sm text-gray-900 font-mono border-r border-gray-200">{rule.value}</td>
                            <td className="px-8 py-4 text-sm text-gray-500 border-r border-gray-200">{rule.note}</td>
                            <td className="px-8 py-4 text-sm text-gray-500 border-r border-gray-200">{rule.createdAt}</td>
                            <td className="px-8 py-4 text-sm"><Button variant="outline" onClick={() => remove(rule)}>Quitar</Button></td>
                        </tr>
                    ))}
                    {rules.length === 0 && (
                        <tr><td colSpan={5} className="px-8 py-4 text-sm text-gray-500 text-center">No hay bloqueos.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default BlockRulesPage;
