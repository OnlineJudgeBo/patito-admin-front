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
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { PlusIcon } from "@radix-ui/react-icons";
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useAtom } from "jotai";
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { userSelectAtom } from "../../../context/manager";
import { apiService } from "../../../services/apiService";
import { SearchAdminUserComponent } from "./SearchAdminUserComponent";

export function AddUserRuleComponent({ title }) {

    const [userAdminSelected, setUserAdminSelected] = useAtom(userSelectAtom);

    const initialValues = {
        username1: '',
        username: '',
        role: ''
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('Username requerido'),
        role: Yup.string().required('Rol requerido'),
    });

    const { toast } = useToast()

    const handleSubmit = (values) => {
        if (values.username != userAdminSelected) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "El nombre del usuario del input y del select debe ser lo mismo",
            })
            return;
        }
        try {
            apiService.create(`roles/${values.username}/${values.role}`, "").then(data => {
                toast({
                    variant: "success",
                    title: "Archivo Subido",
                    description: "Se subió el archivo",
                });
                window.location.reload();
            }).catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message,
                })
                console.log(error);
            })
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ submitForm, isValid, validateForm }) => (
                <Form>
                    <Dialog>
                        <Toaster />
                        <DialogTrigger asChild>
                            <Button variant="outline" className="bg-gray-700 text-white">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                {title}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl bg-white rounded-lg shadow p-6">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="md:text-right font-medium">
                                        Escriba el nombre del usuario
                                    </Label>
                                    <Field name="username" as={Input} className="col-span-1 md:col-span-3" />
                                </div>
                                <ErrorMessage name="username" component="div" className="text-red-500" />
                                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="searchComponent" className="md:text-right font-medium">
                                        Seleccione el nombre del usuario
                                    </Label>
                                    <Field name="username">
                                        {({ field }) => (
                                            <SearchAdminUserComponent userId={field.value} />
                                        )}
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="md:text-right font-medium">
                                        Rol
                                    </Label>
                                    <Field as="select" name="role" className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                        <option value="">Select a role</option>
                                        <option value="2">Docente</option>
                                        <option value="3">Auxiliar</option>
                                    </Field>
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                            </DialogFooter>
                            <Button
                                type="button"
                                onClick={async () => {
                                    await validateForm().then(errors => {
                                        console.log(errors);
                                        if (Object.keys(errors).length === 0) {
                                            submitForm();
                                        } else {
                                            let timerInterval;
                                            Swal.fire({
                                                icon: 'error',
                                                title: "Error al agregar permisos al usuario",
                                                html: Object.values(errors).join("<br>"),
                                                timer: 3000,
                                                timerProgressBar: true,
                                                didOpen: () => {
                                                    Swal.showLoading();
                                                    const timer = Swal.getPopup().querySelector("b");
                                                    timerInterval = setInterval(() => { }, 100);
                                                },
                                                willClose: () => {
                                                    clearInterval(timerInterval);
                                                }
                                            }).then((result) => {
                                                if (result.dismiss === Swal.DismissReason.timer) {
                                                }
                                            });
                                        }
                                    });
                                }}
                                className="ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Agregar
                            </Button>
                        </DialogContent>
                    </Dialog>
                </Form>
            )}
        </Formik>
    );
}
