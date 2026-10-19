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

const errorMessage = (err, fallback) => err?.response?.data?.message ?? fallback;
const formatTime = (value) => value?.replace('T', ' ').slice(0, 16);
const isPending = (item) => item.userId && !item.answer;

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

function AnswerForm({ contestId, item, onSaved, onCancel }) {
    const [answer, setAnswer] = useState(item.answer ?? '');
    const [isPublic, setIsPublic] = useState(item.isPublic);
    const [error, setError] = useState(null);

    const save = (event) => {
        event.preventDefault();
        apiService.update(`contests/${contestId}/clarifications`, `${item.id}/answer`, { answer, isPublic })
            .then(() => { setError(null); onSaved(); })
            .catch(err => setError(errorMessage(err, 'No se pudo guardar la respuesta.')));
    };

    return (
        <form onSubmit={save} className="mt-3 space-y-2 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-500">Respuestas rápidas:</span>
                {QUICK_ANSWERS.map(text => (
                    <button key={text} type="button" onClick={() => setAnswer(`<p>${text}</p>`)}
                        className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300">{text}</button>
                ))}
            </div>
            <RichText value={answer} onChange={setAnswer} />
            <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                Responder a todos (todos ven la pregunta y la respuesta, sin el nombre de quien preguntó)
            </label>
            <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={!answer.trim()}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    Guardar respuesta
                </button>
                <button type="button" onClick={onCancel} className="text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
                {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
        </form>
    );
}

function AnnouncementForm({ contestId, problems, problemLabel, onSaved, onCancel }) {
    const [text, setText] = useState('');
    const [problemNum, setProblemNum] = useState('');
    const [error, setError] = useState(null);

    const publish = (event) => {
        event.preventDefault();
        apiService.post(`contests/${contestId}/clarifications/announcements`, {
            text,
            problemNum: problemNum === '' ? null : Number(problemNum),
        })
            .then(onSaved)
            .catch(err => setError(errorMessage(err, 'No se pudo publicar el anuncio.')));
    };

    return (
        <form onSubmit={publish} className="mb-6 rounded border border-indigo-200 bg-white p-4">
            <h2 className="mb-1 font-semibold">Nuevo anuncio</h2>
            <p className="mb-3 text-sm text-gray-500">Lo ven todos los participantes, resaltado arriba de los problemas.</p>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sobre</label>
            <select value={problemNum} onChange={e => setProblemNum(e.target.value)} className="mb-3 rounded border border-gray-300 p-2 text-sm">
                <option value="">General</option>
                {problems.map(problem => <option key={problem.num} value={problem.num}>{problemLabel(problem.num)}</option>)}
            </select>
            <RichText value={text} onChange={setText} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={!text.trim()}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    Publicar anuncio
                </button>
                <button type="button" onClick={onCancel} className="text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
                {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
        </form>
    );
}

const FILTERS = [
    { key: 'pending', label: 'Pendientes', match: isPending },
    { key: 'answered', label: 'Respondidas', match: item => item.userId && item.answer },
    { key: 'announcements', label: 'Anuncios', match: item => !item.userId },
    { key: 'all', label: 'Todas', match: () => true },
];

export default function ClarificationsPage() {
    const { contestId } = useParams();
    const [items, setItems] = useState(null);
    const [problems, setProblems] = useState([]);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [answeringId, setAnsweringId] = useState(null);
    const [announcing, setAnnouncing] = useState(false);

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

    // Problem letters with their titles, for the labels and the announcement selector.
    useEffect(() => {
        apiService.get(`contests/${contestId}`)
            .then(contest => Promise.all((contest.contestProblems ?? [])
                .filter(problem => problem.num !== null)
                .map(problem => apiService.fetchProblemById(problem.problemId)
                    .then(detail => ({ num: problem.num, title: detail?.title ?? '' }))
                    .catch(() => ({ num: problem.num, title: '' })))))
            .then(setProblems)
            .catch(() => setProblems([]));
    }, [contestId]);

    const pending = items ? items.filter(isPending).length : 0;

    // The browser tab shows the pending count, so the judge notices from another tab.
    useEffect(() => {
        const previous = document.title;
        document.title = pending > 0 ? `(${pending}) Aclaraciones` : 'Aclaraciones';
        return () => { document.title = previous; };
    }, [pending]);

    const problemLabel = (num) => {
        if (num === null || num === undefined) return 'General';
        const title = problems.find(problem => problem.num === num)?.title;
        return `${String.fromCharCode(65 + num)}${title ? ` · ${title}` : ''}`;
    };

    if (!items) {
        return <div className="p-4 text-center">{error ?? 'Cargando...'}</div>;
    }

    const visible = items.filter(FILTERS.find(item => item.key === filter).match);

    return (
        <div className="container mx-auto p-4 w-full min-w-full max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Aclaraciones: concurso {contestId}</h1>
                {!announcing && (
                    <button type="button" onClick={() => setAnnouncing(true)}
                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        + Nuevo anuncio
                    </button>
                )}
            </div>
            {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

            {announcing && (
                <AnnouncementForm contestId={contestId} problems={problems} problemLabel={problemLabel}
                    onSaved={() => { setAnnouncing(false); setFilter('announcements'); load(); }}
                    onCancel={() => setAnnouncing(false)} />
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
                {FILTERS.map(option => (
                    <button key={option.key} type="button" onClick={() => setFilter(option.key)}
                        className={`rounded px-3 py-1.5 text-sm font-medium ${filter === option.key ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {option.label}{option.key === 'pending' ? ` (${pending})` : ''}
                    </button>
                ))}
                <span className="ml-auto text-xs text-gray-500">Se actualiza cada 15 segundos.</span>
            </div>

            {visible.length === 0 && (
                <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    {filter === 'pending' ? 'No hay preguntas pendientes.' : 'No hay nada en esta lista.'}
                </p>
            )}
            <ul className="space-y-3">
                {visible.map(item => (
                    <li key={item.id} className={`rounded border bg-white p-4 ${isPending(item) ? 'border-amber-400' : 'border-gray-200'}`}>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">{problemLabel(item.problemNum)}</span>
                            <span>{item.userId ? <>Pregunta de <b className="text-gray-700">{item.userId}</b></> : 'Anuncio'}</span>
                            <span>{formatTime(item.createdAt)}</span>
                            {isPending(item) && <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">Pendiente</span>}
                            {item.userId && item.answer && (
                                <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                                    {item.isPublic ? 'Respondida a todos' : 'Respondida solo al usuario'}{item.answeredBy ? ` · ${item.answeredBy}` : ''}
                                </span>
                            )}
                        </div>
                        {item.question && <p className="mt-2 whitespace-pre-wrap text-gray-900">{item.question}</p>}
                        {item.answer && (
                            <div className={`mt-2 rounded p-3 text-sm ${item.userId ? 'bg-green-50' : 'bg-blue-50'}`}>{parse(item.answer)}</div>
                        )}
                        {item.userId && (answeringId === item.id
                            ? <AnswerForm contestId={contestId} item={item}
                                onSaved={() => { setAnsweringId(null); load(); }}
                                onCancel={() => setAnsweringId(null)} />
                            : (
                                <button type="button" onClick={() => setAnsweringId(item.id)}
                                    className={`mt-3 rounded px-3 py-1.5 text-sm font-medium ${item.answer ? 'text-blue-600 hover:text-blue-900' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                    {item.answer ? 'Editar respuesta' : 'Responder'}
                                </button>
                            ))}
                    </li>
                ))}
            </ul>
        </div>
    );
}
