import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UseAuth from "../../../hooks/UseAuth";
import { apiService } from "../../../services/apiService";

const DEFAULT_COLOR = "#1e88e5";

// Name, logo, color and domains that the public site shows for this site (Juez Virtual reads them by domain).
function SitePage() {
    const { roles, isLoading } = UseAuth();
    const isAdmin = roles.some((role) => String(role).trim().toLowerCase() === "administrador");
    const [form, setForm] = useState(null);
    const [message, setMessage] = useState({ text: "", error: false });

    useEffect(() => {
        if (!isAdmin) return;
        apiService.fetchSite()
            .then((site) => setForm({ ...site, logoUrl: site.logoUrl ?? "", primaryColor: site.primaryColor ?? "", domains: (site.domains ?? []).join("\n") }))
            .catch(() => setMessage({ text: "No se pudo cargar el sitio.", error: true }));
    }, [isAdmin]);

    if (isLoading) return null;
    if (!isAdmin) return <Navigate to="/admin/contests" replace />;
    if (!form) return <p className="p-4 text-sm text-gray-600">{message.text || "Cargando…"}</p>;

    const save = async (e) => {
        e.preventDefault();
        setMessage({ text: "", error: false });
        try {
            const site = await apiService.updateSite({ ...form, domains: form.domains.split(/[\s,]+/).filter(Boolean) });
            setForm({ ...form, primaryColor: site.primaryColor ?? "", domains: site.domains.join("\n") });
            setMessage({ text: "Guardado. El sitio público lo muestra al recargar.", error: false });
        } catch (err) {
            setMessage({ text: err.response?.data?.message ?? "No se pudo guardar.", error: true });
        }
    };

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="w-full max-w-2xl p-4">
            <h1 className="text-2xl font-bold mb-2">Sitio</h1>
            <p className="text-sm text-gray-600 mb-4">Cómo se ve tu sitio público: nombre, logo, color y los dominios desde los que se abre.</p>
            <form onSubmit={save} className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium">Nombre</span>
                    <Input required maxLength={100} value={form.name} onChange={set("name")} />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Logo (URL de una imagen, opcional)</span>
                    <Input type="url" maxLength={500} placeholder="https://…/logo.png" value={form.logoUrl} onChange={set("logoUrl")} />
                </label>
                <div className="flex items-end gap-3">
                    <label className="block">
                        <span className="text-sm font-medium">Color principal</span>
                        <input type="color" className="block h-10 w-16 cursor-pointer rounded-md border" value={form.primaryColor || DEFAULT_COLOR} onChange={set("primaryColor")} />
                    </label>
                    {form.primaryColor && <Button type="button" variant="outline" onClick={() => setForm({ ...form, primaryColor: "" })}>Usar el color por defecto</Button>}
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                    {form.logoUrl
                        ? <img src={form.logoUrl} alt="" className="h-8 w-8 rounded object-contain" />
                        : <div className="h-8 w-8 rounded" style={{ background: form.primaryColor || DEFAULT_COLOR }} />}
                    <span className="font-semibold">{form.name}</span>
                    <span className="ml-auto rounded-md px-3 py-1 text-sm text-white" style={{ background: form.primaryColor || DEFAULT_COLOR }}>Botón</span>
                </div>
                <label className="block">
                    <span className="text-sm font-medium">Dominios (uno por línea)</span>
                    <textarea rows={3} className="block w-full rounded-md border px-3 py-2 font-mono text-sm" placeholder={"juez.colegio.edu.bo\nwww.juez.colegio.edu.bo"} value={form.domains} onChange={set("domains")} />
                </label>
                {message.text && <p className={`text-sm ${message.error ? "text-red-600" : "text-green-700"}`}>{message.text}</p>}
                <Button type="submit">Guardar</Button>
            </form>
        </div>
    );
}

export default SitePage;
