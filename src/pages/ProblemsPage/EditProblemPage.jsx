import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';

import '../../components/CKEditor/ckeditor.css';
import UploadAdapter from "../../components/CKEditor/upload_adapter.js";
import TopicClassificationComponent from '../../components/TopicClassification/TopicClassification.jsx';
import { apiService } from '../../services/apiService';

const EditForm = () => {
    const { problemId } = useParams();
    const Submit = (values) => {
        console.log(values);
    };

    const [topicClassificationList, setTopicClassificationList] = useState();
    const [topicClassificationSelected, setTopicClassificationSelected] = useState();

    const [initialValues, setInitialValues] = useState({
        Title: '',
        Description: '',
        MemoryLimit: '',
        TimeLimit: '',
        Input: '',
        Output: '',
        SampleInput: '',
        SampleOutput: '',
        Source: '',
        Hint: '',
        Classifications: [],
    });

    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await apiService.fetchProblemById(problemId);
                let topicClassificationList = await apiService.fetchTopicList();
                setTopicClassificationList(topicClassificationList);
                setTopicClassificationSelected(data.classifications);

                setInitialValues({
                    Title: data.title || '',
                    Description: data.description || '',
                    MemoryLimit: data.memoryLimit || '',
                    TimeLimit: data.timeLimit || '',
                    Classifications: data.classifications || [],
                    Input: data.input || '',
                    Output: data.output || '',
                    SampleInput: data.sampleInput || '',
                    SampleOutput: data.sampleOutput || '',
                    Source: data.source || '',
                    Hint: data.hint || '',
                });
                setDataLoaded(true);
            } catch (error) {
                console.error("Error al cargar los datos del problema:", error);
            }
        };

        if (problemId) {
            fetchData();
        }
    }, [problemId]);

    const validationSchema = Yup.object().shape({
        Title: Yup.string().required('El título es obligatorio'),
        Description: Yup.string().required('La descripción es obligatoria'),
        MemoryLimit: Yup.number().required('El límite de memoria es obligatorio').positive('Debe ser positivo'),
        TimeLimit: Yup.number().required('El límite de tiempo es obligatorio').positive('Debe ser positivo'),
        Input: Yup.string().required('La descripción de la entrada es obligatoria'),
        Output: Yup.string().required('La descripción de la salida es obligatoria'),
        SampleInput: Yup.string().required('La entrada de ejemplo es obligatoria'),
        SampleOutput: Yup.string().required('La salida de ejemplo es obligatoria'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: Submit,
    });

    const onSelectionChange = (selectedClassifications) => {
        formik.setFieldValue('Classifications', selectedClassifications);
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
        <form onSubmit={formik.handleSubmit}>
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
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        toolbar: {
                            shouldNotGroupWhenFull: true,
                            items: [
                                'fontColor', 'fontBackgroundColor', '|',
                                'link', '|',
                                'bold', 'italic', '|',
                                'bulletedList', 'numberedList', '|',
                                'code', 'codeBlock', '|',
                                'insertTable', '|',
                                'blockQuote', '|',
                                'imageUpload', '|',
                                'MathType', 'ChemType',
                                'SourceEditing'
                            ]
                        },
                        extraPlugins: [UploadAdapterPlugin],
                        upload: {
                        }
                    }}
                    data={formik.values.Description}
                    onChange={(event, editor) => formik.setFieldValue('Description', editor.getData())}
                />

                {formik.touched.Description && formik.errors.Description ? (
                    <div className="text-red-500">{formik.errors.Description}</div>
                ) : null}
            </div>

            <div className="mb-6">
                <label htmlFor="problem-description" className="block text-xl font-semibold mb-2">Descripción de la entrada del Problema</label>
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        toolbar: {
                            shouldNotGroupWhenFull: true,
                            items: [
                                'fontColor', 'fontBackgroundColor', '|',
                                'link', '|',
                                'bold', 'italic', '|',
                                'bulletedList', 'numberedList', '|',
                                'code', 'codeBlock', '|',
                                'insertTable', '|',
                                'blockQuote', '|',
                                'imageUpload', '|',
                                'MathType', 'ChemType',
                                'SourceEditing'
                            ]
                        },
                        extraPlugins: [UploadAdapterPlugin],
                        upload: {
                        }
                    }}
                    data={formik.values.Input}
                    onChange={(event, editor) => formik.setFieldValue('Input', editor.getData())}
                />

                {formik.touched.Input && formik.errors.Input ? (
                    <div className="text-red-500">{formik.errors.Input}</div>
                ) : null}
            </div>

            <div className="mb-6">
                <label htmlFor="problem-description" className="block text-xl font-semibold mb-2">Descripción de la salida del Problema</label>
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        toolbar: {
                            shouldNotGroupWhenFull: true,
                            items: [
                                'fontColor', 'fontBackgroundColor', '|',
                                'link', '|',
                                'bold', 'italic', '|',
                                'bulletedList', 'numberedList', '|',
                                'code', 'codeBlock', '|',
                                'insertTable', '|',
                                'blockQuote', '|',
                                'imageUpload', '|',
                                'MathType', 'ChemType',
                                'SourceEditing'
                            ]
                        },
                        extraPlugins: [UploadAdapterPlugin],
                        upload: {
                        }
                    }}
                    data={formik.values.Output}
                    onChange={(event, editor) => formik.setFieldValue('Output', editor.getData())}
                />

                {formik.touched.Output && formik.errors.Output ? (
                    <div className="text-red-500">{formik.errors.Output}</div>
                ) : null}
            </div>

            {/* Sample Input */}
            <div className="mb-6">
                <label htmlFor="sample-input" className="block text-xl font-semibold mb-2">Ejemplo de Entrada del Problema</label>
                <textarea id="sample-input" name="SampleInput" rows="10"
                    className="form-textarea mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formik.values.SampleInput} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.touched.SampleInput && formik.errors.SampleInput ? (
                    <div className="text-red-500">{formik.errors.SampleInput}</div>
                ) : null}
            </div>

            {/* Sample Output */}
            <div className="mb-6">
                <label htmlFor="sample-output" className="block text-xl font-semibold mb-2">Ejemplo de Salida del Problema</label>
                <textarea id="sample-output" name="SampleOutput" rows="10"
                    className="form-textarea mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formik.values.SampleOutput} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.touched.SampleOutput && formik.errors.SampleOutput ? (
                    <div className="text-red-500">{formik.errors.SampleOutput}</div>
                ) : null}
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

            {/* Hits */}
            <div className="mb-6">
                <label htmlFor="problem-notes" className="block text-xl font-semibold mb-2">Notas/Consejos</label>
                <textarea id="problem-notes" name="Hint" rows="3"
                    className="form-textarea mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formik.values.Hint} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.touched.Hint && formik.errors.Hint ? (
                    <div className="text-red-500">{formik.errors.Hint}</div>
                ) : null}
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                    Guardar
                </button>
            </div>
        </form>
    );
};

export default EditForm;
