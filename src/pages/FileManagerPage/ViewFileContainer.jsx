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
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { apiService } from "../../services/apiService";

import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c', c);

const determineLanguage = (fileName) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'cpp':
            return 'cpp';
        case 'c':
            return 'c';
        default:
            return 'plaintext';
    }
}

export function ViewFileContainer({ fileName, problemId }) {
    const [contentFile, setContentFile] = useState([]);
    const { toast } = useToast()

    const fetchFileContent = () => {
        apiService.get(`FileManager/local-storage/content?problemId=${problemId}&fileName=${fileName}`).then(data => {
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
            <DialogTrigger asChild>
                <Button className="bg-blue-100 border border-blue-500 text-blue-700 hover:bg-blue-200 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-200 dark:hover:bg-blue-300 dark:focus:ring-blue-800" variant="outline" onClick={fetchFileContent}>Ver</Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-2xl lg:max-w-4xl p-4 overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Archivo {fileName}</DialogTitle>
                    <div className="dialog-description overflow-auto max-h-[50vh]"> {/* Controla el desplazamiento y la altura máxima aquí */}
                        <SyntaxHighlighter language={determineLanguage(fileName)} style={docco} showLineNumbers={true}>
                            {contentFile}
                        </SyntaxHighlighter>
                    </div>
                </DialogHeader>
                <DialogFooter className="justify-start">
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
