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
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

export function AddTopicComponent() {
    const initialValues = {
        topicName: '',
    };

    const validationSchema = Yup.object().shape({
        topicName: Yup.string()
            .required('El nombre del tema es requerido.')
            .min(4, 'Cada nombre de tema debe tener al menos 4 caracteres.')
            .max(50, 'Cada nombre de tema no debe tener más de 50 caracteres.')
    });

    const handleSubmit = (values, { resetForm }) => {
        Swal.fire({
            icon: 'success',
            title: 'Tema agregado con éxito',
            showConfirmButton: false,
            timer: 1500
        });
        resetForm();
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="bg-gray-700 text-white">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Agregar Tema
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl bg-white rounded-lg shadow p-6">
                        <Form>
                            <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">Agregar Tema</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="topicName" className="md:text-right font-medium">
                                        Escriba el nombre del tema
                                    </Label>
                                    <Field name="topicName" as={Input} className="col-span-1 md:col-span-3" />
                                </div>
                                <ErrorMessage name="topicName" component="div" className="text-red-500" />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button
                                    type="submit"
                                    className="ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Agregando...' : 'Agregar'}
                                </Button>
                            </DialogFooter>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}
        </Formik>
    );
}
