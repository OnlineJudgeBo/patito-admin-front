import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navigate, useNavigate } from 'react-router-dom';
import UseAuth from '../../hooks/UseAuth';
import { apiService } from '../../services/apiService';

export default function ImportContestPage() {
    const navigate = useNavigate();
    const { roles, isLoading } = UseAuth();
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const isAdmin = roles.some((role) => String(role).trim().toLowerCase() === 'administrador');
    const onDrop = useCallback((files) => {
        setFile(files[0] ?? null);
        setError('');
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/zip': ['.zip'] },
    });

    if (isLoading) return <div className="p-4 text-center">Cargando...</div>;
    if (!isAdmin) return <Navigate to="/admin/contests" replace />;

    const importContest = async () => {
        if (!file) return;
        setImporting(true);
        setError('');
        try {
            const form = new FormData();
            form.append('file', file);
            const contest = await apiService.importContest(form);
            navigate(`/admin/contests/edit/${contest.contestId}`);
        } catch (apiError) {
            setError(apiError?.response?.data?.message || apiError?.message || 'No se pudo importar el concurso.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="container mx-auto w-full p-4">
            <h1 className="mb-2 text-xl font-semibold">Importar concurso</h1>
            <p className="mb-4 text-sm text-gray-600">Crea un concurso nuevo y copia todos sus problemas; no copia participantes ni IPs del laboratorio.</p>
            <div {...getRootProps()} className={`cursor-pointer rounded border-2 border-dashed p-8 text-center ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
                <input {...getInputProps()} />
                <p>{file ? `Archivo seleccionado: ${file.name}` : 'Arrastra aquí el ZIP exportado del concurso'}</p>
            </div>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            <button type="button" disabled={!file || importing} onClick={importContest}
                className="mt-4 rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {importing ? 'Importando…' : 'Importar concurso'}
            </button>
        </div>
    );
}
