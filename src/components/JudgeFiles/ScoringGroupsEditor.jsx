/* eslint-disable react/prop-types, react-refresh/only-export-components */
const TYPES = [
    { value: 'min', label: 'Todo o nada', hint: 'Da sus puntos solo si pasa todos sus casos.' },
    { value: 'sum', label: 'Proporcional', hint: 'Reparte sus puntos entre los casos pasados.' },
    { value: 'mul', label: 'Parcial multiplicado', hint: 'Multiplica los puntajes parciales que da el checker.' },
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

// Test groups (subtasks): points per group and which tests belong to each. `groups` hold their
// patterns as the text typed, separated by commas; `tests` are the names of the existing tests.
export default function ScoringGroupsEditor({ groups, tests, onChange }) {
    const update = (index, field, value) =>
        onChange(groups.map((group, i) => (i === index ? { ...group, [field]: value } : group)));
    const members = (group) => tests.filter(test => patternsOf(group.tests).some(pattern => matches(pattern, test)));

    const total = groups.reduce((sum, group) => sum + (Number(group.points) || 0), 0);
    const unassigned = tests.filter(test => !groups.some(group => members(group).includes(test)));

    return (
        <div>
            {groups.length > 0 && (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                        <tr>
                            <th className="px-3 py-2">Subtarea</th>
                            <th className="px-3 py-2">Puntos</th>
                            <th className="px-3 py-2">Cómo se gana</th>
                            <th className="px-3 py-2">Casos de prueba</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {groups.map((group, index) => (
                            <tr key={index} className="align-top">
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
                                    <p className="mt-1 text-xs text-gray-500">{TYPES.find(type => type.value === group.type)?.hint}</p>
                                </td>
                                <td className="px-3 py-2">
                                    <input className="w-full rounded border border-gray-300 px-2 py-1 font-mono" aria-label="Casos del grupo"
                                        placeholder="1-*, extra" value={group.tests} onChange={event => update(index, 'tests', event.target.value)} />
                                    {members(group).length === 0
                                        ? <p className="mt-1 text-xs font-semibold text-red-600">Ningún caso coincide.</p>
                                        : <p className="mt-1 text-xs text-gray-500">{members(group).length} casos: <span className="font-mono">{members(group).join(', ')}</span></p>}
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

            {groups.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                    En casos de prueba van los nombres separados por comas. Un <span className="font-mono">*</span> vale por cualquier texto:{' '}
                    <span className="font-mono">1-*</span> toma 1-01, 1-02, etc.
                </p>
            )}
            {groups.length > 0 && (
                <p className="mt-3 text-sm">
                    Total: <strong>{total}</strong> puntos
                    {total !== 100 && <span className="text-amber-700"> (lo habitual es 100)</span>}
                </p>
            )}
            {groups.length > 0 && unassigned.length > 0 && (
                <p className="mt-1 text-sm text-amber-700">
                    Casos sin subtarea, no dan puntos: <span className="font-mono">{unassigned.join(', ')}</span>
                </p>
            )}

            <div className="mt-3 flex gap-3">
                <button type="button" className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                    onClick={() => onChange([...groups, { name: `Subtarea ${groups.length + 1}`, points: Math.max(100 - total, 10), type: 'min', tests: '' }])}>
                    Agregar subtarea
                </button>
            </div>
        </div>
    );
}
