/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { useDropzone } from 'react-dropzone';
import ScoringGroupsEditor from './ScoringGroupsEditor';

// The type is not stored: a problem is scored by points when it has subtasks.
const KINDS = [
    { value: 'icpc', title: 'ICPC — todo o nada', text: 'El envío es aceptado solo si pasa todos los casos. Se detiene en el primer fallo.' },
    { value: 'ioi', title: 'IOI — por puntos', text: 'Los casos se agrupan en subtareas con puntos. Se evalúan todos y el envío recibe un puntaje.' },
];

const CORRECTIONS = [
    { value: 'compare', title: 'Comparar con la respuesta', text: 'Hay una sola respuesta correcta: la salida debe ser igual al archivo .out.' },
    { value: 'checker', title: 'Juez especial (varias respuestas válidas)', text: 'Un programa (checker) revisa la salida y decide si es correcta. Puede dar puntaje parcial.' },
];

const CHECKERS = [
    { value: 'testlib', title: 'testlib', text: 'El de Codeforces y Polygon. Termina con ok, wa o un puntaje parcial.' },
    { value: 'cms', title: 'CMS / TPS', text: 'El de las tareas de la IOI. Imprime el puntaje del caso, de 0 a 1.' },
];

const CHECKER_EXAMPLES = {
    testlib: `#include "testlib.h"

// Se ejecuta como: checker <entrada> <salida del participante> <respuesta>
int main(int argc, char *argv[]) {
    registerTestlibCmd(argc, argv);
    long esperado = ans.readLong();
    long recibido = ouf.readLong();
    if (recibido == esperado) quitf(_ok, "correcto");
    if (recibido == esperado + 1) quitp(0.5, "casi");   // medio puntaje
    quitf(_wa, "esperaba %ld y llegó %ld", esperado, recibido);
}`,
    cms: `#include <fstream>
#include <iostream>

// Se ejecuta como: checker <entrada> <respuesta> <salida del participante>
int main(int argc, char *argv[]) {
    std::ifstream respuesta(argv[2]), salida(argv[3]);
    long esperado, recibido;
    respuesta >> esperado;
    if (!(salida >> recibido)) { std::cout << 0 << std::endl; return 0; }
    // Imprime el puntaje del caso: 1 correcto, 0 incorrecto, o una fracción.
    std::cout << (recibido == esperado ? 1.0 : 0.0) << std::endl;
}`,
};

const SOLVING = [
    { value: 'program', title: 'Programa completo', text: 'El participante lee la entrada y escribe la salida. Cualquier lenguaje.' },
    { value: 'function', title: 'Función (con grader)', text: 'El participante solo implementa una función; el grader del problema lee, la llama y escribe. Solo C++.' },
];

const FUNCTION_EXAMPLE = `// suma.h — cabecera pública, la incluye la solución
long suma(long a, long b);

// grader.cpp — del autor, tiene el main y no se muestra
#include <iostream>
#include "suma.h"
int main() {
    long a, b;
    std::cin >> a >> b;
    std::cout << suma(a, b) << std::endl;
}

// Lo que envía el participante
#include "suma.h"
long suma(long a, long b) { return a + b; }`;

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
        specialJudge && !value.checker && 'El juez especial necesita el código del checker.',
        value.function && !value.grader && 'Un problema de función necesita el grader.',
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

// Two or more options shown as cards, each with a line that says what it means.
const Choice = ({ name, label, options, selected, onSelect }) => (
    <div className="mt-2 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label={label}>
        {options.map(option => (
            <label key={option.value} className={`cursor-pointer rounded-lg border-2 p-3 ${selected === option.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name={name} className="mr-2" value={option.value}
                    checked={selected === option.value} onChange={() => onSelect(option.value)} />
                <span className="font-semibold">{option.title}</span>
                <p className="mt-1 text-sm text-gray-600">{option.text}</p>
            </label>
        ))}
    </div>
);

const Example = ({ title, code }) => (
    <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-indigo-700">{title}</summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-100">{code}</pre>
    </details>
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
                Cómo se juzga el problema. Los archivos se suben al guardar y después se pueden cambiar desde los archivos del problema.
            </p>

            <Block title="Tipo de problema">
                <Choice name="problem-kind" label="Tipo de problema" options={KINDS}
                    selected={value.kind} onSelect={kind => set({ kind })} />
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

            <Block title="Corrección" help="Cómo se decide si la salida de un caso es correcta.">
                <Choice name="problem-correction" label="Corrección" options={CORRECTIONS}
                    selected={specialJudge ? 'checker' : 'compare'} onSelect={choice => onSpecialJudgeChange(choice === 'checker')} />
                {specialJudge && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm font-medium">Tipo de checker</p>
                        <Choice name="problem-checker-kind" label="Tipo de checker" options={CHECKERS}
                            selected={value.checkerKind} onSelect={checkerKind => set({ checkerKind })} />
                        <Example title="Ver un ejemplo de este tipo de checker" code={CHECKER_EXAMPLES[value.checkerKind]} />
                        <FilePick id="problem-checker" label="Código del checker (.cpp)" accept=".cpp,.cc" file={value.checker}
                            onPick={file => set({ checker: file })} />
                        <FilePick id="problem-testlib" label="testlib.h propio (opcional; el juez ya trae la versión 0.9.45)" accept=".h" file={value.testlib}
                            onPick={file => set({ testlib: file })} />
                    </div>
                )}
            </Block>

            <Block title="Forma de resolver" help="Qué escribe el participante.">
                <Choice name="problem-solving" label="Forma de resolver" options={SOLVING}
                    selected={value.function ? 'function' : 'program'} onSelect={choice => set({ function: choice === 'function' })} />
                {value.function && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <Example title="Ver un ejemplo de grader, cabecera y solución" code={FUNCTION_EXAMPLE} />
                        <FilePick id="problem-grader" label="Grader (.cpp)" accept=".cpp,.cc" file={value.grader}
                            onPick={file => set({ grader: file })} />
                        <FilePick id="problem-headers" label="Cabeceras públicas (.h) que incluye la solución" accept=".h" multiple
                            onPick={files => set({ headers: files })} />
                        {value.headers.length > 0 && <p className="mt-1 text-sm text-gray-600 font-mono">{value.headers.map(file => file.name).join(', ')}</p>}
                        <p className="mt-2 text-sm text-gray-600">El enunciado debe indicar la firma de la función y el nombre de la cabecera.</p>
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
