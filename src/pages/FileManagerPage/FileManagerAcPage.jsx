import { useToast } from "@/components/ui/use-toast";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../../services/apiService";
import { ViewFileContainer } from "./ViewFileContainer";

const FileManagerAcPage = () => {
    const { toast } = useToast()
    const { problemId } = useParams();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        apiService.get(`FileManager/local-storage/ac?problemId=${problemId}`).then(data => {
            setFiles(data);
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error al obtener la lita de archivos",
                description: "Error al obtener la lista de archivos.",
            })
            console.log(error);
        })
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        try {
            acceptedFiles.forEach(element => {
                let formData = new FormData();
                formData.append("file", element);
                apiService.postFile(`local-storage?problemId=${problemId}&fileName=${element.name}`, formData).then(data => {
                    toast({
                        variant: "success",
                        title: "Archivo Subido",
                        description: "Se subió el archivo",
                    });
                    window.location.reload();
                }).catch((error) => {
                    toast({
                        variant: "destructive",
                        title: "Error al obtener la lita de archivos",
                        description: "Error al obtener la lista de archivos.",
                    })
                    console.log(error);
                })
            });
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }, []);

    const outFiles = files.filter(file => !file.name.endsWith(".in"));

    return (
        <div className="container mx-auto p-4">
            <div className="mt-5">
                <h2 className="text-center font-bold mb-4">Archivos</h2>
                <div className="grid grid-cols-3 gap-4"> {/* Ajusta aquí para cambiar el número de columnas y el espacio */}
                    {outFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-blue-100 border-blue-500 flex items-center justify-between">
                            <span className="text-sm font-semibold truncate">{file.name}</span>
                            <div className="flex space-x-2">
                                <ViewFileContainer fileName={"ac/" + file.name} problemId={problemId} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default FileManagerAcPage;
