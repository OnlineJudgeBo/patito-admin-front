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

import { useState } from "react";
import { apiService } from '../../services/apiService';
import { DEFUNCT } from '../../utils/defunctStates';

export function ChangeStatusComponent({ problemId, initialDefunct }) {
    const [defunct, setDefunct] = useState(initialDefunct);
    const { toast } = useToast()

    const changeStatus = async () => {
        await apiService.update("Problems", `${problemId}/visibility`, "").then(response => {
            setDefunct(defunct === DEFUNCT.HIDDEN ? DEFUNCT.VISIBLE : DEFUNCT.HIDDEN);
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
                <button
                    type="button"
                    title="Cambiar visibilidad"
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${defunct === DEFUNCT.HIDDEN
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                    {defunct === DEFUNCT.HIDDEN ? 'Oculto' : 'Visible'}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Cambiar estado de problema?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="text-xl">
                            {defunct === DEFUNCT.HIDDEN
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
