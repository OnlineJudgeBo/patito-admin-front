import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import '../../components/CKEditor/ckeditor.css';
import UploadAdapter from "../../components/CKEditor/upload_adapter.js";
import { MathStatementEditor } from '../../components/Statement/MathStatementEditor';
import { StatementPreview } from '../../components/Statement/StatementPreview';
import TopicClassificationComponent from '../../components/TopicClassification/TopicClassification.jsx';
import { apiService } from '../../services/apiService';
import './CKEditorStyle.css';

const problemEditorToolbar = [
    'undo', 'redo', '|',
    'heading', 'style', 'showBlocks', '|',
    'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', 'highlight', 'removeFormat', '|',
    'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|',
    'link', '|',
    'bulletedList', 'numberedList', 'todoList', 'alignment', '|',
    'code', 'codeBlock', '|',
    'insertTable', 'horizontalLine', '|',
    'blockQuote', 'mediaEmbed', '|',
    'imageUpload', 'specialCharacters', '|',
    'findAndReplace', 'selectAll', 'accessibilityHelp', '|',
    'MathType', 'ChemType'
];

const createProblemEditorConfig = (extraPlugins) => ({
    toolbar: {
        shouldNotGroupWhenFull: true,
        items: problemEditorToolbar
    },
    blockToolbar: [
        'heading', '|',
        'bulletedList', 'numberedList', 'todoList', '|',
        'blockQuote', 'codeBlock', 'insertTable', 'imageUpload', 'mediaEmbed'
    ],
    codeBlock: {
        languages: [
            { language: 'plaintext', label: 'Texto plano' },
            { language: 'c', label: 'C' },
            { language: 'cpp', label: 'C++' },
            { language: 'java', label: 'Java' },
            { language: 'python', label: 'Python' },
            { language: 'javascript', label: 'JavaScript' },
            { language: 'pascal', label: 'Pascal' }
        ]
    },
    image: {
        toolbar: [
            'toggleImageCaption', 'imageTextAlternative', '|',
            'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'
        ]
    },
    table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://'
    },
    extraPlugins,
    upload: {}
});

