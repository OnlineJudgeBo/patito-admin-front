/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ScoringGroupsEditor from './ScoringGroupsEditor';

// The type is not stored: a problem is scored by points when it has subtasks.
const KINDS = [
    { value: 'icpc', title: 'ICPC (todo o nada)', hint: 'Aceptado solo si pasa todos los casos.' },
    { value: 'ioi', title: 'IOI (por puntos)', hint: 'Los casos se agrupan en subtareas y cada una da puntos.' },
];

const CORRECTIONS = [
    { value: 'compare', title: 'Comparar con la respuesta', hint: 'La salida debe ser igual al archivo .out.' },
    { value: 'checker', title: 'Juez especial (varias respuestas válidas)', hint: 'Un checker revisa la salida.' },
];

const CHECKER_EXAMPLES = {
    testlib: `#include "testlib.h"

// Recibe: entrada, salida del participante, respuesta
int main(int argc, char *argv[]) {
    registerTestlibCmd(argc, argv);
    long esperado = ans.readLong();
    long recibido = ouf.readLong();
    if (recibido == esperado) quitf(_ok, "correcto");
    // quitp da puntaje parcial, de 0 a 1
    if (recibido == esperado + 1) quitp(0.5, "casi");
    quitf(_wa, "esperaba %ld", esperado);
}`,
    cms: `#include <fstream>
#include <iostream>

// Recibe: entrada, respuesta, salida del participante
int main(int argc, char *argv[]) {
    std::ifstream respuesta(argv[2]), salida(argv[3]);
    long esperado, recibido;
    respuesta >> esperado;
    if (!(salida >> recibido)) { std::cout << 0 << std::endl; return 0; }
    // Imprime el puntaje: 1 correcto, 0 incorrecto o una fracción
    std::cout << (recibido == esperado ? 1.0 : 0.0) << std::endl;
}`,
};

const SOLVING = [
    { value: 'program', title: 'Programa completo', hint: 'Lee la entrada y escribe la salida.' },
    { value: 'function', title: 'Función con grader', hint: 'Solo implementa una función. Se acepta en los lenguajes que tengan grader.' },
];

// One grader per language the problem accepts; the judge looks for these file names.
const GRADERS = [
    {
        key: 'cpp', name: 'C++', file: 'grader.cpp', label: 'Grader de C++ (.cpp)', accept: '.cpp,.cc',
        example: `// suma.h: cabecera pública, la incluye la solución
long suma(long a, long b);

// grader.cpp: tiene el main y no se muestra
#include <iostream>
#include "suma.h"
int main() {
    long a, b;
    std::cin >> a >> b;
    std::cout << suma(a, b) << std::endl;
}

// Lo que envía el participante
#include "suma.h"
long suma(long a, long b) { return a + b; }`,
    },
    {
        key: 'java', name: 'Java', file: 'grader.java', label: 'Grader de Java (.java)', accept: '.java',
        example: `// grader.java: la clase se llama grader y tiene el main
import java.util.Scanner;
public class grader {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.println(Main.suma(in.nextLong(), in.nextLong()));
    }
}

// Lo que envía el participante: la clase Main con el método estático
public class Main {
    public static long suma(long a, long b) { return a + b; }
}`,
    },
    {
        key: 'py', name: 'Python', file: 'grader.py', label: 'Grader de Python (.py)', accept: '.py',
        example: `# grader.py: importa la función desde Main
from Main import suma
a, b = map(int, input().split())
print(suma(a, b))

# Lo que envía el participante
def suma(a, b):
    return a + b`,
    },
];

export const emptyJudgeFiles = {
    kind: 'icpc',
    tests: [],
    checkerKind: 'testlib',
    checker: null,
    function: false,
    graders: {},
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
    ...(value.function ? GRADERS.filter(grader => value.graders[grader.key]).map(grader => [grader.file, value.graders[grader.key]]) : []),
    ...(value.function && value.graders.cpp ? value.headers.map(file => [file.name, file]) : []),
];

// Subtasks only count for a problem scored by points.
export const judgeGroups = (value) => (value.kind === 'ioi' ? value.groups : []);

