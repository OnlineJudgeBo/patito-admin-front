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
import { apiService } from "../../../services/apiService";

export function DisableAdminUserComponent({ userId, roleId }) {
    const disableAdmin = async () => {
        await apiService.delete(`users/${userId}/role/${roleId}`).then(response => {
            window.location.reload();
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Desactivar Cuenta</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Estas seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminara los permisos a la cuenta de usuario.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => disableAdmin()}>Desactivar Cuenta</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
