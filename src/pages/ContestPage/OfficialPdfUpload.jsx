/* eslint-disable react/prop-types */
import { useState } from 'react';
import { apiService } from '../../services/apiService';

// Uploads the PDF with every statement of an official contest, stored under the contest name.
export default function OfficialPdfUpload({ title }) {
    const [file, setFile] = useState(null);
    const [state, setState] = useState({ uploading: false, url: null, error: null });
    const name = (title ?? '').trim();

    const upload = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        setState({ uploading: true, url: null, error: null });
        try {
            const data = await apiService.postFile('FileManager/cloud-storage/official-contest', formData);
            setState({ uploading: false, url: data.url, error: null });
        } catch (err) {
            setState({ uploading: false, url: null, error: err?.response?.data?.message ?? 'No se pudo subir el PDF.' });
        }
    };

    return (
        <div className="mb-4 rounded border border-gray-200 p-3">
            <label htmlFor="officialPdf" className="block text-sm font-medium text-gray-700">PDF con todos los enunciados</label>
            <input id="officialPdf" type="file" accept="application/pdf" className="mt-1 block w-full text-sm"
                onChange={(event) => { setFile(event.target.files[0] ?? null); setState({ uploading: false, url: null, error: null }); }} />
            <p className="mt-1 text-xs text-gray-500">
                Se guarda como <span className="font-mono">officialContests/{name || 'título del concurso'}.pdf</span>. Si ya existe uno con ese nombre, se reemplaza.
            </p>
            <button type="button" onClick={upload} disabled={!file || !name || state.uploading}
                className="mt-2 rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {state.uploading ? 'Subiendo…' : 'Subir PDF'}
            </button>
            {state.url && (
                <p className="mt-2 break-all text-xs text-green-700">
                    Subido: <a className="underline" href={state.url} target="_blank" rel="noreferrer">{state.url}</a>
                </p>
            )}
            {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
        </div>
    );
}
