import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';


const FileManagerPage = () => {
    const apiUrl = 'http://localhost:5043/api';
    const { problemId } = useParams();

    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${apiUrl}/files?problemId=` + problemId);
            setFiles(response.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);

        try {
            await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchFiles();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const viewFile = async (fileName) => {
        // Agrega tu lógica aquí
    };

    const deleteFile = async (fileName) => {
        try {
            await axios.delete(`${apiUrl}/files/${fileName}`);
            fetchFiles();
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const fileStyle = (fileName) => {
        if (fileName.endsWith('.in')) {
            return "bg-blue-100 border-blue-500";
        } else if (fileName.endsWith('.out')) {
            return "bg-red-100 border-red-500";
        }
        return "bg-gray-100 border-gray-400";
    };

    // Separamos los archivos .in y .out en dos arrays
    const inFiles = files.filter(file => file.name.endsWith('.in'));
    const outFiles = files.filter(file => !file.name.endsWith('.in'));

    return (
        <div className="container mx-auto p-4">
            <div {...getRootProps()} className="flex justify-center items-center p-10 border-2 border-dashed border-gray-400 cursor-pointer">
                <input {...getInputProps()} />
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
            </div>
            <div className="flex flex-wrap mt-5 gap-10">
                {/* Columna para archivos .in */}
                <div className="flex-1">
                    <h2 className="text-center font-bold mb-4">Archivos .IN</h2>
                    {inFiles.map((file, index) => (
                        <div key={index} className={`border rounded-lg p-4 flex justify-between items-center ${fileStyle(file.name)}`}>
                            <span className="text-sm font-semibold truncate">{file.name}</span>
                            <div>
                                <button onClick={() => viewFile(file.name)} className="text-blue-500 hover:text-blue-700 text-xs mr-2">Ver</button>
                                <button onClick={() => deleteFile(file.name)} className="text-red-500 hover:text-red-700 text-xs">Borrar</button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Columna para archivos .out y otros */}
                <div className="flex-1">
                    <h2 className="text-center font-bold mb-4">Archivos .OUT y otros</h2>
                    {outFiles.map((file, index) => (
                        <div key={index} className={`border rounded-lg p-4 flex justify-between items-center ${fileStyle(file.name)}`}>
                            <span className="text-sm font-semibold truncate">{file.name}</span>
                            <div>
                                <button onClick={() => viewFile(file.name)} className="text-blue-500 hover:text-blue-700 text-xs mr-2">Ver</button>
                                <button onClick={() => deleteFile(file.name)} className="text-red-500 hover:text-red-700 text-xs">Borrar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileManagerPage;
