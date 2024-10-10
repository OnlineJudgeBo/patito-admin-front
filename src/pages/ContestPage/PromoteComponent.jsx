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

export function PromoteComponent({ contestId }) {
    const promoteContestToPractice = async () => {
        await apiService.update("Contests", `${contestId}/promote`, "").then(response => {
            window.location.reload();
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Promover a <br></br> Práctica</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="text-xl">
                            Cuando un concurso se promueve a práctica, ya no podrá ser editado, ni los problemas relacionados con él. <br></br>
                            El concurso se moverá a la sección de concursos de práctica.
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => promoteContestToPractice()}>Promover</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}