// What stops the problem from being judged as configured; empty when it can be saved.
export const judgeFilesProblems = (value, specialJudge) => {
    const tests = pairedTests(value.tests);
    const complete = tests.filter(test => test.input && test.output).map(test => test.name);
    const incomplete = tests.filter(test => !test.input || !test.output).map(test => test.name);
    const groups = judgeGroups(value);
    return [
        value.kind === 'ioi' && groups.length === 0 && 'Un problema por puntos necesita al menos una subtarea.',
        incomplete.length > 0 && `Casos sin su par .in / .out: ${incomplete.join(', ')}.`,
        specialJudge && !value.checker && 'El juez especial necesita el código del checker.',
        value.function && !GRADERS.some(grader => value.graders[grader.key]) && 'Un problema de función necesita el grader de al menos un lenguaje.',
        groups.length > 0 && complete.length === 0 && 'Las subtareas necesitan casos de prueba.',
        groups.some(group => !(Number(group.points) > 0)) && 'Cada subtarea necesita puntos mayores que 0.',
        groups.some(group => !group.tests.trim()) && 'Cada subtarea necesita indicar sus casos.',
    ].filter(Boolean);
};

const Field = ({ title, children }) => (
    <div className="rounded-lg mt-5 first:mt-0">
        <span className="block text-xl font-semibold mb-2">{title}</span>
        {children}
    </div>
);

