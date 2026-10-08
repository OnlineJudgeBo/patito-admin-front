import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';

function ImportProblemPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState('');
    // 'package' is this judge's own (ICPC based) package; 'task' is an olympiad task (CMS or TPS) zipped.
    const [format, setFormat] = useState('package');

    const onDrop = useCallback((acceptedFiles) => {
        setFile(acceptedFiles[0] ?? null);
        setError('');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/zip': ['.zip'] },
    });

    const handleImport = async () => {
        if (!file) {
            return;
        }

        setIsImporting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);

            const problem = format === 'task'
                ? await apiService.postFile('problems/import-task', formData)
                : await apiService.importProblem(formData);
            navigate(`/admin/problems/edit/${problem.problemId}`);
        } catch (apiError) {
            setError(apiError?.response?.data?.message || apiError?.message || 'No se pudo importar el problema.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-xl font-semibold mb-4">Importar problema</h1>

            <div className="mb-4">
                <label htmlFor="import-format" className="mr-2 text-sm font-medium text-gray-700">Formato</label>
                <select id="import-format" className="rounded border border-gray-300 px-2 py-1 text-sm"
                    value={format} onChange={(event) => setFormat(event.target.value)}>
                    <option value="package">Paquete de problema (Patito / ICPC)</option>
                    <option value="task">Tarea de olimpiada (CMS o TPS)</option>
                </select>
                {format === 'task' && (
                    <p className="mt-1 text-xs text-gray-500">
                        Comprime la carpeta de la tarea: con <span className="font-mono">task.yaml</span> si es de CMS, o con{' '}
                        <span className="font-mono">problem.json</span> si es de TPS (después de ejecutar <span className="font-mono">tps gen</span>).
                        Se importan los casos, las subtareas con sus puntos y el checker. Revisa el enunciado después de importar.
                    </p>
                )}
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded p-8 text-center cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                {file ? (
                    <p>Archivo seleccionado: {file.name}</p>
                ) : (
                    <p>{format === 'task' ? 'Arrastra el .zip de la tarea aquí' : 'Arrastra el .zip del paquete de problema aquí'}</p>
                )}
            </div>

            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

            <div className="mt-4">
                <button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                    onClick={handleImport}
                    disabled={!file || isImporting}
                >
                    {isImporting ? 'Importando...' : 'Importar'}
                </button>
            </div>
        </div>
    );
}

export default ImportProblemPage;
