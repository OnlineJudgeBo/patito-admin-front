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
import { useState } from 'react';
import Swal from 'sweetalert2';
import { apiService } from "../../services/apiService";

export function AddTopicComponent() {
    const [topicName, setTopicName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const normalizedName = topicName.trim();

        if (!normalizedName) {
            setErrorMessage('El nombre del tema es requerido.');
            return;
        }

        if (normalizedName.length < 4) {
            setErrorMessage('Cada nombre de tema debe tener al menos 4 caracteres.');
            return;
        }

        if (normalizedName.length > 50) {
            setErrorMessage('Cada nombre de tema no debe tener más de 50 caracteres.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await apiService.create("topics", {
                name: normalizedName,
            });

            Swal.fire({
                icon: 'success',
                title: 'Tema agregado con éxito',
                showConfirmButton: false,
                timer: 1500
            });
            setTopicName('');
            window.location.reload();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo agregar el tema',
                text: error?.response?.data ?? error?.message ?? 'Error inesperado.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-gray-700 text-white">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Agregar Tema
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Agregar Tema</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="topicName" className="md:text-right font-medium">
                                Escriba el nombre del tema
                            </Label>
                            <Input
                                id="topicName"
                                value={topicName}
                                onChange={(event) => setTopicName(event.target.value)}
                                className="col-span-1 md:col-span-3"
                            />
                        </div>
                        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
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
                </form>
            </DialogContent>
        </Dialog>
    );
}
