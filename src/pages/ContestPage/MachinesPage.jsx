/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';

// Lab machines of an exam, through the Patito API (which forwards to the control-server).
// Same panel as the control-server's own UI, without team credentials.

const REFRESH_MS = 10000;
const OFFLINE_SECS = 120;

// Hidden like in the ICPC panel: the ISO client still misbehaves with them.
const ACTIONS = [
    ['unlock', 'Desbloquear'],
    ['logout', 'Cerrar sesión'],
    ['message', 'Mensaje…'],
    ['set-allowlist', 'Allowlist…'],
    ['net-lock', 'Red: bloquear'],
    ['net-open', 'Red: abrir'],
    ['set-wallpaper', 'Wallpaper…'],
    ['screenshot', 'Captura'],
    ['usb-block', 'USB off'],
    ['usb-unblock', 'USB on'],
    ['collect-home', 'Recoger código'],
    ['reset-home', 'Limpiar home'],
    ['reboot', 'Reiniciar'],
    ['poweroff', 'Apagar'],
];
const DANGEROUS = new Set(['logout', 'net-open', 'usb-unblock', 'reset-home', 'reboot', 'poweroff']);

const FILTERS = [
    ['', 'todas'],
    ['usb', 'con USB'],
    ['locked', 'bloqueadas'],
    ['alert', 'con alerta'],
    ['unbound', 'sin alumno'],
    ['offline', 'offline'],
];

const HEALTH_BORDER = {
    ok: 'border-l-green-600',
    warn: 'border-l-amber-500',
    bad: 'border-l-red-600',
    off: 'border-l-gray-400 opacity-60',
};

const health = (m) => {
    if (m.seconds_since_seen == null || m.seconds_since_seen > OFFLINE_SECS) return 'off';
    if (m.open_alerts) return 'bad';
    if ((m.mem != null && m.mem > 92) || (m.hd != null && m.hd > 95)) return 'warn';
    return 'ok';
};

const age = (seconds) => seconds == null ? 'nunca' : seconds < 90 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;

const apiError = (error) => error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message ?? 'Error';

// Downloads fail with the JSON error inside a Blob.
const blobError = async (error) => {
    try {
        const body = JSON.parse(await error?.response?.data?.text());
        return body.message ?? body.error ?? apiError(error);
    } catch {
        return apiError(error);
    }
};

const saveBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
};

