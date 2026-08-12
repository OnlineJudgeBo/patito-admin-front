import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { apiService } from '../../services/apiService';

export function ChangePasswordComponent({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!password.trim()) {
            setErrorMessage('La clave es requerida');
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await apiService.update("users/changePassword", userId, { password });
            window.location.reload();
        } catch (error) {
            setErrorMessage(error.response?.data?.message ?? 'No se pudo cambiar la clave. Intente nuevamente.');
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);

        if (!open) {
            setPassword('');
            setErrorMessage('');
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <Button
                variant="outline"
                type="button"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen(true);
                }}
            >Cambiar clave</Button>
            <DialogContent className="sm:max-w-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Cambiar clave de usuario</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="col-span-1 text-right font-medium">Nueva Clave</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="col-span-3 border p-2 rounded-md"
                            />
                            {errorMessage && (
                                <p className="col-span-4 text-red-500 text-xs mt-1">{errorMessage}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="secondary"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

}