const CreateProblemPage = () => {

    const { toast } = useToast()
    const navigate = useNavigate();

    const Submit = (values) => {
        apiService.create('problems', values).then(() => {
            toast({
                description: 'Problema creado correctamente.',
            })
            setTimeout(() => {
                navigate('/admin/problems/');
            }, 2000);
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error al crear el problema",
                description: "Error al crear el problema, revise todos los campos.",
            })
            console.log(error);
        })
    };

    const [topicClassificationList, setTopicClassificationList] = useState();
    const [previewOpen, setPreviewOpen] = useState(false);

    const [initialValues, setInitialValues] = useState({
        Title: '',
        Description: '',
        MemoryLimit: '',
        TimeLimit: '',
        Input: '',
        Output: '',
        SampleCases: [{ Input: '', Output: '' }],
        Source: '',
        Hint: '',
        Spj: 'N',
        Classifications: [],
    });

    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const topicClassificationList = await apiService.fetchTopicList();
                setTopicClassificationList(topicClassificationList);
                setInitialValues({
                    Title: '',
                    Description: '',
                    MemoryLimit: '128',
                    TimeLimit: '1',
                    Classifications: [],
                    Input: '',
                    Output: '',
                    SampleCases: [{ Input: '', Output: '' }],
                    Source: '',
                    Hint: '',
                    Spj: 'N',
                });
                setDataLoaded(true);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };
        fetchData();
    }, []);

    const validationSchema = Yup.object().shape({
        Title: Yup.string().required('El título es obligatorio'),
        Description: Yup.string().required('La descripción es obligatoria'),
        MemoryLimit: Yup.number().required('El límite de memoria es obligatorio').positive('Debe ser positivo'),
        TimeLimit: Yup.number().required('El límite de tiempo es obligatorio').positive('Debe ser positivo'),
        Input: Yup.string().required('La descripción de la entrada es obligatoria'),
        Output: Yup.string().required('La descripción de la salida es obligatoria'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: Submit,
    });

    const updateSampleCase = (index, field, value) => {
        const cases = formik.values.SampleCases.map((sample, i) =>
            i === index ? { ...sample, [field]: value } : sample
        );
        formik.setFieldValue('SampleCases', cases);
    };

    const addSampleCase = () => {
        formik.setFieldValue('SampleCases', [...formik.values.SampleCases, { Input: '', Output: '' }]);
    };

    const removeSampleCase = (index) => {
        formik.setFieldValue('SampleCases', formik.values.SampleCases.filter((_, i) => i !== index));
    };

    const onSelectionChange = (selectedClassifications) => {
        let classifications = []
        selectedClassifications.forEach(classification => {
            classifications.push({ "ClassificationId": classification })
        });
        formik.setFieldValue('Classifications', classifications);
    };

    if (!dataLoaded) {
        return <div>Cargando datos...</div>;
    }

    function UploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new UploadAdapter(loader);
        };
    }
    return (
        <form onSubmit={formik.handleSubmit} className='mx-10 my-10'>
            <h2 className="text-dark mb-2 text-2xl font-semibold dark:text-white">
                Edición de problema.
            </h2>
            <div className="mb-6 p-4 bg-white rounded-lg shadow-lg">
                <label htmlFor="problem-title" className="block text-xl font-semibold mb-2">Título</label>
                <input id="problem-title" name="Title" type="text"
                    className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formik.values.Title} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.touched.Title && formik.errors.Title ? (
                    <div className="text-red-500">{formik.errors.Title}</div>
                ) : null}
            </div>

            <div className="mb-6">
                <fieldset className="p-4 mb-6 bg-white rounded-lg shadow-lg">
                    <legend className="text-2xl font-bold mb-4">Restricciones</legend>
                    <div className="grid grid-cols-1">
                        <div className="mx-10">
                            <div className="rounded-lg">
                                <label htmlFor="problem-limitations" className="block text-xl font-semibold mb-2">Tiempo Límite de Ejecución (Seg.)</label>
                                <input id="problem-limitations" name="TimeLimit" type="number"
                                    className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formik.values.TimeLimit} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.TimeLimit && formik.errors.TimeLimit ? (
                                    <div className="text-red-500">{formik.errors.TimeLimit}</div>
                                ) : null}
                            </div>
                            <div className="rounded-lg mt-5">
                                <label htmlFor="problem-execution-time" className="block text-xl font-semibold mb-2">Límite de Memoria (Mb)</label>
                                <input id="problem-execution-time" name="MemoryLimit" type="number"
                                    className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formik.values.MemoryLimit} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.MemoryLimit && formik.errors.MemoryLimit ? (
                                    <div className="text-red-500">{formik.errors.MemoryLimit}</div>
                                ) : null}
                            </div>
                            <div className="rounded-lg mt-5">
                                <label htmlFor="problem-special-judge" className="inline-flex items-center gap-2 text-xl font-semibold">
                                    <input id="problem-special-judge" type="checkbox" checked={formik.values.Spj === 'Y'}
                                        onChange={(event) => formik.setFieldValue('Spj', event.target.checked ? 'Y' : 'N')} />
                                    Juez especial (varias respuestas válidas)
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    Requiere un checker escrito con testlib.h, subido como <span className="font-mono">checker.cpp</span> en los archivos del problema.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg mt-5">
                            <TopicClassificationComponent
                                topics={topicClassificationList}
                                selected={initialValues.Classifications}
                                onSelectionChange={onSelectionChange}
                            />
                        </div>

                    </div>
                </fieldset>
            </div>

            <div className="mb-6">
                <label htmlFor="problem-description" className="block text-xl font-semibold mb-2">Descripción del Problema</label>
                <MathStatementEditor
                    editor={ClassicEditor}
                    config={createProblemEditorConfig([UploadAdapterPlugin])}
                    data={formik.values.Description}
                    onChange={(event, editor) => formik.setFieldValue('Description', editor.getData())}
                />

                {formik.touched.Description && formik.errors.Description ? (
                    <div className="text-red-500">{formik.errors.Description}</div>
                ) : null}
            </div>

            <div className="mb-6">
                <label htmlFor="problem-description" className="block text-xl font-semibold mb-2">Descripción de la entrada del Problema</label>
                <MathStatementEditor
                    editor={ClassicEditor}
                    config={createProblemEditorConfig([UploadAdapterPlugin])}
                    data={formik.values.Input}
                    onChange={(event, editor) => formik.setFieldValue('Input', editor.getData())}
                />

                {formik.touched.Input && formik.errors.Input ? (
                    <div className="text-red-500">{formik.errors.Input}</div>
                ) : null}
            </div>

            <div className="mb-6">
                <label htmlFor="problem-description" className="block text-xl font-semibold mb-2">Descripción de la salida del Problema</label>
                <MathStatementEditor
                    editor={ClassicEditor}
                    config={createProblemEditorConfig([UploadAdapterPlugin])}
                    data={formik.values.Output}
                    onChange={(event, editor) => formik.setFieldValue('Output', editor.getData())}
                />

                {formik.touched.Output && formik.errors.Output ? (
                    <div className="text-red-500">{formik.errors.Output}</div>
                ) : null}
            </div>

            {/* Casos de ejemplo */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-lg">
                <label className="block text-xl font-semibold mb-4">Casos de ejemplo</label>
                {formik.values.SampleCases.map((sample, index) => (
                    <div key={index} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                        <div>
                            <label htmlFor={`sample-input-${index}`} className="block text-sm font-medium mb-1">Entrada #{index + 1}</label>
                            <textarea id={`sample-input-${index}`} rows="4"
                                className="form-textarea mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={sample.Input} onChange={(e) => updateSampleCase(index, 'Input', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor={`sample-output-${index}`} className="block text-sm font-medium mb-1">Salida #{index + 1}</label>
                            <textarea id={`sample-output-${index}`} rows="4"
                                className="form-textarea mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={sample.Output} onChange={(e) => updateSampleCase(index, 'Output', e.target.value)} />
                        </div>
                        {formik.values.SampleCases.length > 1 && (
                            <button type="button" className="text-red-600 text-sm md:col-span-2 text-left"
                                onClick={() => removeSampleCase(index)}>
                                Quitar caso
                            </button>
                        )}
                    </div>
                ))}
                <button type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-2 px-4 rounded"
                    onClick={addSampleCase}>
                    + Agregar caso
                </button>
            </div>

            {/* Hits */}
            <div className="mb-6">
                <label htmlFor="problem-notes" className="block text-xl font-semibold mb-2">Notas/Consejos</label>
                <MathStatementEditor
                    editor={ClassicEditor}
                    config={createProblemEditorConfig([UploadAdapterPlugin])}
                    data={formik.values.Hint}
                    onChange={(event, editor) => formik.setFieldValue('Hint', editor.getData())}
                />
            </div>

            {/* Author */}
            <div className="mb-6">
                <label htmlFor="problem-author" className="block text-xl font-semibold mb-2">Autor</label>
                <input id="problem-author" name="Source" type="text"
                    className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formik.values.Source} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.touched.Source && formik.errors.Source ? (
                    <div className="text-red-500">{formik.errors.Source}</div>
                ) : null}
            </div>

            {/* Preview */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                    Vista previa
                </Button>
                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                    Guardar
                </button>
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle>Vista previa del problema</DialogTitle>
                    </DialogHeader>
                    <article className="space-y-7 text-slate-900">
                        <header className="border-b border-slate-200 pb-5">
                            <h1 className="text-3xl font-bold">{formik.values.Title || 'Título del problema'}</h1>
                            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                <div><dt className="inline font-semibold text-slate-800">Tiempo límite: </dt><dd className="inline">{formik.values.TimeLimit || '—'} s</dd></div>
                                <div><dt className="inline font-semibold text-slate-800">Memoria: </dt><dd className="inline">{formik.values.MemoryLimit || '—'} MB</dd></div>
                            </dl>
                        </header>
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">Descripción</h2>
                            <StatementPreview html={formik.values.Description} className="leading-7" />
                        </section>
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">Entrada</h2>
                            <StatementPreview html={formik.values.Input} className="leading-7" />
                        </section>
                        <section>
                            <h2 className="mb-2 text-xl font-semibold">Salida</h2>
                            <StatementPreview html={formik.values.Output} className="leading-7" />
                        </section>
                        {formik.values.SampleCases.some((sample) => sample.Input || sample.Output) ? (
                            <section className="space-y-4">
                                <h2 className="mb-1 text-xl font-semibold">Ejemplos</h2>
                                {formik.values.SampleCases.map((sample, index) => (
                                    (sample.Input || sample.Output) && (
                                        <div key={index}>
                                            <h3 className="mb-2 font-medium">Ejemplo #{index + 1}</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <h4 className="mb-1 text-sm font-medium text-slate-600">Entrada</h4>
                                                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100">{sample.Input}</pre>
                                                </div>
                                                <div>
                                                    <h4 className="mb-1 text-sm font-medium text-slate-600">Salida</h4>
                                                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100">{sample.Output}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </section>
                        ) : null}
                        {formik.values.Hint ? (
                            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <h2 className="mb-2 text-xl font-semibold">Notas</h2>
                                <StatementPreview html={formik.values.Hint} className="leading-7" />
                            </section>
                        ) : null}
                    </article>
                    <DialogFooter>
                        <Button type="button" onClick={() => setPreviewOpen(false)}>Cerrar vista previa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
};

export default CreateProblemPage;
