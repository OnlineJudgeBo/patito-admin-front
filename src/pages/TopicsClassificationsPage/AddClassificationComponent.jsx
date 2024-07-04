import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "@radix-ui/react-icons";
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import React from 'react';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { apiService } from "../../services/apiService";

export function AddClassificationComponent({ topicId }) {
    const initialValues = {
        topicId: topicId,
        classifications: [''],
    };

    const validationSchema = Yup.object().shape({
        classifications: Yup.array().of(Yup.string().required('Nombre de la clasificación requerido')),
    });

    const handleSubmit = async (values, { resetForm }) => {

        let data = {
            classifications: []
        };

        values.classifications.forEach(element => {
            let n = {
                name: element
            }
            data.classifications.push(n);
        });
        let response = await apiService.create("topics/" + topicId + "/classification", data)
        debugger
        const classifications = response.map(classification => ({
            topicId: topic.topicId,
            name: topic.name,
            classifications: topic.classifications,
        }));
        debugger

        Swal.fire({
            icon: 'success',
            title: 'Clasificación agregada con éxito',
            showConfirmButton: false,
            timer: 1500
        });
        console.log(topicId);
        console.log(values);
        debugger
        resetForm();
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ submitForm, isValid, validateForm, isSubmitting, values }) => (
                <Form>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="bg-gray-700 text-white">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Agregar Clasificación
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl bg-white rounded-lg shadow p-6">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">Agregar Clasificación</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 grid gap-4">
                                <FieldArray name="classifications">
                                    {({ insert, remove, push }) => (
                                        <div className="mt-4">
                                            {values.classifications.length > 0 &&
                                                values.classifications.map((classification, index) => (
                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 mb-4">
                                                        <Label htmlFor={`classifications.${index}`} className="md:text-right font-medium">
                                                            Clasificación {index + 1}
                                                        </Label>
                                                        <Field
                                                            name={`classifications.${index}`}
                                                            as={Input}
                                                            className="col-span-1 md:col-span-3"
                                                        />
                                                        <ErrorMessage name={`classifications.${index}`} component="div" className="text-red-500 col-span-4" />
                                                        <Button
                                                            type="button"
                                                            className="ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                            onClick={() => remove(index)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                ))}
                                            <Button
                                                type="button"
                                                className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                onClick={() => push('')}
                                            >
                                                <PlusIcon className="h-5 w-5 mr-2" />
                                                Agregar Clasificación
                                            </Button>
                                        </div>
                                    )}
                                </FieldArray>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button
                                    className="ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    disabled={isSubmitting}
                                    onClick={submitForm}
                                >
                                    {isSubmitting ? 'Agregando...' : 'Agregar'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </Form>
            )}
        </Formik>
    );
}
