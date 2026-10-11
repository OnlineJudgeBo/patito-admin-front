/* eslint-disable react/prop-types, react-refresh/only-export-components */
const TYPES = [
    { value: 'sum', label: 'Proporcional a los casos pasados' },
    { value: 'min', label: 'Todo o nada' },
    { value: 'mul', label: 'Producto' },
];

// Same glob the judge uses: *, ? and [set].
const matches = (pattern, test) => {
    const escaped = pattern.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    try {
        return new RegExp(`^${escaped}$`).test(test);
    } catch {
        return false;
    }
};

export const patternsOf = (text) => text.split(',').map(item => item.trim()).filter(Boolean);

// What the API takes: points as a number and the patterns as a list.
export const groupsForApi = (groups) =>
    groups.map(group => ({ ...group, points: Number(group.points), tests: patternsOf(group.tests) }));

// One all-or-nothing group per name prefix, the way olympiad tasks name their tests: s1_1, s1_2, s2_1...
const groupsByPrefix = (tests) => {
    const prefixes = [...new Set(tests.map(test => test.match(/^(.*\D)\d+$/)?.[1]).filter(Boolean))].sort();
    const points = Math.floor(100 / prefixes.length);
    return prefixes.map((prefix, index) => ({
        name: `Subtarea ${index + 1}`,
        points: index === prefixes.length - 1 ? 100 - points * (prefixes.length - 1) : points,
        type: 'min',
        tests: `${prefix}*`,
    }));
};

// Test groups (subtasks): points per group and which tests belong to each. `groups` hold their
// patterns as the text typed, separated by commas; `tests` are the names of the existing tests.
export default function ScoringGroupsEditor({ groups, tests, onChange }) {
    const update = (index, field, value) =>
        onChange(groups.map((group, i) => (i === index ? { ...group, [field]: value } : group)));
    const members = (group) => tests.filter(test => patternsOf(group.tests).some(pattern => matches(pattern, test)));

    const total = groups.reduce((sum, group) => sum + (Number(group.points) || 0), 0);
    const unassigned = tests.filter(test => !groups.some(group => members(group).includes(test)));
    const prefixed = tests.some(test => /\D\d+$/.test(test));

    return (
        <div>
            {groups.length > 0 && (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                        <tr>
                            <th className="px-3 py-2">Nombre</th>
                            <th className="px-3 py-2">Puntos</th>
                            <th className="px-3 py-2">Tipo</th>
                            <th className="px-3 py-2">Casos</th>
                            <th className="px-3 py-2">Coinciden</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {groups.map((group, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2">
                                    <input className="w-full rounded border border-gray-300 px-2 py-1" aria-label="Nombre del grupo"
                                        value={group.name ?? ''} onChange={event => update(index, 'name', event.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" min="1" className="w-24 rounded border border-gray-300 px-2 py-1" aria-label="Puntos"
                                        value={group.points} onChange={event => update(index, 'points', event.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <select className="rounded border border-gray-300 px-2 py-1" aria-label="Tipo de grupo"
                                        value={group.type} onChange={event => update(index, 'type', event.target.value)}>
                                        {TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <input className="w-full rounded border border-gray-300 px-2 py-1 font-mono" aria-label="Casos del grupo"
                                        placeholder="s1_*, extra" value={group.tests} onChange={event => update(index, 'tests', event.target.value)} />
                                </td>
                                <td className={`px-3 py-2 ${members(group).length === 0 ? 'font-semibold text-red-600' : ''}`}>
                                    {members(group).length}
                                </td>
                                <td className="px-3 py-2">
                                    <button type="button" className="text-red-600 hover:text-red-900"
                                        onClick={() => onChange(groups.filter((_, i) => i !== index))}>Quitar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <p className="mt-3 text-sm">
                {groups.length === 0
                    ? 'Sin subtareas: el problema se juzga como aceptado o rechazado.'
                    : <>Total: <strong>{total}</strong> puntos · {tests.length} casos de prueba</>}
            </p>
            {groups.length > 0 && unassigned.length > 0 && (
                <p className="mt-1 text-sm text-amber-700">
                    Casos sin grupo (no dan puntos): <span className="font-mono">{unassigned.join(', ')}</span>
                </p>
            )}

            <div className="mt-3 flex gap-3">
                <button type="button" className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                    onClick={() => onChange([...groups, { name: `Subtarea ${groups.length + 1}`, points: 10, type: 'sum', tests: '' }])}>
                    Agregar subtarea
                </button>
                {groups.length === 0 && prefixed && (
                    <button type="button" className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                        onClick={() => onChange(groupsByPrefix(tests))}>
                        Crear una por prefijo de los casos
                    </button>
                )}
            </div>
        </div>
    );
}
