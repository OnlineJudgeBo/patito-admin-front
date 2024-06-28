import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { apiService } from "../../services/apiService";

export function DeleteFileContainer({ fileName, problemId }) {
    const [contentFile, setContentFile] = useState([]);
    const { toast } = useToast()

    const fetchFileContent = () => {
        apiService.delete(`FileManager/local-storage?problemId=${problemId}&fileName=${fileName}`).then(data => {
            setContentFile(data);
            toast({
                variant: "success",
                title: "Eliminado",
                description: "Archivo eliminado correctamente",
            });
            window.location.reload();
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error al obtener el contenido del archivo",
                description: "No se pudo obtener el contenido del archivo. Por favor, intenta de nuevo más tarde.",
            });
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-red-100 border-red-500" variant="outline" onClick={fetchFileContent}>Borrar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Archivo {fileName}</DialogTitle>
                    <div className="dialog-description">
                        <pre>{contentFile}</pre>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
