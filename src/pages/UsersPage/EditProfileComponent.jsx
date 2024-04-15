import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { apiService } from '../../services/apiService';

const createValidationSchema = ({ originalEmail, originalUsername }) => Yup.object().shape({
    email: Yup.string().required('El correo del usuario es requerido').test(
        'email-available',
        'El correo del usuario ya esta en uso',
        async (email, context) => {
            if (email === originalEmail) return true;
            return await apiService.checkUserEmailAvailability({ "email": email, "userId": "" });
        }
    ),
    username: Yup.string().required('Nombre de usuario requerido').test(
        'username-available',
        'El nombre de usuario ya esta en uso',
        async (username, context) => {
            if (username === originalUsername) return true;
            return await apiService.checkUsernameAvailability({ "email": "", "userId": username });
        }
    ),
    name: Yup.string().required('El nombre es requerido'),
    lastname: Yup.string().required('El apellido es requerido'),
});


export function EditProfileComponent({ email, username, name, lastname }) {

    const handleClick = () => {
        formik.handleSubmit();
    };

    const formik = useFormik({
        initialValues: {
            email: email,
            username: username,
            name: name,
            lastname: lastname,
        },
        validationSchema: createValidationSchema({ originalEmail: email, originalUsername: username }),
        onSubmit: (values) => {
            apiService.update("users", username, values).then(data => {
                window.location.reload();
            })
        }
    });

    return (
        <Dialog>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <DialogTrigger asChild>
                    <Button variant="outline" type="button">Editar</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-8">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Editar perfil de Usuario</DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Realice cambios en el perfil aquí.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="col-span-1 text-right font-medium">Correo</Label>
                            <Input
                                id="email"
                                type="email"
                                {...formik.getFieldProps('email')}
                                className="col-span-3 border p-2 rounded-md"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="col-span-4 text-red-500 text-xs mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="col-span-1 text-right font-medium">Nombre de Usuario</Label>
                            <Input
                                id="username"
                                type="text"
                                {...formik.getFieldProps('username')}
                                className="col-span-3 border p-2 rounded-md"
                            />
                            {formik.touched.username && formik.errors.username && (
                                <p className="col-span-4 text-red-500 text-xs mt-1">{formik.errors.username}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="col-span-1 text-right font-medium">Nombre</Label>
                            <Input
                                id="name"
                                type="text"
                                {...formik.getFieldProps('name')}
                                className="col-span-3 border p-2 rounded-md"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="col-span-4 text-red-500 text-xs mt-1">{formik.errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastname" className="col-span-1 text-right font-medium">Apellido</Label>
                            <Input
                                id="lastname"
                                type="text"
                                {...formik.getFieldProps('lastname')}
                                className="col-span-3 border p-2 rounded-md"
                            />
                            {formik.touched.lastname && formik.errors.lastname && (
                                <p className="col-span-4 text-red-500 text-xs mt-1">{formik.errors.lastname}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            variant="secondary"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={handleClick}
                        >Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );

}
