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
import { Button } from "@/components/ui/button";
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
                <Button variant="outline" className="text-red-600">Eliminar</Button>
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
