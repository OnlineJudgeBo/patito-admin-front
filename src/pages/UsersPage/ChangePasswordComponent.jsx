import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { apiService } from '../../services/apiService';

const createValidationSchema = () => Yup.object().shape({
    password: Yup.string().required('La clave es requerida')
});

export function ChangePasswordComponent({ userId }) {

    const handleClick = () => {
        formik.handleSubmit();
    };

    const formik = useFormik({
        initialValues: {
            password: "",
        },
        validationSchema: createValidationSchema(),
        onSubmit: (values, { setSubmitting }) => {
            apiService.update("Users/changePassword", userId, values).then(data => {
                window.location.reload();
            })
        }
    });

    return (
        <Dialog>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <DialogTrigger asChild>
                    <Button variant="outline" type="button">Cambiar clave</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-8">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Cambiar clave de usuario</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="col-span-1 text-right font-medium">Nueva Clave</Label>
                            <Input
                                id="password"
                                type="password"
                                {...formik.getFieldProps('password')}
                                className="col-span-3 border p-2 rounded-md"
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="col-span-4 text-red-500 text-xs mt-1">{formik.errors.password}</p>
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
