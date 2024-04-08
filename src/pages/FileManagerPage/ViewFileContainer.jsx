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
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { apiService } from "../../services/apiService";

export function ViewFileContainer({ fileName, problemId }) {
    const [contentFile, setContentFile] = useState([]);
    const { toast } = useToast()

    const fetchFileContent = () => {
        apiService.get(`files/content?problemId=${problemId}&fileName=${fileName}`).then(data => {
            setContentFile(data);
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error al obtener el contenido del archivo",
                description: "No se pudo obtener el contenido del archivo. Por favor, intenta de nuevo más tarde.",
            });
            console.log(error);
        });
    };

    return (
        <Dialog>
            <Toaster />
            <DialogTrigger asChild>
                <Button className="bg-blue-100 border border-blue-500 text-blue-700 hover:bg-blue-200 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-200 dark:hover:bg-blue-300 dark:focus:ring-blue-800" variant="outline" onClick={fetchFileContent}>Ver</Button>
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
