import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useAtom } from "jotai";
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from 'yup';
import '../../components/CKEditor/ckeditor.css';
import { langSelectAtom, problemSelectAtom, userSelectAtom } from "../../context/problemList";
import { apiService } from '../../services/apiService.js';
import CkeditorComponent from "./CkeditorComponent";
import LanguageListComponent from "./LanguageListComponent.jsx";
import ProblemListComponent from "./ProblemListComponent.jsx";
import UserListComponent from "./UserListComponent.jsx";

const EditContestPage = () => {
    const searchText = useAtom(problemSelectAtom);
    const searchText2 = useAtom(userSelectAtom);
    const searchText3 = useAtom(langSelectAtom);

    const [userList, setUserList] = useState([]);

    const [selectedProblems, setSelectedProblems] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [descriptionData, setDescriptionData] = useState("")
    const { toast } = useToast()
    const navigate = useNavigate();
    const { contestId } = useParams();
    const [initialValues, setInitialValues] = useState({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        //problems: '',
        isPrivate: false,
        users: '',
        selectedUser: [],
        selectedProblem: '',
        selectedLanguage: '',
    })

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Nombre del concurso requerido'),
        description: Yup.string().required('Descripción requerida'),
        startDate: Yup.date().required('Fecha de inicio requerida'),
        startTime: Yup.string().required('Hora de inicio requerida'),
        endDate: Yup.date().required('Fecha de fin requerida'),
        endTime: Yup.string().required('Hora de fin requerida'),
        selectedProblem: Yup.string().min(2).required('Seleccione mínimamente un problema.'),
        //selectedLanguage: Yup.string().min(2).required('Seleccione mínimamente un lenguaje.'),
        //isPrivate: Yup.boolean(),
        /*selectedUser: Yup.array()
            .when('isPrivate', {
                is: true,
                then: Yup.array().min(1, 'Debe seleccionar al menos un usuario para concursos privados.'),
                otherwise: Yup.array().notRequired()
            })*/
    });

    useEffect(() => {
        apiService.get('contests/' + contestId).then(data => {

            let startDate = data.startTime.split("T");
            let endDate = data.startTime.split("T");

            setSelectedProblems(data.contestProblems)
            setUserList(data.contestUsers)
            setSelectedLanguages(data.programmingLanguages)
            setDescriptionData(data.description)

            setInitialValues({
                title: data.title || '',
                description: data.description || '',
                startDate: startDate[0] || '',
                startTime: startDate[1] || '',
                endDate: endDate[0] || '',
                endTime: endDate[1] || '',
                //problems: "" || '',
                isPrivate: data.private || '',
                //users: "" || '',
                selectedUser: data.selectedUser || '',
                selectedProblem: data.selectedProblem || '',
                selectedLanguage: data.language || '',
                //selectedProblemList: "" || '',
                //selectedLanguageList: "" || '',
            })
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error al crear el contest",
                description: "Error al crear el contest, revise todos los campos.",
            })
            console.log(error);
        })
    }, [contestId]);

    const Submit = async (values) => {
        let sTime = values.startDate;
        let eTime = values.endDate;
        let selectedProblem = values.selectedProblem;
        let selectedUser = values.selectedUser;
        let selectedLanguage = values.selectedLanguage;

        values.startDate = values.startDate + "T" + values.startTime
        values.endDate = values.endDate + "T" + values.endTime
        values.selectedProblem = JSON.parse(values.selectedProblem)
        values.selectedUser = JSON.parse(values.selectedUser)
        values.selectedLanguage = JSON.parse(values.selectedLanguage)
        values.isPrivate = values.isPrivate == 1 ? true : false

        apiService.update('contests', contestId, values).then(data => {
            toast({
                description: 'Contest agregado.',
            })
            setTimeout(() => {
                navigate('/admin/contests');
            }, 2000);
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error al crear el contest",
                description: "Error al crear el contest, revise todos los campos.",
            })
            console.log(error);
        })
        values.startDate = sTime;
        values.endDate = eTime;
        values.selectedProblem = selectedProblem;
        values.selectedUser = selectedUser;
        values.selectedLanguages = selectedLanguage;
    };

    return (
        <>
            <Toaster />
            <Formik
                enableReinitialize="true"
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={Submit}
            >
                {formik => (
                    <Form>
                        <div className="flex divide-x divide-gray-200 w-full">
                            <div className="w-full p-4">
                                <h1 className="text-3xl font-bold mb-10">Crear Concurso</h1>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Nombre del Concurso</label>
                                    <Field type="text" id="title" name="title" placeholder="Ingrese el nombre del concurso" className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="isPrivate" className="inline-flex relative items-center cursor-pointer">
                                        <Field type="checkbox" id="isPrivate" name="isPrivate" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">¿Es Concurso Privado?</span>
                                    </label>
                                </div>

                                <CkeditorComponent setFieldValue={formik.setFieldValue} valueElement={descriptionData} />

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
                                <LanguageListComponent setFieldValue={formik.setFieldValue} userSelectedList={selectedLanguages} />
                            </div>

                            <div className="w-3/5 p-10">
                                <ProblemListComponent setFieldValue={formik.setFieldValue} problemSelectedList={selectedProblems} />

                                {formik.values.isPrivate && (
                                    <UserListComponent setFieldValue={formik.setFieldValue} userSelectedList={userList} />
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default EditContestPage;
