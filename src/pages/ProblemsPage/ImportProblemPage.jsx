import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';

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
};

function ImportProblemPage() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    // One entry per file once imported: { name, problemId } or { name, error }.
    const [results, setResults] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState('');
    const format = FORMATS[useSearchParams()[0].get('format')];

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
        setResults([]);
        setError('');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
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

                const problem = format
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
            <h1 className="text-xl font-semibold mb-4">{format?.title ?? 'Importar problema'}</h1>

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
                    disabled={files.length === 0 || isImporting}
                >
                    {isImporting ? `Importando ${Math.min(results.length + 1, files.length)} de ${files.length}...` : 'Importar'}
                </button>
            </div>
        </div>
    );
}

export default ImportProblemPage;
