import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiService } from '../../services/apiService';

export function ChangeStatusComponent({ problemId, initialDefunct }) {
    const [defunct, setDefunct] = useState(initialDefunct);
    const { toast } = useToast()

    const changeStatus = async () => {
        await apiService.update("Problems", `${problemId}/visibility`, "").then(response => {
            setDefunct(defunct === 'Y' ? 'N' : 'Y');
            toast({
                description: 'Visibilidad del problema actualizado',
            })
        }).catch(error => {
            console.error("Error al promover el concurso:", error);
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">
                    {defunct === 'Y' ? 'No' : 'Sí'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Cambiar estado de problema?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="text-xl">
                            {defunct === 'Y'
                                ? 'El problema ya estará disponible para todos los usuarios.'
                                : 'El problema se cambiará a modo borrador y no se listará en la sección de problemas.'}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={changeStatus}>
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
