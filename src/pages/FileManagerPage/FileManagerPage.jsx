import { useToast } from "@/components/ui/use-toast";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "react-router-dom";
import { apiService } from "../../services/apiService";
import { DeleteFileContainer } from "./DeleteFileContainer";
import { ViewFileContainer } from "./ViewFileContainer";

const FileManagerPage = () => {
    const { toast } = useToast()
    const { problemId } = useParams();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        apiService.get(`FileManager/local-storage?problemId=` + problemId).then(data => {
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
                apiService.postFile(`FileManager/local-storage?problemId=${problemId}&fileName=${element.name}`, formData).then(data => {
                    toast({
                        variant: "success",
                        title: "Archivo Subido",
                        description: "Se subió el archivo",
                    });
                    setFiles(currentFiles => [
                        ...currentFiles,
                        { name: data.fileName, type: "file", path: '/' + data.fileName }
                    ]);
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

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true });

    const inFiles = files.filter(file => file.name.endsWith(".in"));
    const outFiles = files.filter(file => !file.name.endsWith(".in"));

    return (
        <div className="container mx-auto p-4">
            <div {...getRootProps()} className="flex justify-center items-center p-10 border-2 border-dashed border-gray-400 cursor-pointer">
                <input {...getInputProps()} />
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
            </div>
            <div className="flex flex-wrap mt-5 gap-10">
                {/* .in */}
                <div className="flex-1">
                    <h2 className="text-center font-bold mb-4">Archivos .IN</h2>
                    {inFiles.map((file, index) => (
                        <div key={index} className={`border rounded-lg p-4 flex justify-between items-center bg-blue-100 border-blue-500`}>
                            <span className="text-sm font-semibold truncate">{file.name}</span>
                            <div className="flex space-x-2">
                                <ViewFileContainer fileName={file.name} problemId={problemId} />
                                <DeleteFileContainer fileName={file.name} problemId={problemId} />
                            </div>
                        </div>
                    ))}
                </div>
                {/* .out */}
                <div className="flex-1">
                    <h2 className="text-center font-bold mb-4">Archivos .OUT</h2>
                    {outFiles.map((file, index) => (
                        <div key={index} className={`border rounded-lg p-4 flex justify-between items-center bg-blue-100 border-blue-500`}>
                            <span className="text-sm font-semibold truncate">{file.name}</span>
                            <div className="flex space-x-2">
                                <ViewFileContainer fileName={file.name} problemId={problemId} />
                                <DeleteFileContainer fileName={file.name} problemId={problemId} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileManagerPage;
