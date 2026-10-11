/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { useDropzone } from 'react-dropzone';
import ScoringGroupsEditor from './ScoringGroupsEditor';

// The type is not stored: a problem is scored by points when it has subtasks.
const KINDS = [
    { value: 'icpc', title: 'ICPC — todo o nada', text: 'El envío es aceptado solo si pasa todos los casos. Se detiene en el primer fallo.' },
    { value: 'ioi', title: 'IOI — por puntos', text: 'Los casos se agrupan en subtareas con puntos. Se evalúan todos y el envío recibe un puntaje.' },
];

export const emptyJudgeFiles = {
    kind: 'icpc',
    tests: [],
    checkerKind: 'testlib',
    checker: null,
    testlib: null,
    function: false,
    grader: null,
    headers: [],
    groups: [],
};

const stem = (name) => name.replace(/\.(in|out)$/, '');

// Tests are pairs <name>.in + <name>.out; a file without its pair is not a test for the judge.
export const pairedTests = (files) => {
    const names = new Set(files.map(file => file.name));
    return [...new Set(files.map(file => stem(file.name)))]
        .map(name => ({ name, input: names.has(`${name}.in`), output: names.has(`${name}.out`) }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
};

// The files as the judge expects them in the folder of the problem: [name, file].
export const judgeUploads = (value, specialJudge) => [
    ...value.tests.map(file => [file.name, file]),
    ...(specialJudge && value.checker ? [[value.checkerKind === 'cms' ? 'checker_cms.cpp' : 'checker.cpp', value.checker]] : []),
    ...(specialJudge && value.checker && value.testlib ? [['testlib.h', value.testlib]] : []),
    ...(value.function && value.grader ? [['grader.cpp', value.grader], ...value.headers.map(file => [file.name, file])] : []),
];

// Subtasks only count for a problem scored by points.
export const judgeGroups = (value) => (value.kind === 'ioi' ? value.groups : []);

// What stops the problem from being judged as configured; empty when it can be saved.
export const judgeFilesProblems = (value, specialJudge) => {
    const tests = pairedTests(value.tests);
    const complete = tests.filter(test => test.input && test.output).map(test => test.name);
    const groups = judgeGroups(value);
    return [
        value.kind === 'ioi' && groups.length === 0 && 'Un problema por puntos necesita al menos una subtarea.',
        tests.some(test => !test.input || !test.output) && 'Hay casos de prueba sin su par .in / .out.',
        specialJudge && !value.checker && 'El juez especial está marcado y falta el checker.',
        value.function && !value.grader && 'El problema de función está marcado y falta el grader.',
        groups.length > 0 && complete.length === 0 && 'Las subtareas necesitan casos de prueba.',
        groups.some(group => !(Number(group.points) > 0)) && 'Cada subtarea necesita puntos mayores que 0.',
        groups.some(group => !group.tests.trim()) && 'Cada subtarea necesita indicar sus casos.',
    ].filter(Boolean);
};

const Block = ({ title, help, children }) => (
    <div className="border-t border-gray-200 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        {help && <p className="mb-3 mt-1 text-sm text-gray-600">{help}</p>}
        {children}
    </div>
);

const FilePick = ({ id, label, accept, file, onPick, multiple = false }) => (
    <div className="mt-2">
        <label htmlFor={id} className="block text-sm font-medium">{label}</label>
        <input id={id} type="file" accept={accept} multiple={multiple} className="mt-1 text-sm"
            onChange={event => onPick(multiple ? Array.from(event.target.files) : event.target.files[0] ?? null)} />
        {!multiple && file && <span className="ml-2 text-sm text-gray-600">{file.name}</span>}
    </div>
);

// Everything the judge needs besides the statement: type of problem, tests, subtasks, checker and grader.
// Nothing is uploaded here; the page uploads judgeUploads(value) once the problem exists.
export default function JudgeFilesSection({ value, onChange, specialJudge, onSpecialJudgeChange }) {
    // onChange is a state setter: updates build on the latest value, since the dropzone reports late.
    const set = (changes) => onChange(previous => ({ ...previous, ...changes }));
    const addTests = (files) => {
        const added = new Set(files.map(file => file.name));
        onChange(previous => ({ ...previous, tests: [...previous.tests.filter(file => !added.has(file.name)), ...files] }));
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => addTests(files.filter(file => /\.(in|out)$/.test(file.name))),
        multiple: true,
    });

    const tests = pairedTests(value.tests);
    const complete = tests.filter(test => test.input && test.output).map(test => test.name);
    const problems = judgeFilesProblems(value, specialJudge);

    return (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-1">Evaluación</h2>
            <p className="mb-4 text-sm text-gray-600">
                Todo es opcional y se sube al guardar. Después se puede cambiar desde los archivos del problema.
            </p>

            <Block title="Tipo de problema">
                <div className="mt-2 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Tipo de problema">
                    {KINDS.map(kind => (
                        <label key={kind.value} className={`cursor-pointer rounded-lg border-2 p-3 ${value.kind === kind.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                            <input type="radio" name="problem-kind" className="mr-2" value={kind.value}
                                checked={value.kind === kind.value} onChange={() => set({ kind: kind.value })} />
                            <span className="font-semibold">{kind.title}</span>
                            <p className="mt-1 text-sm text-gray-600">{kind.text}</p>
                        </label>
                    ))}
                </div>
            </Block>

            <Block title="Casos de prueba" help="Cada caso son dos archivos con el mismo nombre: la entrada .in y la respuesta .out.">
                <div {...getRootProps()} className={`flex justify-center items-center p-6 border-2 border-dashed cursor-pointer rounded ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-400'}`}>
                    <input {...getInputProps()} aria-label="Casos de prueba" />
                    <p className="text-sm">Arrastra los archivos .in y .out aquí, o haz clic para elegirlos</p>
                </div>
                {tests.length > 0 && (
                    <>
                        <p className="mt-3 text-sm">
                            <strong>{complete.length}</strong> caso(s) completo(s)
                            <button type="button" className="ml-3 text-red-600 hover:text-red-900" onClick={() => set({ tests: [] })}>Quitar todos</button>
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                            {tests.map(test => (
                                <li key={test.name} className={`rounded border px-2 py-1 font-mono ${test.input && test.output ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                                    {test.name}
                                    {!test.input && <span className="ml-1 text-red-700">falta .in</span>}
                                    {!test.output && <span className="ml-1 text-red-700">falta .out</span>}
                                    <button type="button" className="ml-2 text-red-600" aria-label={`Quitar ${test.name}`}
                                        onClick={() => onChange(previous => ({ ...previous, tests: previous.tests.filter(file => stem(file.name) !== test.name) }))}>×</button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Block>

            {value.kind === 'ioi' && (
                <Block title="Subtareas y puntaje"
                    help="Cada subtarea reparte sus puntos entre sus casos. Los casos de cada subtarea se eligen por nombre con comodines, separados por comas: s1_*, caso?.">
                    <ScoringGroupsEditor groups={value.groups} tests={complete} onChange={groups => set({ groups })} />
                </Block>
            )}

            <Block title="Corrección">
                <label htmlFor="problem-special-judge" className="inline-flex items-center gap-2 font-medium">
                    <input id="problem-special-judge" type="checkbox" checked={specialJudge}
                        onChange={event => onSpecialJudgeChange(event.target.checked)} />
                    Juez especial (varias respuestas válidas)
                </label>
                <p className="mt-1 text-sm text-gray-600">
                    Sin marcar, la salida se compara con la respuesta. Marcado, un programa (checker) decide si es correcta y puede dar puntaje parcial.
                </p>
                {specialJudge && (
                    <div className="mt-3 rounded bg-gray-50 p-3">
                        <label htmlFor="problem-checker-kind" className="block text-sm font-medium">Tipo de checker</label>
                        <select id="problem-checker-kind" className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
                            value={value.checkerKind} onChange={event => set({ checkerKind: event.target.value })}>
                            <option value="testlib">testlib (Codeforces, Polygon): checker entrada salida respuesta</option>
                            <option value="cms">CMS / TPS (IOI): checker entrada respuesta salida, imprime el puntaje</option>
                        </select>
                        <FilePick id="problem-checker" label="Código del checker (.cpp)" accept=".cpp,.cc" file={value.checker}
                            onPick={file => set({ checker: file })} />
                        <FilePick id="problem-testlib" label="testlib.h propio (opcional; el juez ya trae la versión 0.9.45)" accept=".h" file={value.testlib}
                            onPick={file => set({ testlib: file })} />
                    </div>
                )}
            </Block>

            <Block title="Forma de resolver">
                <label htmlFor="problem-function" className="inline-flex items-center gap-2 font-medium">
                    <input id="problem-function" type="checkbox" checked={value.function}
                        onChange={event => set({ function: event.target.checked })} />
                    Problema de función (con grader)
                </label>
                <p className="mt-1 text-sm text-gray-600">
                    Sin marcar, el participante envía un programa completo. Marcado, implementa una función y el grader tiene el main. Solo C++.
                </p>
                {value.function && (
                    <div className="mt-3 rounded bg-gray-50 p-3">
                        <FilePick id="problem-grader" label="Grader (.cpp)" accept=".cpp,.cc" file={value.grader}
                            onPick={file => set({ grader: file })} />
                        <FilePick id="problem-headers" label="Cabeceras públicas (.h) que incluye la solución" accept=".h" multiple
                            onPick={files => set({ headers: files })} />
                        {value.headers.length > 0 && <p className="mt-1 text-sm text-gray-600 font-mono">{value.headers.map(file => file.name).join(', ')}</p>}
                    </div>
                )}
            </Block>

            {problems.length > 0 && (
                <ul className="mt-4 list-disc pl-5 text-sm text-red-600">
                    {problems.map(problem => <li key={problem}>{problem}</li>)}
                </ul>
            )}
        </div>
    );
}