// Radio buttons in a row, with the hint of the chosen one underneath.
const Choice = ({ name, label, options, selected, onSelect }) => (
    <div role="radiogroup" aria-label={label}>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
            {options.map(option => (
                <label key={option.value} className="inline-flex items-center gap-2">
                    <input type="radio" name={name} value={option.value}
                        checked={selected === option.value} onChange={() => onSelect(option.value)} />
                    {option.title}
                </label>
            ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">{options.find(option => option.value === selected)?.hint}</p>
    </div>
);

// Sample code next to the fields it explains. With several tabs, one per language.
const Examples = ({ title, tabs }) => {
    const [selected, setSelected] = useState(tabs[0].key);
    const shown = tabs.find(tab => tab.key === selected) ?? tabs[0];
    return (
        <div className="rounded border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 text-sm">
                <span className="font-medium">{title}</span>
                <span className="flex gap-3">
                    {tabs.length > 1 && tabs.map(tab => (
                        <button key={tab.key} type="button" onClick={() => setSelected(tab.key)}
                            className={tab.key === shown.key ? 'font-semibold underline' : 'text-blue-600'}>{tab.label}</button>
                    ))}
                </span>
            </div>
            <pre className="overflow-x-auto bg-gray-50 p-3 font-mono text-xs leading-5">{shown.code}</pre>
        </div>
    );
};

const FilePick = ({ id, label, accept, onPick, multiple = false }) => (
    <div className="mt-3">
        <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
        <input id={id} type="file" accept={accept} multiple={multiple} className="text-sm"
            onChange={event => onPick(multiple ? Array.from(event.target.files) : event.target.files[0] ?? null)} />
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

    const accepted = GRADERS.filter(grader => value.graders[grader.key]).map(grader => grader.name);

    return (
        <div className="mb-6">
            <fieldset className="p-4 mb-6 bg-white rounded-lg shadow-lg">
                <legend className="text-2xl font-bold mb-4">Evaluación</legend>
                <div className="mx-10">
                    <Field title="Tipo de problema">
                        <Choice name="problem-kind" label="Tipo de problema" options={KINDS}
                            selected={value.kind} onSelect={kind => set({ kind })} />
                    </Field>

                    <Field title="Casos de prueba">
                        <div {...getRootProps()} className={`flex justify-center items-center p-6 border-2 border-dashed cursor-pointer ${isDragActive ? 'border-indigo-500' : 'border-gray-400'}`}>
                            <input {...getInputProps()} aria-label="Casos de prueba" />
                            <p>Arrastra los archivos .in y .out aquí o haz clic para seleccionar</p>
                        </div>
                        {tests.length > 0 && (
                            <p className="mt-2 text-sm text-gray-700">
                                {complete.length} casos: <span className="font-mono">{complete.join(', ')}</span>
                                <button type="button" className="ml-3 text-red-600 hover:text-red-900" onClick={() => set({ tests: [] })}>Quitar todos</button>
                            </p>
                        )}
                    </Field>

                    {value.kind === 'ioi' && (
                        <Field title="Subtareas">
                            <ScoringGroupsEditor groups={value.groups} tests={complete} onChange={groups => set({ groups })} />
                        </Field>
                    )}

                    <Field title="Corrección">
                        <Choice name="problem-correction" label="Corrección" options={CORRECTIONS}
                            selected={specialJudge ? 'checker' : 'compare'} onSelect={choice => onSpecialJudgeChange(choice === 'checker')} />
                        {specialJudge && (
                            <div className="mt-3 grid gap-6 lg:grid-cols-2">
                                <div>
                                    <label htmlFor="problem-checker-kind" className="block text-sm font-medium mb-1">Tipo de checker</label>
                                    <select id="problem-checker-kind" className="rounded border border-gray-300 px-2 py-1 text-sm"
                                        value={value.checkerKind} onChange={event => set({ checkerKind: event.target.value })}>
                                        <option value="testlib">testlib (Codeforces, Polygon)</option>
                                        <option value="cms">CMS o TPS (IOI)</option>
                                    </select>
                                    <FilePick id="problem-checker" label="Checker (.cpp)" accept=".cpp,.cc"
                                        onPick={file => set({ checker: file })} />
                                    {value.checkerKind === 'testlib' && (
                                        <p className="mt-3 text-sm">
                                            {/* The exact file the judge compiles checkers with (testlib 0.9.45). */}
                                            <a className="text-blue-600 hover:text-blue-900" target="_blank" rel="noreferrer"
                                                href="https://raw.githubusercontent.com/MikeMirzayanov/testlib/2d20123984e9479b8a56ebe0d6a51e23ad7c35b3/testlib.h">Descargar testlib.h</a>
                                            <span className="text-gray-500"> (versión 0.9.45, la del juez) para probar el checker en tu máquina.</span>
                                        </p>
                                    )}
                                    <p className="mt-3 text-xs text-gray-500">
                                        El checker siempre se escribe en C++, sin importar en qué lenguaje envíe el participante.
                                    </p>
                                </div>
                                <Examples key={value.checkerKind} title={value.checkerKind === 'cms' ? 'Ejemplo de checker CMS o TPS' : 'Ejemplo de checker testlib'}
                                    tabs={[{ key: value.checkerKind, code: CHECKER_EXAMPLES[value.checkerKind] }]} />
                            </div>
                        )}
                    </Field>

                    <Field title="Forma de resolver">
                        <Choice name="problem-solving" label="Forma de resolver" options={SOLVING}
                            selected={value.function ? 'function' : 'program'} onSelect={choice => set({ function: choice === 'function' })} />
                        {value.function && (
                            <div className="mt-3 grid gap-6 lg:grid-cols-2">
                                <div>
                                    {GRADERS.map(grader => (
                                        <div key={grader.key}>
                                            <FilePick id={`problem-grader-${grader.key}`} label={grader.label} accept={grader.accept}
                                                onPick={file => onChange(previous => ({ ...previous, graders: { ...previous.graders, [grader.key]: file } }))} />
                                            {grader.key === 'cpp' && (
                                                <FilePick id="problem-headers" label="Cabeceras de C++ (.h)" accept=".h" multiple
                                                    onPick={files => set({ headers: files })} />
                                            )}
                                        </div>
                                    ))}
                                    <p className="mt-3 text-sm">
                                        Lenguajes que aceptará el problema: <strong>{accepted.length > 0 ? accepted.join(', ') : 'ninguno todavía'}</strong>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Sube un grader por cada lenguaje que quieras permitir. En el enunciado indica el nombre y los parámetros de la función.
                                    </p>
                                    {specialJudge && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Con juez especial, el grader imprime el resultado y el checker lo revisa.
                                        </p>
                                    )}
                                </div>
                                <Examples title="Ejemplo: sumar dos números"
                                    tabs={GRADERS.map(grader => ({ key: grader.key, label: grader.name, code: grader.example }))} />
                            </div>
                        )}
                    </Field>

                    {problems.map(problem => <div key={problem} className="mt-3 text-red-500">{problem}</div>)}
                </div>
            </fieldset>
        </div>
    );
}
