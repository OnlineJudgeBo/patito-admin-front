import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { apiService } from '../../services/apiService';

export function ChangePasswordComponent({ userId }) {
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!password.trim()) {
            setErrorMessage('La clave es requerida');
            return;
        }

        setErrorMessage('');

        apiService.update("Users/changePassword", userId, { password }).then(() => {
            window.location.reload();
        })
    };

    return (
        <Dialog>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                            variant="secondary"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );

}