function Chip({ children, tone = 'bg-gray-100 text-gray-800' }) {
    return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${tone}`}>{children}</span>;
}

function MachineCard({ machine, selected, duplicate, onOpen, onToggle }) {
    const state = health(machine);
    const binding = machine.binding;
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={(event) => (event.shiftKey ? onToggle() : onOpen())}
            onContextMenu={(event) => { event.preventDefault(); onToggle(); }}
            onKeyDown={(event) => event.key === 'Enter' && onOpen()}
            className={`cursor-pointer rounded-lg border border-l-4 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow ${HEALTH_BORDER[state]} ${selected ? 'ring-2 ring-blue-500' : ''} ${duplicate ? 'border-l-8 border-l-red-600' : ''}`}
        >
            <div className="text-sm font-bold">{binding ? binding.name : (machine.location || machine.machine_id)}</div>
            <div className="text-xs text-gray-500">
                {binding && <><b>{binding.user_id}</b>{binding.seat ? ` · asiento ${binding.seat}` : ''} · </>}
                {machine.machine_id}
            </div>
            <div className="text-xs text-gray-500">
                {machine.location ? `📍 ${machine.location}` : '📍 sin ubicación'} · {machine.hostname || ''} · visto {age(machine.seconds_since_seen)}
            </div>
            <div className="text-xs text-gray-500">
                editores: {machine.editors && Object.keys(machine.editors).length
                    ? Object.entries(machine.editors).map(([name, count]) => `${name} ×${count}`).join(' · ')
                    : 'ninguno'}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
                {duplicate && <Chip tone="bg-red-600 text-white">⧉ posible sesión duplicada</Chip>}
                {binding && state === 'off' && <Chip tone="bg-gray-500 text-white">⏻ sesión expirada</Chip>}
                {!!machine.lock_state && <Chip>🔒</Chip>}
                {!!machine.frozen && <Chip>✋ NO TOCAR</Chip>}
                {machine.usb === 'allowed' && <Chip>USB</Chip>}
                {machine.virt && machine.virt !== 'none' && <Chip>VM:{machine.virt}</Chip>}
                {machine.open_alerts > 0 && <Chip tone="bg-red-100 text-red-800">⚠ {machine.open_alerts}</Chip>}
                {machine.mem != null && <Chip>mem {machine.mem}%</Chip>}
            </div>
        </div>
    );
}

// Cards grouped by public IP: machines of one lab share its NAT address.
function MachineGrid({ machines, byIp, selected, userCount, onOpen, onToggle, collapsed, setCollapsed }) {
    if (machines.length === 0) return <p className="text-sm text-gray-400">ninguna</p>;
    const grid = 'grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(215px,1fr))]';
    const card = (machine) => (
        <MachineCard
            key={machine.machine_id}
            machine={machine}
            selected={selected.has(machine.machine_id)}
            duplicate={!!machine.binding && userCount.get(machine.binding.user_id) > 1}
            onOpen={() => onOpen(machine)}
            onToggle={() => onToggle(machine.machine_id)}
        />
    );
    if (!byIp) return <div className={grid}>{machines.map(card)}</div>;

    const byAddress = new Map();
    machines.forEach(machine => {
        const ip = machine.ip || 'sin IP';
        byAddress.set(ip, [...(byAddress.get(ip) ?? []), machine]);
    });
    return (
        <div className="space-y-2">
            {[...byAddress.entries()].map(([ip, list]) => {
                const students = list.filter(machine => machine.binding).length;
                return (
                    <details
                        key={ip}
                        open={!collapsed.has(ip)}
                        onToggle={(event) => {
                            const open = event.currentTarget.open;
                            setCollapsed(current => {
                                const next = new Set(current);
                                if (open) next.delete(ip); else next.add(ip);
                                return next;
                            });
                        }}
                        className="rounded-lg border bg-gray-50 p-2"
                    >
                        <summary className="cursor-pointer text-sm font-semibold">
                            📡 {ip} · {list.length} PC · {students} con alumno
                        </summary>
                        <div className={`${grid} mt-2`}>{list.map(card)}</div>
                    </details>
                );
            })}
        </div>
    );
}

function MachineDetail({ contestId, base, machine, onClose, onChanged, sendCommand }) {
    const [detail, setDetail] = useState(null);
    const [shot, setShot] = useState(null);
    const [shots, setShots] = useState([]);
    const [error, setError] = useState(null);
    const path = `${base}/machines/${encodeURIComponent(machine.group_id)}/${encodeURIComponent(machine.machine_id)}`;
    const urls = useRef([]);

    const blobUrl = useCallback(async (endpoint) => {
        const url = URL.createObjectURL(await apiService.getBlob(endpoint));
        urls.current.push(url);
        return url;
    }, []);

    const load = useCallback(async () => {
        try {
            const data = await apiService.get(path);
            setDetail(data);
            if (data.screenshot_age != null) setShot(await blobUrl(`${path}/screenshot?t=${Date.now()}`));
            const { shots: list = [] } = await apiService.get(`${path}/shots`);
            setShots(await Promise.all(list.slice(0, 12).map(async ts => ({ ts, url: await blobUrl(`${path}/shots/${ts}`) }))));
        } catch (err) {
            setError(apiError(err));
        }
    }, [path, blobUrl]);

    useEffect(() => {
        load();
        const created = urls.current;
        return () => created.forEach(url => URL.revokeObjectURL(url));
    }, [load]);

    const act = async (action) => {
        const done = await sendCommand(action, [{ machine_id: machine.machine_id }], 1);
        if (!done) return;
        if (action === 'screenshot') {
            setTimeout(load, 5000);
            return;
        }
        onChanged();
    };

    const put = async (endpoint, body) => {
        try {
            await apiService.put(`${path}/${endpoint}`, body);
            onChanged();
            load();
        } catch (err) {
            alert(`error: ${apiError(err)}`);
        }
    };

    const status = detail?.status ?? {};
    const binding = detail?.binding;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-bold">
                        {binding ? binding.name : (detail?.location || machine.machine_id)}
                        <span className="ml-2 text-sm font-normal text-gray-500">{machine.machine_id}</span>
                    </h3>
                    <button type="button" onClick={onClose} className="rounded border px-2 py-1 text-sm">cerrar</button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {!detail ? <p className="text-sm text-gray-500">Cargando…</p> : (
                    <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap gap-1">
                            {[['unlock', '🔓 desbloquear'], ['logout', '🚪 cerrar sesión'], ['message', 'mensaje'], ['screenshot', '📷 captura'],
                                ['collect-home', '📦 recoger código'], ['reboot', 'reiniciar']].map(([action, label]) => (
                                <button key={action} type="button" onClick={() => act(action)} className="rounded border px-2 py-1 hover:bg-gray-100">{label}</button>
                            ))}
                            <button type="button" className="rounded border px-2 py-1 hover:bg-gray-100" onClick={() => {
                                const userId = prompt('Usuario de Patito del alumno (vacío = quitar la asignación):', binding?.user_id ?? '');
                                if (userId != null) put('binding', { user_id: userId.trim() });
                            }}>asignar alumno…</button>
                            <button type="button" className="rounded border px-2 py-1 hover:bg-gray-100" onClick={() => {
                                const location = prompt('Ubicación física (ej: Sala 3, PC 12). Vacío = borrar:', detail.location || '');
                                if (location != null) put('location', { location: location.trim() });
                            }}>📍 ubicación…</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                            depuración:
                            <button type="button" onClick={() => act('unlock-root')} className="rounded border px-2 py-0.5">🔑 habilitar root</button>
                            <button type="button" onClick={() => act('lock-root')} className="rounded border px-2 py-0.5">🔒 bloquear root</button>
                        </div>
                        <p className="text-gray-600">ubicación: {detail.location ? <b>{detail.location}</b> : <i>sin definir</i>}</p>
                        <p className="text-gray-600">
                            estado hace {detail.status_age ?? '—'}s · mem {status.mem ?? '?'}% · load {status.ld ?? '?'} · disco {status.hd ?? '?'}%
                            · virt {status.virt ?? '?'} · usb {status.usb ?? '?'} · bloqueo {detail.lock_state ? 'sí' : 'no'} · no tocar {detail.frozen ? 'sí' : 'no'}
                        </p>
                        <p className="text-gray-600">
                            código recogido: {detail.home_age == null ? 'todavía no' : (
                                <>hace {age(detail.home_age)} · {detail.home_size != null ? `${(detail.home_size / 1048576).toFixed(1)} MB` : '?'} · <button
                                    type="button"
                                    className="text-blue-600 underline"
                                    onClick={async () => {
                                        try {
                                            saveBlob(await apiService.getBlob(`${path}/home`), `${binding?.user_id || machine.machine_id}.tar.gz`);
                                        } catch (err) {
                                            alert(`error: ${await blobError(err)}`);
                                        }
                                    }}
                                >descargar .tar.gz</button></>
                            )}
                        </p>
                        <p className="text-gray-600">
                            alumno: {binding ? `${binding.name} (${binding.user_id})${binding.seat ? ` · asiento ${binding.seat}` : ''}` : 'sin alumno asignado'}
                        </p>
                        {shot ? <img src={shot} alt="Captura de pantalla" className="max-w-full rounded border" /> : <p className="text-gray-500">sin captura</p>}
                        {shots.length > 0 && (
                            <div className="flex gap-1 overflow-x-auto">
                                {shots.map(({ ts, url }) => (
                                    <img key={ts} src={url} alt={new Date(+ts).toLocaleTimeString()} title={new Date(+ts).toLocaleTimeString()}
                                        className="h-14 cursor-pointer rounded border" onClick={() => setShot(url)} />
                                ))}
                            </div>
                        )}
                        <h4 className="pt-2 text-xs font-semibold uppercase text-gray-500">Tiempo por programa</h4>
                        <p className="text-gray-600">
                            {Object.entries(detail.app_usage || {}).sort((a, b) => b[1] - a[1])
                                .map(([app, seconds]) => `${app} ${Math.floor(seconds / 3600)}h${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}m`)
                                .join(' · ') || '—'}
                        </p>
                        <DetailTable title="Historial de programas" headers={['programa', 'inicio', 'fin', 'duración']} rows={(detail.app_history || []).map(item => {
                            const time = value => new Date(value * 1000).toLocaleTimeString();
                            const seconds = Math.max(item.last_at - item.started_at, 0);
                            return [item.app, time(item.started_at), item.open ? 'en curso' : time(item.last_at), `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, '0')}s`];
                        })} />
                        <DetailTable title="Alertas" headers={['cuándo', 'tipo', 'detalle', 'descartada']} rows={(detail.alerts || []).map(alert =>
                            [alert.raised_at, alert.kind, alert.detail || '', `${alert.dismissed_by || ''} ${alert.dismissed_at || ''}`])} />
                        <DetailTable title="Comandos" headers={['cuándo', 'acción', 'en esta máquina', 'detalle']} rows={(detail.commands || []).map(command =>
                            [command.issued_at, command.action,
                                command.ack_status ? command.ack_status.toUpperCase() : command.acked_at ? 'acked' : command.delivered_at ? 'entregado' : command.status,
                                command.detail || ''])} />
                        <h4 className="pt-2 text-xs font-semibold uppercase text-gray-500">Journal</h4>
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded border bg-gray-50 p-2 text-xs">{detail.journal || '—'}</pre>
                    </div>
                )}
                <p className="mt-2 text-xs text-gray-400">Concurso {contestId}</p>
            </div>
        </div>
    );
}

function DetailTable({ title, headers, rows }) {
    return (
        <>
            <h4 className="pt-2 text-xs font-semibold uppercase text-gray-500">{title}</h4>
            <table className="w-full border-collapse text-xs">
                <thead><tr>{headers.map(header => <th key={header} className="border bg-gray-100 px-2 py-1 text-left">{header}</th>)}</tr></thead>
                <tbody>
                    {rows.length === 0
                        ? <tr><td colSpan={headers.length} className="border px-2 py-1 text-gray-400">—</td></tr>
                        : rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border px-2 py-1">{cell}</td>)}</tr>)}
                </tbody>
            </table>
        </>
    );
}

// Persistent allowlist, Firefox homepage and background logo of this exam's group.
function GroupSettings({ base, groupId, onChanged }) {
    const [allowlist, setAllowlist] = useState('');
    const [allowMeta, setAllowMeta] = useState('');
    const [homepage, setHomepage] = useState('');
    const [homepageMeta, setHomepageMeta] = useState('');
    const [logo, setLogo] = useState('');
    const [logoMeta, setLogoMeta] = useState('');

    const load = useCallback(async () => {
        const group = `?group=${encodeURIComponent(groupId)}`;
        await Promise.all([
            apiService.get(`${base}/allowlist${group}`).then(data => {
                setAllowlist((data.hosts || []).join('\n'));
                setAllowMeta(data.updated_at ? `guardada ${data.updated_at}` : 'sin guardar aún');
            }).catch(err => setAllowMeta(apiError(err))),
            apiService.get(`${base}/homepage${group}`).then(data => {
                setHomepage(data.updated_at ? data.url : '');
                setHomepageMeta(data.updated_at ? `guardada ${data.updated_at}` : 'sin configurar: se abre el concurso en Patito');
            }).catch(err => setHomepageMeta(apiError(err))),
            apiService.get(`${base}/logo${group}`).then(data => {
                setLogo(data.url || '');
                setLogoMeta(data.inherited ? `heredando ${data.effective_url}` : data.updated_at ? `guardado ${data.updated_at}` : 'sin configurar');
            }).catch(err => setLogoMeta(apiError(err))),
        ]);
    }, [base, groupId]);

    useEffect(() => { load(); }, [load]);

    const save = async (endpoint, body, done) => {
        try {
            await apiService.put(`${base}/${endpoint}`, { group_id: groupId, ...body });
            done();
            onChanged();
            load();
        } catch (err) {
            alert(`error: ${apiError(err)}`);
        }
    };

    const box = 'rounded-xl border bg-white p-3 shadow-sm';
    return (
        <div className="space-y-3">
            <details className={box}>
                <summary className="cursor-pointer font-semibold">Allowlist de red del examen (persistente)</summary>
                <p className="mt-1 text-xs text-gray-500">
                    Un dominio o IP por línea. Se guarda y se vuelve a aplicar a cada PC al reconectar o reiniciar. Incluye el dominio de Patito o los alumnos pierden el juez.
                </p>
                <textarea rows={6} value={allowlist} onChange={(event) => setAllowlist(event.target.value)}
                    className="mt-1 w-full rounded border p-2 font-mono text-xs" placeholder={'juez.example.com\ncppreference.com'} />
                <div className="flex items-center gap-2">
                    <button type="button" className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                        onClick={() => save('allowlist', { hosts: allowlist.split('\n').map(host => host.trim()).filter(Boolean) }, () => setAllowMeta('aplicada ✓'))}>
                        Guardar y aplicar
                    </button>
                    <span className="text-xs text-gray-500">{allowMeta}</span>
                </div>
            </details>
            <details className={box}>
                <summary className="cursor-pointer font-semibold">Página de inicio de Firefox</summary>
                <p className="mt-1 text-xs text-gray-500">Se entrega en el próximo login. Vacía = abre el concurso en Patito. Si es externa, agrega su dominio a la allowlist.</p>
                <div className="mt-1 flex items-center gap-2">
                    <input type="url" value={homepage} onChange={(event) => setHomepage(event.target.value)} className="flex-1 rounded border p-1 text-sm" placeholder="https://juez.example.com/oj/" />
                    <button type="button" className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => save('homepage', { url: homepage.trim() }, () => setHomepageMeta('guardada ✓'))}>Guardar</button>
                </div>
                <span className="text-xs text-gray-500">{homepageMeta}</span>
            </details>
            <details className={box}>
                <summary className="cursor-pointer font-semibold">Logo SVG del fondo</summary>
                <p className="mt-1 text-xs text-gray-500">Vacío = hereda el logo global. Agrega el host a la allowlist.</p>
                <div className="mt-1 flex items-center gap-2">
                    <input type="url" value={logo} onChange={(event) => setLogo(event.target.value)} className="flex-1 rounded border p-1 text-sm" placeholder="https://juez.example.com/logo.svg" />
                    <button type="button" className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => save('logo', { url: logo.trim() }, () => setLogoMeta('guardado ✓'))}>Guardar</button>
                </div>
                <span className="text-xs text-gray-500">{logoMeta}</span>
            </details>
        </div>
    );
}

export default function MachinesPage() {
    const { contestId } = useParams();
    const base = `contests/${contestId}/machines`;
    const [group, setGroup] = useState(null);
    const [machines, setMachines] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [commands, setCommands] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [filter, setFilter] = useState('');
    const [query, setQuery] = useState('');
    const [byIp, setByIp] = useState(true);
    const [collapsed, setCollapsed] = useState(new Set());
    const [open, setOpen] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const [machineData, alertData, commandData] = await Promise.all([
                apiService.get(`${base}/machines`),
                apiService.get(`${base}/alerts`),
                apiService.get(`${base}/commands?limit=40`),
            ]);
            setMachines(machineData.machines || []);
            setAlerts(alertData.alerts || []);
            setCommands(commandData.commands || []);
            setUpdatedAt(new Date());
            setError(null);
        } catch (err) {
            setError(apiError(err));
        }
    }, [base]);

    useEffect(() => {
        apiService.get(`${base}/group`).then(setGroup).catch(err => setError(apiError(err)));
        apiService.get(`contests/${contestId}/exam-monitor`)
            .then(data => setParticipants(data.participants || []))
            .catch(() => setParticipants([]));
        refresh();
        const timer = setInterval(refresh, REFRESH_MS);
        return () => clearInterval(timer);
    }, [base, contestId, refresh]);

    const visible = (machine) => {
        const text = `${machine.binding?.name ?? ''} ${machine.binding?.user_id ?? ''} ${machine.location ?? ''} ${machine.machine_id}`.toLowerCase();
        if (query && !text.includes(query.trim().toLowerCase())) return false;
        if (filter === 'usb') return machine.usb === 'allowed';
        if (filter === 'locked') return !!machine.lock_state;
        if (filter === 'alert') return !!machine.open_alerts;
        if (filter === 'unbound') return !machine.binding;
        if (filter === 'offline') return health(machine) === 'off';
        return true;
    };

    const sortKey = (machine) => `${byIp ? `${machine.ip || 'sin IP'} ` : ''}${machine.binding?.name ?? '￿'} ${machine.machine_id}`.toLowerCase();
    const list = machines.filter(visible).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const active = list.filter(machine => health(machine) !== 'off');
    const offline = list.filter(machine => health(machine) === 'off');
    const userCount = new Map();
    machines.forEach(machine => machine.binding && userCount.set(machine.binding.user_id, (userCount.get(machine.binding.user_id) ?? 0) + 1));

    const online = new Set(machines.filter(machine => health(machine) !== 'off' && machine.binding).map(machine => machine.binding.user_id));
    const missing = participants.filter(participant => !online.has(participant.userId));

    const toggle = (machineId) => setSelected(current => {
        const next = new Set(current);
        if (next.has(machineId)) next.delete(machineId); else next.add(machineId);
        return next;
    });

    // Returns true when every command was accepted.
    const sendCommand = async (action, targets, count) => {
        const args = {};
        if (action === 'message') { const text = prompt('Mensaje:'); if (!text) return false; args.text = text; }
        if (action === 'set-wallpaper') { const url = prompt('URL de la imagen (su host debe estar en la allowlist):'); if (!url) return false; args.url = url.trim(); }
        if (action === 'set-allowlist') {
            const hosts = prompt('Hosts permitidos, separados por coma (envío puntual; para que dure usa la allowlist persistente):', '');
            if (hosts == null) return false;
            args.hosts = hosts.split(',').map(host => host.trim()).filter(Boolean);
        }
        if (action === 'unlock-root') {
            const password = prompt('Contraseña de root (viaja en claro por el canal de control):');
            if (!password) return false;
            args.password = password;
        }
        if (count >= 20) {
            if (prompt(`Vas a mandar "${action}" a ${count} máquinas. Escribe ${count} para confirmar:`) !== String(count)) return false;
        } else if (DANGEROUS.has(action) || action === 'lock-root' || targets.some(target => target.group_id)) {
            if (!confirm(`¿Enviar "${action}" a ${count} máquina(s)?`)) return false;
        }
        try {
            for (const target of targets) {
                await apiService.post(`${base}/cmd`, { target, action, args });
            }
            refresh();
            return true;
        } catch (err) {
            alert(`error: ${apiError(err)}`);
            return false;
        }
    };

    const sendToSelection = (action) => {
        const picked = [...selected];
        if (picked.length) {
            sendCommand(action, picked.map(machineId => ({ machine_id: machineId })), picked.length);
        } else {
            sendCommand(action, [{ group_id: group.groupId, machine_id: '*' }], machines.length);
        }
    };

    const dismiss = async (alertId) => {
        try {
            await apiService.post(`${base}/alerts/${alertId}/dismiss`);
            refresh();
        } catch (err) {
            alert(`error: ${apiError(err)}`);
        }
    };

    const openReport = async () => {
        try {
            const blob = await apiService.getBlob(`${base}/report?group=${encodeURIComponent(group.groupId)}`);
            window.open(URL.createObjectURL(blob), '_blank');
        } catch (err) {
            alert(`error: ${await blobError(err)}`);
        }
    };

    const downloadHomes = async () => {
        try {
            saveBlob(await apiService.getBlob(`${base}/homes/${encodeURIComponent(group.groupId)}`), `${group.groupId}-codigo.zip`);
        } catch (err) {
            alert(`error: ${await blobError(err)}`);
        }
    };

    if (error && !group) {
        return <div className="p-4 text-red-600">{error}</div>;
    }
    if (!group) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    const section = 'mb-4 rounded-xl border bg-white p-3 shadow-sm';
    const label = 'mb-2 text-xs font-bold uppercase tracking-wide text-gray-500';
    return (
        <div className="container mx-auto w-full min-w-full p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <h1 className="mr-2 text-2xl font-bold">Máquinas: {group.label}</h1>
                <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded border p-1 text-sm">
                    {FILTERS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                </select>
                <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input type="checkbox" checked={byIp} onChange={() => setByIp(value => !value)} /> agrupar por IP
                </label>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="buscar alumno o PC…" className="rounded border p-1 text-sm" />
                <button type="button" onClick={openReport} className="text-sm font-semibold text-blue-600">reporte</button>
                <a href={`/admin/contests/${contestId}/monitor`} className="text-sm font-semibold text-blue-600">monitoreo de IPs</a>
                <span className="ml-auto text-xs text-gray-500">
                    {machines.length} máquinas · {selected.size} marcadas · {updatedAt ? updatedAt.toLocaleTimeString() : '—'} (cada 10 s)
                </span>
            </div>
            {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

            {alerts.length > 0 && (
                <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-2 text-sm">
                    ⚠ {alerts.length} alerta(s):{' '}
                    {alerts.slice(0, 6).map(alert => (
                        <span key={alert.id} className="mr-2">
                            {alert.machine_id} {alert.kind}{alert.detail ? ` (${alert.detail})` : ''}
                            <button type="button" onClick={() => dismiss(alert.id)} className="ml-1 rounded border bg-white px-1 text-xs">descartar</button>
                        </span>
                    ))}
                </div>
            )}

            <div className={section}>
                <div className={label}>Acciones · a las máquinas marcadas o a todo el examen</div>
                <div className="flex flex-wrap gap-1">
                    {ACTIONS.map(([action, text]) => (
                        <button key={action} type="button" onClick={() => sendToSelection(action)}
                            className={`rounded border px-2 py-1 text-sm hover:bg-gray-100 ${DANGEROUS.has(action) ? 'border-red-300 text-red-700' : ''}`}>
                            {text}
                        </button>
                    ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <button type="button" onClick={downloadHomes} className="text-blue-600 underline">descargar código del examen (zip)</button>
                    <span className="text-xs text-gray-500">primero usa &quot;Recoger código&quot;; cada .tar.gz lleva el usuario del alumno</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <button type="button" onClick={() => setSelected(new Set(list.map(machine => machine.machine_id)))} className="rounded border px-2 py-1">marcar todas (filtro)</button>
                    <button type="button" onClick={() => setSelected(new Set())} className="rounded border px-2 py-1">desmarcar</button>
                    <span className="text-xs text-gray-500">shift-clic o clic derecho marca una máquina</span>
                </div>
            </div>

            <div className={section}>
                <div className={label}>Asistencia · alumnos inscritos con una PC conectada</div>
                {participants.length === 0 ? <p className="text-sm text-gray-500">—</p> : (
                    <details>
                        <summary className="cursor-pointer text-sm">
                            <b>{participants.length - missing.length}/{participants.length}</b> alumnos
                            {missing.length === 0 ? ' ✅ completo' : <> · faltan <b>{missing.length}</b></>}
                        </summary>
                        <div className="mt-1 flex flex-wrap gap-1">
                            {missing.map(participant => <Chip key={participant.userId}>{participant.nick || participant.userId} ({participant.userId})</Chip>)}
                        </div>
                    </details>
                )}
            </div>

            <div className={section}>
                <div className={label}>Máquinas activas ({active.length})</div>
                <MachineGrid machines={active} byIp={byIp} selected={selected} userCount={userCount} onOpen={setOpen} onToggle={toggle} collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className={`${label} mt-4`}>Máquinas apagadas o desconectadas ({offline.length})</div>
                <MachineGrid machines={offline} byIp={byIp} selected={selected} userCount={userCount} onOpen={setOpen} onToggle={toggle} collapsed={collapsed} setCollapsed={setCollapsed} />
                <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap rounded border bg-gray-50 p-2 text-xs">
                    {commands.map(command =>
                        `${command.issued_at}  ${command.action.padEnd(13)} ${(command.machine_id === '*' ? 'todo el examen' : command.machine_id).padEnd(22)} ${command.delivered}/${command.acked}  [${command.status}]`
                    ).join('\n') || '—'}
                </pre>
            </div>

            <GroupSettings base={base} groupId={group.groupId} onChanged={refresh} />

            {open && (
                <MachineDetail contestId={contestId} base={base} machine={open} onClose={() => setOpen(null)}
                    onChanged={() => { setOpen(null); refresh(); }} sendCommand={sendCommand} />
            )}
        </div>
    );
}
