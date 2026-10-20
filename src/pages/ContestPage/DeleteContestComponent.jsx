/* eslint-disable react/prop-types */
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
import { Trash2 } from "lucide-react";
import { apiService } from '../../services/apiService';

// Soft delete: the contest and its submissions stay in the database and can be restored.
export function DeleteContestComponent({ contestId }) {
    const deleteContest = async () => {
        await apiService.delete(`contests/${contestId}`).then(() => {
            window.location.reload();
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button type="button" title="Eliminar concurso"
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Eliminar
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar el concurso {contestId}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Deja de verse en el sitio y en esta lista, también por link. Sus envíos no se borran y se puede restaurar desde «Ver eliminados».
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteContest()}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
