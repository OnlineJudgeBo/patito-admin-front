import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { checkProblemZip, listZipEntries } from '../../utils/zipCheck';

// Each format has its own entry in the menu; without ?format= it is this judge's own (ICPC based) package.
const FORMATS = {
    cms: {
        title: 'Importar de CMS',
        help: <>Comprime la carpeta de la tarea, la que tiene <span className="font-mono">task.yaml</span>.</>,
    },
    tps: {
        title: 'Importar de TPS',
        help: (
            <>
                Sube el .zip de <span className="font-mono">tps export</span>, o comprime la carpeta de la tarea
                (la que tiene <span className="font-mono">problem.json</span>) después de ejecutar <span className="font-mono">tps gen</span>.
            </>
        ),
    },
    task: {
        title: 'Reimportar de CMS o TPS',
        help: <>Sube el .zip de la tarea (CMS o TPS) para reemplazar este problema.</>,
    },
};

function ImportProblemPage() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    // One entry per file once imported: { name, problemId } or { name, error }.
    const [results, setResults] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState('');
    // Problems found in each file before uploading: [{ name, problems }]; null while checking.
    const [checks, setChecks] = useState([]);
    const [searchParams] = useSearchParams();
    const formatKey = searchParams.get('format');
    const format = FORMATS[formatKey];
    // Reimport: the zip replaces the statement, limits, tests, checker and graders of this problem.
    const problemId = searchParams.get('problemId');

    const onDrop = useCallback(async (acceptedFiles) => {
        setFiles(acceptedFiles);
        setResults([]);
        setError('');
        setChecks(null);
        setChecks(await Promise.all(acceptedFiles.map(async (file) => {
            try {
                return { name: file.name, problems: checkProblemZip(await listZipEntries(file), formatKey) };
            } catch (zipError) {
                return { name: file.name, problems: [zipError.message] };
            }
        })));
    }, [formatKey]);
    const invalidFiles = (checks ?? []).filter((check) => check.problems.length > 0);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: !problemId,
        accept: { 'application/zip': ['.zip'] },
    });

    const handleImport = async () => {
        if (files.length === 0) {
            return;
        }

        setIsImporting(true);
        setError('');
        setResults([]);
        // One at a time: a file that fails does not stop the rest.
        const imported = [];
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const problem = problemId
                    ? await apiService.postFile(`problems/${problemId}/import-task`, formData)
                    : format
                    ? await apiService.postFile('problems/import-task', formData)
                    : await apiService.importProblem(formData);
                imported.push({ name: file.name, problemId: problem.problemId });
            } catch (apiError) {
                imported.push({ name: file.name, error: apiError?.response?.data?.message || apiError?.message || 'No se pudo importar el problema.' });
            }
            setResults([...imported]);
        }
        setIsImporting(false);

        if (imported.length === 1 && imported[0].problemId) {
            navigate(`/admin/problems/edit/${imported[0].problemId}`);
        } else if (imported.length === 1) {
            setError(imported[0].error);
            setResults([]);
        } else {
            setFiles([]);
        }
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-xl font-semibold mb-4">
                {problemId ? `Reimportar el problema ${problemId}` : format?.title ?? 'Importar problema'}
            </h1>

            {problemId && (
                <p className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Se reemplazan el enunciado, los límites, los casos de prueba, el checker y los graders de este problema.
                    Se mantienen su número, su visibilidad, sus temas y los envíos; para volver a evaluarlos usa Rejudge.
                </p>
            )}

            {format && (
                <p className="mb-4 text-sm text-gray-600">
                    {format.help} Se importan los casos, las subtareas con sus puntos, el checker, el grader y el enunciado.
                    Las imágenes del enunciado no se importan: agrégalas después desde el editor.
                </p>
            )}

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded p-8 text-center cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                {files.length > 0 ? (
                    <p>{files.length} archivo(s) seleccionado(s): {files.map((file) => file.name).join(', ')}</p>
                ) : (
                    <p>{format ? 'Arrastra uno o varios .zip de tareas aquí' : 'Arrastra uno o varios .zip de paquetes de problema aquí'}</p>
                )}
            </div>

            {invalidFiles.length > 0 && (
                <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-medium">Corrige estos archivos y vuelve a seleccionarlos; no se subió nada:</p>
                    <ul className="mt-1 space-y-1">
                        {invalidFiles.map((check) => (
                            <li key={check.name}><span className="font-mono">{check.name}</span>: {check.problems.join(' ')}</li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

            {results.length > 0 && (
                <ul className="mt-4 text-sm space-y-1">
                    {results.map((result) => (
                        <li key={result.name}>
                            <span className="font-mono">{result.name}</span>:{' '}
                            {result.problemId ? (
                                <Link className="text-indigo-600 underline" to={`/admin/problems/edit/${result.problemId}`}>
                                    importado como problema {result.problemId}
                                </Link>
                            ) : (
                                <span className="text-red-600">{result.error}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-4">
                <button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                    onClick={handleImport}
                    disabled={files.length === 0 || isImporting || checks === null || invalidFiles.length > 0}
                >
                    {checks === null ? 'Revisando...' : isImporting ? `Importando ${Math.min(results.length + 1, files.length)} de ${files.length}...` : 'Importar'}
                </button>
            </div>
        </div>
    );
}

export default ImportProblemPage;
