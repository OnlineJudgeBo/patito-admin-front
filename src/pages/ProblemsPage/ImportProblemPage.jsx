import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    const [file, setFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState('');
    const format = FORMATS[useSearchParams()[0].get('format')];

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

            const problem = format
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
                {file ? (
                    <p>Archivo seleccionado: {file.name}</p>
                ) : (
                    <p>{format ? 'Arrastra el .zip de la tarea aquí' : 'Arrastra el .zip del paquete de problema aquí'}</p>
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
