import { useToast } from "@/components/ui/use-toast";
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiService } from '../../services/apiService';

function BocaImportPage() {
    const { toast } = useToast();
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
        setResults([]);
        setSelectedIds(new Set());
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: { 'application/zip': ['.zip'] },
    });

    const handlePreview = async () => {
        if (files.length === 0) {
            return;
        }

        setIsPreviewing(true);
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));

            const data = await apiService.bocaImportPreview(formData);
            setResults(data.results);
            setSelectedIds(new Set(data.results.filter((item) => item.success).map((item) => item.stagingId)));
        } catch {
            toast({
                variant: "destructive",
                title: "Error al previsualizar",
                description: "No se pudieron leer los paquetes BOCA.",
            });
        } finally {
            setIsPreviewing(false);
        }
    };

    const toggleSelected = (stagingId) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(stagingId)) {
                next.delete(stagingId);
            } else {
                next.add(stagingId);
            }
            return next;
        });
    };

    const handleConfirm = async () => {
        if (selectedIds.size === 0) {
            return;
        }

        setIsConfirming(true);
        try {
            const data = await apiService.bocaImportConfirm(Array.from(selectedIds));
            const outcomeByStagingId = new Map(data.results.map((item) => [item.stagingId, item]));

            setResults((current) =>
                current.map((item) => {
                    const outcome = outcomeByStagingId.get(item.stagingId);
                    if (!outcome) return item;
                    return { ...item, imported: outcome.success, problemId: outcome.problemId, importError: outcome.error };
                })
            );
            setSelectedIds(new Set());

            const importedCount = data.results.filter((item) => item.success).length;
            toast({
                variant: importedCount === data.results.length ? "success" : "destructive",
                title: "Importación completada",
                description: `${importedCount} de ${data.results.length} problemas importados.`,
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Error al importar",
                description: "No se pudo completar la importación.",
            });
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="container mx-auto p-4 w-full min-w-full">
            <h1 className="text-xl font-semibold mb-4">Importar problemas de BOCA</h1>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded p-8 text-center cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                {files.length > 0 ? (
                    <p>{files.length} archivo(s) seleccionado(s): {files.map((file) => file.name).join(', ')}</p>
                ) : (
                    <p>Arrastra los .zip exportados de BOCA aquí</p>
                )}
            </div>

            <div className="mt-4">
                <Button onClick={handlePreview} disabled={files.length === 0 || isPreviewing}>
                    {isPreviewing ? 'Analizando...' : 'Vista previa'}
                </Button>
            </div>

            {results.length > 0 && (
                <div className="mt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>Archivo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Límites</TableHead>
                                <TableHead>Casos</TableHead>
                                <TableHead>Muestra</TableHead>
                                <TableHead>Revisión</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((item) => (
                                <TableRow key={item.stagingId ?? item.fileName}>
                                    <TableCell>
                                        {item.success && item.imported === undefined && (
                                            <Checkbox
                                                checked={selectedIds.has(item.stagingId)}
                                                onCheckedChange={() => toggleSelected(item.stagingId)}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{item.fileName}</TableCell>
                                    <TableCell>{item.title ?? '—'}</TableCell>
                                    <TableCell>
                                        {item.success ? `${item.timeLimit}s / ${item.memoryLimit}MB` : '—'}
                                    </TableCell>
                                    <TableCell>{item.success ? item.testCaseCount : '—'}</TableCell>
                                    <TableCell className="max-w-xs">
                                        {item.success ? (
                                            <pre className="text-xs whitespace-pre-wrap break-all">{item.sampleInputPreview}</pre>
                                        ) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {item.success && item.needsReview && (
                                            <div>
                                                <Badge variant="destructive">Necesita revisión, edite el enunciado del problema</Badge>
                                                <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                                                    {item.reviewReasons.map((reason) => <li key={reason}>{reason}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {item.success && !item.needsReview && <Badge variant="outline">Sin observaciones</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        {!item.success && <span className="text-red-600 text-sm">Error: {item.error}</span>}
                                        {item.imported === true && (
                                            <Link to={`/admin/problems/edit/${item.problemId}`} className="text-indigo-600 underline text-sm">
                                                Creado (id {item.problemId})
                                            </Link>
                                        )}
                                        {item.imported === false && <span className="text-red-600 text-sm">Error: {item.importError}</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4">
                        <Button onClick={handleConfirm} disabled={selectedIds.size === 0 || isConfirming}>
                            {isConfirming ? 'Importando...' : `Importar seleccionados (${selectedIds.size})`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BocaImportPage;
