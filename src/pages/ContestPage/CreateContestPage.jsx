import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useAtom } from "jotai";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import '../../components/CKEditor/ckeditor.css';
import { apiService } from '../../services/apiService.js';
import { fixTimeFormat, parseJSON } from '../../utils/Utils';
import CkeditorComponent from "./CkeditorComponent";
import LanguageListComponent from "./LanguageListComponent";

import ManualUserAddComponent from "./User/ManualUserAddComponent.jsx";
import UserListComponent from "./User/UserListComponent.jsx";

import { problemSelectAtom, userSelectAtom } from "../../context/manager";
import ManualProblemAddComponent from "./Problem/ManualProblemAddComponent";
import ProblemListComponent from "./Problem/ProblemListComponent";

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const CreateContestPage = () => {
    const [userListAtom, setUserListAtom] = useAtom(userSelectAtom);
    const [inputProblemTextAtom, setInputProblemTextAtom] = useAtom(problemSelectAtom);
    const [userList, setUserList] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [descriptionData, setDescriptionData] = useState("")
    const { toast } = useToast()
    const navigate = useNavigate();
    const today = new Date();
    const currentDate = today.toISOString().substring(0, 10);

    const [initialValues, setInitialValues] = useState({
        title: '',
        description: '',
        startDate: currentDate,
        startTime: getCurrentTime(),
        endDate: currentDate,
        endTime: getCurrentTime(),
        isPrivate: '',
        users: '',
        selectedUser: [],
        selectedProblem: [],
        selectedLanguages: [],
        manualUserList: ""
    })

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Nombre del concurso requerido'),
        startDate: Yup.date().required('Fecha de inicio requerida'),
        startTime: Yup.string().required('Hora de inicio requerida'),
        endDate: Yup.date().required('Fecha de fin requerida'),
        endTime: Yup.string().required('Hora de fin requerida'),
        //selectedProblem: Yup.string().min(2).required('Seleccione mínimamente un problema.'),
    });

    const Submit = async (values) => {
        let sTime = values.startDate;
        let eTime = values.endDate;
        let selectedProblem = values.selectedProblem;
        let selectedUser = values.selectedUser;
        let selectedLanguage = values.selectedLanguages;

        values.startDate = values.startDate + " " + fixTimeFormat(values.startTime)
        values.endDate = values.endDate + " " + fixTimeFormat(values.endTime)
        values.selectedProblem = parseJSON(values.selectedProblem)
        values.selectedUser = parseJSON(values.selectedUser)
        values.selectedLanguages = parseJSON(values.selectedLanguages)
        values.isPrivate = values.isPrivate == 1 ? true : false
        if (values.isPrivate == 1) {
            values.manualUserList = userListAtom.map(user => user.userId).join(",")
        }
        values.selectedProblem = inputProblemTextAtom//.map(user => user.problemId)

        apiService.create('contests', values).then(data => {
            toast({
                description: 'Contest agregado.',
            })
            setUserListAtom("");
            setInputProblemTextAtom("");
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
                                        <Field
                                            type="checkbox"
                                            id="isPrivate"
                                            name="isPrivate"
                                            className="sr-only peer"
                                            checked={formik.values.isPrivate}
                                            onChange={() => formik.setFieldValue('isPrivate', !formik.values.isPrivate)}
                                        />
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

                            <div className="w-3/5">
                                <div className="flex divide-x divide-gray-200 w-full">
                                    <div className="w-full p-4">
                                        <h1 className="text-3xl font-bold mb-10">Agregar problemas</h1>
                                        <div className="mb-2">
                                            <ManualProblemAddComponent />
                                            <Separator />
                                            <ProblemListComponent />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-3/5">
                                {formik.values.isPrivate === true && (
                                    <>
                                        <div className="flex divide-x divide-gray-200 w-full">
                                            <div className="w-full p-4">
                                                <h1 className="text-3xl font-bold mb-10">Agregar usuarios</h1>
                                                <div className="mb-2">
                                                    <ManualUserAddComponent />
                                                    <Separator />
                                                    <UserListComponent />
                                                </div>
                                            </div>
                                        </div>
                                    </>
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

export default CreateContestPage;
