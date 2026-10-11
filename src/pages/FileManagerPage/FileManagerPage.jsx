import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
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
        }).catch(() => {
            toast({
                variant: "destructive",
                title: "Error al obtener la lita de archivos",
                description: "Error al obtener la lista de archivos.",
            })
        })
    }, []);

    const onDrop = async (acceptedFiles) => {
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
                }).catch(() => {
                    toast({
                        variant: "destructive",
                        title: "Error al obtener la lita de archivos",
                        description: "Error al obtener la lista de archivos.",
                    })
                })
            });
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true });

    const columns = [
        { title: 'Entradas (.in)', files: files.filter(file => file.name.endsWith('.in')) },
        { title: 'Salidas (.out)', files: files.filter(file => file.name.endsWith('.out')) },
        { title: 'Archivos del problema', hint: 'Checker, grader, testlib.h y puntaje.', files: files.filter(file => !/\.(in|out)$/.test(file.name)) },
    ];

    return (
        <div className="container mx-auto p-4">
            <div {...getRootProps()} className="flex justify-center items-center p-10 border-2 border-dashed border-gray-400 cursor-pointer">
                <input {...getInputProps()} />
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
            </div>
            <div className="flex flex-wrap mt-5 gap-10">
                {columns.map(column => (
                    <div key={column.title} className="flex-1 min-w-0">
                        <h2 className="text-center font-bold">{column.title}</h2>
                        <p className="mb-4 h-4 text-center text-xs text-gray-500">{column.hint}</p>
                        {column.files.map(file => (
                            <div key={file.name} className="border rounded-lg p-4 flex justify-between items-center bg-blue-100 border-blue-500">
                                <span className="text-sm font-semibold truncate">{file.name}</span>
                                <div className="flex space-x-2">
                                    <ViewFileContainer fileName={file.name} problemId={problemId} />
                                    <DeleteFileContainer fileName={file.name} problemId={problemId} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileManagerPage;
