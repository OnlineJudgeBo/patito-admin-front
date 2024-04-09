import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import parse from 'html-react-parser';
import React, { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import '../../components/CKEditor/ckeditor.css';
import UploadAdapter from "../../components/CKEditor/upload_adapter.js";
import { apiService } from '../../services/apiService.js';

const ContestForm = () => {
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [problemSuggestions, setProblemSuggestions] = useState([]);
    const [problemsList, setProblemsList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [inputTmp, setInputTmp] = useState([]);
    const [inputUserTmp, setInputUserTmp] = useState([]);
    const [languageSuggestions, setLanguageSuggestions] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [descriptionData, setDescriptionData] = useState("")
    const autocompleteRef = useRef(null);

    const initialValues = {
        contestName: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        problems: '',
        isPrivate: false,
        users: '',
        selectedUser: '',
        selectedProblem: '',
        selectedLanguage: '',
        selectedProblemList: '',
        selectedLanguageList: '',
    };

    const validationSchema = Yup.object().shape({
        contestName: Yup.string().required('Nombre del concurso requerido'),
        description: Yup.string().required('Descripción requerida'),
        startDate: Yup.date().required('Fecha de inicio requerida'),
        startTime: Yup.string().required('Hora de inicio requerida'),
        endDate: Yup.date().required('Fecha de fin requerida'),
        endTime: Yup.string().required('Hora de fin requerida'),
        selectedLanguage: Yup.string().required('Seleccione mínimamente un lenguaje.'),
        selectedProblem: Yup.string().required('Seleccione mínimamente un problema.'),
    });

    const handleClickOutside = (event) => {
        if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
            setUserSuggestions([]);
            setProblemSuggestions([]);
            setLanguageSuggestions([]);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        apiService.fetchProblems()
            .then(data => {
                let updatedProblemsList = data.map(problem => ({
                    id: problem.problemId,
                    name: problem.title + " <br> id: " + problem.problemId + " <br> Clasificación: " + problem.classifications.map(classification => classification.name + " ")
                }));
                setProblemsList(updatedProblemsList);
            })
            .catch(err => {
                console.log(err);
            });

        apiService.fetchUserProfileList()
            .then(data => {
                let userData = data.map(user => ({
                    id: user.userId,
                    name: user.userProfile.nick + " " + user.userProfile.lastname
                }));
                setUserList(userData);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    const handleSubmit = (values) => {
        console.log(values)
    };

    const handleUserSearch = async (searchTerm) => {
        const filteredUsers = userList.filter(user =>
            user.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedUsers.some(selectedUser => selectedUser.id === user.id)
        );
        setUserSuggestions(filteredUsers);
    };

    const handleProblemSearch = async (searchTerm) => {
        const filteredProblems = problemsList.filter(problem =>
            problem.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedProblems.some(selectedProblem => selectedProblem.id === problem.id)
        );
        setProblemSuggestions(filteredProblems);
    };

    const handleLanguageSearch = async (searchTerm) => {
        const exampleLanguages = [
            { id: 1, name: 'java' },
            { id: 2, name: 'c' },
            { id: 3, name: 'python' },
        ];

        const filteredLanguages = exampleLanguages.filter(language =>
            language.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedLanguages.some(selectedLanguage => selectedLanguage.id === language.id)
        );

        setLanguageSuggestions(filteredLanguages);
    };

    const updateHiddenInput = (formik, data, fieldName) => {
        let updatedDescription = "";
        data.forEach(selectedLanguage => {
            updatedDescription += `${selectedLanguage.id},`;
        });
        formik.setFieldValue(fieldName, updatedDescription);
    }

    const handleAddProblem = (formik, problem) => {
        setSelectedProblems([...selectedProblems, problem]);
        setProblemSuggestions([]);
        updateHiddenInput(formik, [...selectedProblems, problem], 'selectedProblem')
    };

    const handleRemoveProblem = (formik, problem) => {
        const updatedProblems = selectedProblems.filter(p => p.id !== problem.id);
        updateHiddenInput(formik, updatedProblems, 'selectedProblem')
        setSelectedProblems(updatedProblems);
        setProblemSuggestions([]);
    };

    const handleAddUser = (formik, user) => {
        setSelectedUsers([...selectedUsers, user]);
        setUserSuggestions([]);
        updateHiddenInput(formik, [...selectedUsers, user], 'selectedUser')
    };

    const handleRemoveUser = (formik, user) => {
        const updatedUsers = selectedUsers.filter(u => u.id !== user.id);
        updateHiddenInput(formik, updatedUsers, 'selectedUser')
        setSelectedUsers(updatedUsers);
        setUserSuggestions([]);
    };

    const handleAddLanguage = (formik, language) => {
        setSelectedLanguages([...selectedLanguages, language]);
        setLanguageSuggestions([]);
        updateHiddenInput(formik, [...selectedLanguages, language], 'selectedLanguage')
    };

    const handleRemoveLanguage = (formik, language) => {
        let updatedLanguages = selectedLanguages.filter(lang => lang.id !== language.id);
        updateHiddenInput(formik, updatedLanguages, 'selectedLanguage')
        setSelectedLanguages(updatedLanguages);
        setLanguageSuggestions([]);
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {formik => (
                <Form className="ml-1" ref={autocompleteRef}>
                    <div className="flex divide-x divide-gray-200 w-full">
                        <div className="w-full p-4">
                            <h1 className="text-3xl font-bold mb-10">Crear Concurso</h1>
                            <div className="mb-4">
                                <label htmlFor="contestName" className="block text-sm font-medium text-gray-700">Nombre del Concurso</label>
                                <Field type="text" id="contestName" name="contestName" placeholder="Ingrese el nombre del concurso" className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                                <ErrorMessage name="contestName" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="isPrivate" className="inline-flex relative items-center cursor-pointer">
                                    <Field type="checkbox" id="isPrivate" name="isPrivate" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">¿Es Concurso Privado?</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={descriptionData}
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
                                        extraPlugins: [UploadAdapter],
                                        upload: {}
                                    }}
                                    onChange={(event, editor) => {
                                        let data = editor.getData();
                                        setDescriptionData(data);
                                        formik.setFieldValue('description', data);
                                    }}
                                />

                                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="flex mb-4 space-x-4">
                                <div className="w-1/2">
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                                    <Field
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        placeholder="Ingrese la fecha de inicio"
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                                    <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                                <div className="w-1/2">
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                                    <Field
                                        type="time"
                                        id="startTime"
                                        name="startTime"
                                        placeholder="Ingrese la hora de inicio"
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                                    <ErrorMessage name="startTime" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            </div>

                            <div className="flex mb-4 space-x-4">
                                <div className="w-1/2">
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                                    <Field
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        placeholder="Ingrese la fecha de fin"
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                                    <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                                <div className="w-1/2">
                                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Hora de Fin</label>
                                    <Field
                                        type="time"
                                        id="endTime"
                                        name="endTime"
                                        placeholder="Ingrese la hora de fin"
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                                    <ErrorMessage name="endTime" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="selectedLanguage" className="block text-sm font-medium text-gray-700">Seleccionar Lenguajes</label>
                                <Field
                                    type="hidden"
                                    name="selectedLanguage"
                                    id="selectedLanguage" />
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    value=""
                                    name="selectedLanguageList"
                                    id="selectedLanguageList"
                                    placeholder="Click para agregar un lenguaje"
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    onClick={(e) => {
                                        handleLanguageSearch(e.target.value);
                                    }}
                                />

                                {languageSuggestions.length > 0 && (
                                    <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                                        {languageSuggestions.map((language) => (
                                            <div
                                                key={language.id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={(e) => {
                                                    handleAddLanguage(formik, language)
                                                }
                                                }
                                            >
                                                {language.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <ErrorMessage name="selectedLanguage" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {selectedLanguages.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Lenguajes seleccionados</label>
                                    {selectedLanguages.map((language) => (
                                        <div key={language.id} className="flex items-center mt-1">
                                            <span className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2">{language.name}</span>
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={(e) => {
                                                    handleRemoveLanguage(formik, language)
                                                }
                                                }
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-3/5 p-10">
                            <div className="mb-4">
                                <label htmlFor="selectedProblem" className="block text-sm font-medium text-gray-700">Seleccionar Problema</label>
                                <Field
                                    type="hidden"
                                    name="selectedProblem"
                                    id="selectedProblem"
                                />
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    value={inputTmp}
                                    name="selectedProblemList"
                                    id="selectedProblemList"
                                    placeholder="Ingrese el nombre del problema"
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    onChange={(e) => {
                                        formik.setFieldValue('selectedProblem', e.target.value);
                                        handleProblemSearch(e.target.value);
                                        setInputTmp(e.target.value)
                                    }}
                                />
                                {problemSuggestions.length > 0 && (
                                    <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full shadow-md">
                                        {problemSuggestions.map((problem) => (
                                            <div
                                                key={problem.id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={(e) => {
                                                    handleAddProblem(formik, problem)
                                                    setInputTmp("")
                                                }
                                                }
                                            >
                                                {parse(problem.name)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <ErrorMessage name="selectedProblem" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {selectedProblems.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Problemas Seleccionados</label>
                                    {selectedProblems.map((problem) => (
                                        <div key={problem.id} className="flex items-center mt-1">
                                            <span className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2">{parse(problem.name)}</span>
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={(e) => {
                                                    handleRemoveProblem(formik, problem);
                                                }
                                                }
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formik.values.isPrivate && (
                                <div className="mb-4">
                                    <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700">Seleccionar Usuarios</label>
                                    <Field
                                        type="hidden"
                                        name="selectedUser"
                                        id="selectedUser"
                                    />
                                    <Field type="text"
                                        autoComplete="off"
                                        value={inputUserTmp}
                                        id="selectedUser"
                                        name="selectedUser"
                                        placeholder="Ingrese el nombre del usuario"
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        onChange={(e) => {
                                            formik.setFieldValue('selectedUser', e.target.value);
                                            handleUserSearch(e.target.value);
                                            setInputUserTmp(e.target.value)
                                        }}
                                    />
                                    {userSuggestions.length > 0 && (
                                        <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full shadow-md">
                                            {userSuggestions.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={(e) => {
                                                        handleAddUser(formik, user)
                                                        setInputUserTmp("")
                                                    }
                                                    }
                                                >
                                                    {parse(user.name)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <ErrorMessage name="selectedUser" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            )}

                            {formik.values.isPrivate && (
                                selectedUsers.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Usuarios Seleccionados</label>
                                        {selectedUsers.map((user) => (
                                            <div key={user.id} className="flex items-center mt-1">
                                                <span className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2">{parse(user.name)}</span>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleRemoveUser(formik, user)}
                                                >
                                                    x
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
                </Form>
            )}
        </Formik>
    );
};

export default ContestForm;
