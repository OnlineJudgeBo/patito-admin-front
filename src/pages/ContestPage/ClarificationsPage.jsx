/* eslint-disable react/prop-types */
import parse from 'html-react-parser';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ClassicEditor from '../../components/CKEditor/editor';
import { MathStatementEditor } from '../../components/Statement/MathStatementEditor';
import { apiService } from '../../services/apiService';
import './CKEditorStyle.css';

const REFRESH_MS = 15000;
const QUICK_ANSWERS = ['Lee el enunciado.', 'Sin comentarios.', 'Ya está en el enunciado.'];

const problemLabel = (num) => (num === null || num === undefined ? 'General' : `Problema ${String.fromCharCode(65 + num)}`);
const errorMessage = (err, fallback) => err?.response?.data?.message ?? fallback;

const EDITOR_CONFIG = {
    toolbar: {
        shouldNotGroupWhenFull: true,
        items: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList', '|', 'code', 'codeBlock', '|', 'MathType'],
    },
};

// Answers and announcements are HTML, like the contest description.
function RichText({ value, onChange }) {
    return (
        <MathStatementEditor
            editor={ClassicEditor}
            data={value}
            config={EDITOR_CONFIG}
            onChange={(event, editor) => onChange(editor.getData())}
        />
    );
}

function AnswerForm({ contestId, item, onSaved }) {
    const [answer, setAnswer] = useState(item.answer ?? '');
    const [isPublic, setIsPublic] = useState(item.isPublic);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(!item.answer);

    if (!editing) {
        return (
            <div className="mt-2">
                <div className="rounded bg-green-50 p-3 text-sm">{parse(item.answer)}</div>
                <button type="button" onClick={() => setEditing(true)} className="mt-2 text-sm text-blue-600 hover:text-blue-900">
                    Editar respuesta
                </button>
            </div>
        );
    }

    const save = (event) => {
        event.preventDefault();
        apiService.update(`contests/${contestId}/clarifications`, `${item.id}/answer`, { answer, isPublic })
            .then(() => { setError(null); setEditing(false); onSaved(); })
            .catch(err => setError(errorMessage(err, 'No se pudo guardar la respuesta.')));
    };

    return (
        <form onSubmit={save} className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
                {QUICK_ANSWERS.map(text => (
                    <button key={text} type="button" onClick={() => setAnswer(`<p>${text}</p>`)}
                        className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300">{text}</button>
                ))}
            </div>
            <RichText value={answer} onChange={setAnswer} />
            <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                    Responder a todos (no se muestra quién preguntó)
                </label>
                <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700">
                    {item.answer ? 'Actualizar respuesta' : 'Responder'}
                </button>
                {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
        </form>
    );
}

export default function ClarificationsPage() {
    const { contestId } = useParams();
    const [items, setItems] = useState(null);
    const [problems, setProblems] = useState([]);
    const [error, setError] = useState(null);
    const [announcement, setAnnouncement] = useState('');
    const [announcementProblem, setAnnouncementProblem] = useState('');
    const [announcementKey, setAnnouncementKey] = useState(0);

    const load = useCallback(() => {
        apiService.get(`contests/${contestId}/clarifications`)
            .then(data => { setItems(data); setError(null); })
            .catch(err => setError(errorMessage(err, 'No se pudieron cargar las aclaraciones.')));
    }, [contestId]);

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);

    useEffect(() => {
        apiService.get(`contests/${contestId}`)
            .then(contest => setProblems((contest.contestProblems ?? []).map(problem => problem.num).filter(num => num !== null)))
            .catch(() => setProblems([]));
    }, [contestId]);

    const announce = (event) => {
        event.preventDefault();
        apiService.post(`contests/${contestId}/clarifications/announcements`, {
            text: announcement,
            problemNum: announcementProblem === '' ? null : Number(announcementProblem),
        })
            .then(() => { setAnnouncement(''); setAnnouncementProblem(''); setAnnouncementKey(key => key + 1); load(); })
            .catch(err => setError(errorMessage(err, 'No se pudo publicar el anuncio.')));
    };

    if (!items) {
        return <div className="p-4 text-center">{error ?? 'Cargando...'}</div>;
    }

    const pending = items.filter(item => item.userId && !item.answer).length;

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="mb-4 text-2xl font-bold">Aclaraciones: concurso {contestId}</h1>
            {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

            <form onSubmit={announce} className="mb-6 rounded border border-gray-200 bg-white p-4">
                <h2 className="mb-1 font-semibold">Nuevo anuncio para todos</h2>
                <p className="mb-3 text-sm text-gray-500">Lo ven todos los participantes en la página del concurso. Ej.: «El problema C tenía un error en el ejemplo; ya se rejuzgó».</p>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sobre</label>
                <select value={announcementProblem} onChange={e => setAnnouncementProblem(e.target.value)}
                    className="mb-3 rounded border border-gray-300 p-2 text-sm">
                    <option value="">General</option>
                    {problems.map(num => <option key={num} value={num}>{problemLabel(num)}</option>)}
                </select>
                <label className="mb-1 block text-sm font-medium text-gray-700">Anuncio</label>
                <RichText key={announcementKey} value={announcement} onChange={setAnnouncement} />
                <button type="submit" disabled={!announcement.trim()}
                    className="mt-3 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    Publicar anuncio
                </button>
            </form>

            <p className="mb-3 text-sm text-gray-600">{pending} pendiente(s) · se actualiza cada 15 segundos.</p>
            {items.length === 0 && <p className="text-sm text-gray-500">Todavía no hay preguntas ni anuncios.</p>}
            <ul className="space-y-3">
                {items.map(item => (
                    <li key={item.id} className={`rounded border bg-white p-4 ${item.userId && !item.answer ? 'border-amber-400' : 'border-gray-200'}`}>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">{problemLabel(item.problemNum)}</span>
                            <span>{item.userId ? `Pregunta de ${item.userId}` : 'Anuncio'}</span>
                            <span>{item.createdAt?.replace('T', ' ').slice(0, 19)}</span>
                            {item.userId && !item.answer && <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">Pendiente</span>}
                            {item.answer && item.userId && <span>{item.isPublic ? 'Respondida a todos' : 'Respondida solo al usuario'} por {item.answeredBy}</span>}
                        </div>
                        {item.question && <p className="mt-2 whitespace-pre-wrap">{item.question}</p>}
                        {item.userId
                            ? <AnswerForm contestId={contestId} item={item} onSaved={load} />
                            : <div className="mt-2 rounded bg-blue-50 p-3 text-sm">{parse(item.answer ?? '')}</div>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
