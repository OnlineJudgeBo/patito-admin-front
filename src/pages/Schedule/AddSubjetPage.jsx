"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiService } from "../../services/apiService";
import { ScheduleTable } from "./ScheduleTable";

export function AddSubjectPage() {
    const { toast } = useToast();
    const [teacherList, setTeacherList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [assistantList, setAssistantList] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedAssistant, setSelectedAssistant] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);
    const [teacherPopoverOpen, setTeacherPopoverOpen] = useState(false);
    const [assistantDialogOpen, setAssistantDialogOpen] = useState(false);
    const [assistantNameDraft, setAssistantNameDraft] = useState("");
    const [assistantScheduleDraft, setAssistantScheduleDraft] = useState("");
    const [savedAssistantName, setSavedAssistantName] = useState("");
    const [savedAssistantSchedule, setSavedAssistantSchedule] = useState("");
    const [resourceDialog, setResourceDialog] = useState(null);
    const [resourceName, setResourceName] = useState("");

    const [newScheduleTime, setNewScheduleTime] = useState("");
    const [newScheduleDays, setNewScheduleDays] = useState([]);

    const [reload, setReload] = useState(0);

    const assistantScheduleSummary = useMemo(() => {
        if (!newScheduleTime || newScheduleDays.length === 0) {
            return "";
        }

        const startHour = Number.parseInt(newScheduleTime.split(":")[0], 10);

        if (Number.isNaN(startHour)) {
            return "";
        }

        const timeRange = `${newScheduleTime}-${String(startHour + 2).padStart(2, "0")}:00`;
        return newScheduleDays.map((day) => `${day} ${timeRange}`).join(" | ");
    }, [newScheduleDays, newScheduleTime]);

    useEffect(() => {
        if (!selectedSubject) {
            setAssistantList([]);
            setSelectedAssistant("");
            setSavedAssistantName("");
            setSavedAssistantSchedule("");
            return;
        }

        apiService.fetchSubjectAssistant(selectedSubject)
            .then((assistant) => {
                setAssistantList(assistant ? [assistant] : []);
                setSelectedAssistant(assistant ? String(assistant.id) : "");
                setSavedAssistantName(assistant?.name ?? "");
                setSavedAssistantSchedule(assistant?.schedule ?? "");
            })
            .catch(() => {
                setAssistantList([]);
                setSelectedAssistant("");
                setSavedAssistantName("");
                setSavedAssistantSchedule("");
            });
    }, [selectedSubject, reload]);

    useEffect(() => {
        apiService.get("schedule-management/teachers/teachers")
            .then((data) => {
                setTeacherList(data);
            })
            .catch((error) => {
                console.error("Error al cargar los horarios:", error);
            });
    }, []);

    useEffect(() => {
        apiService.get("schedule-management/subjects")
            .then((data) => {
                setSubjectList(data);
            })
            .catch((error) => {
                console.error("Error al cargar los horarios:", error);
            });
    }, []);

    const handleCreateSubject = (name) => {
        const normalizedName = name.trim();

        if (!normalizedName) return;

        apiService.create("schedule-management/subjects", { "subjectName": normalizedName })
            .then((newSubject) => {
                setSubjectList((prevSubjects) => [...prevSubjects, newSubject]);
                setSelectedSubject(String(newSubject.id));
            })
            .catch((error) => {
                console.error("Error al agregar la materia:", error);
            });
    };

    const handleCreateTeacher = (name) => {
        const normalizedName = name.trim();

        if (!normalizedName) return;

        apiService.create("schedule-management/teachers/teacher", { "teacherName": normalizedName })
            .then((newTeacher) => {
                setTeacherList((prevTeacher) => [...prevTeacher, newTeacher]);
                setSelectedTeacher(String(newTeacher.id));
            })
            .catch((error) => {
                console.error("Error al agregar el profesor:", error);
            });
    };

    const handleAddSubjectClick = () => {
        const normalizedName = subjectName.trim();

        if (!normalizedName) {
            return;
        }

        handleCreateSubject(normalizedName);
        setSubjectName("");
        setSubjectPopoverOpen(false);
    };

    const handleAddTeacherClick = () => {
        const normalizedName = teacherName.trim();

        if (!normalizedName) {
            return;
        }

        handleCreateTeacher(normalizedName);
        setTeacherName("");
        setTeacherPopoverOpen(false);
    };

    const handleSelectSubject = (value) => {
        setSelectedSubject(value);
    };

    const handleSelectTeacher = (value) => {
        setSelectedTeacher(value);
    };

    const openAssistantDialog = () => {
        setAssistantNameDraft(savedAssistantName);
        setAssistantScheduleDraft(savedAssistantSchedule || assistantScheduleSummary);
        setAssistantDialogOpen(true);
    };

    const handleSaveAssistant = async () => {
        const normalizedAssistantName = assistantNameDraft.trim();
        const normalizedAssistantSchedule = assistantScheduleDraft.trim();

        if (!selectedSubject) {
            toast({
                variant: "destructive",
                title: "Selecciona una materia",
                description: "Primero debes elegir la materia antes de registrar un auxiliar.",
            });
            return;
        }

        if (!normalizedAssistantName) {
            setAssistantDialogOpen(false);
            return;
        }

        try {
            const assistant = await apiService.updateSubjectAssistant(selectedSubject, {
                name: normalizedAssistantName,
                schedule: normalizedAssistantSchedule
            });
            setAssistantList(assistant?.name ? [assistant] : []);
            setSelectedAssistant(assistant?.name ? String(assistant.id) : "");
            setSavedAssistantName(assistant?.name ?? normalizedAssistantName);
            setSavedAssistantSchedule(assistant?.schedule ?? normalizedAssistantSchedule);
            setAssistantDialogOpen(false);
            toast({
                description: "Auxiliar guardado.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error al guardar el auxiliar",
                description: "No se pudo registrar el auxiliar, intente de nuevo.",
            });
            console.error("Error al guardar el auxiliar:", error);
        }
    };

    const openResourceDialog = (kind, target = null) => {
        setResourceDialog({ kind, target });
        setResourceName(target?.name ?? "");
    };

    const handleSaveResource = async () => {
        const normalizedName = resourceName.trim();
        if (!normalizedName || !resourceDialog?.target) return;

        const { kind, target } = resourceDialog;
        const resourceType = kind === "subject" ? "subject" : "teacher";
        const endpoint = resourceType === "subject"
            ? "schedule-management/subjects"
            : "schedule-management/teachers";
        const body = resourceType === "subject"
            ? { subjectName: normalizedName }
            : { teacherName: normalizedName };

        try {
            const updated = await apiService.update(endpoint, target.id, body);
            const setList = resourceType === "subject" ? setSubjectList : setTeacherList;
            setList((items) => items.map((item) => item.id === target.id ? updated : item));
            setResourceDialog(null);
            toast({ description: `${resourceType === "subject" ? "Materia" : "Docente"} actualizada correctamente.` });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "No se pudo actualizar",
                description: "Intenta nuevamente.",
            });
            console.error("Error al actualizar el horario:", error);
        }
    };

    const handleDeleteResource = async () => {
        if (!resourceDialog?.target) return;

        const { kind, target } = resourceDialog;
        const resourceType = kind === "delete-subject" ? "subject" : "teacher";
        const endpoint = resourceType === "subject"
            ? "schedule-management/subjects"
            : "schedule-management/teachers";

        try {
            await apiService.delete(`${endpoint}/${target.id}`);
            const setList = resourceType === "subject" ? setSubjectList : setTeacherList;
            setList((items) => items.filter((item) => item.id !== target.id));
            if (resourceType === "subject" && selectedSubject === String(target.id)) {
                setSelectedSubject("");
            }
            if (resourceType === "teacher" && selectedTeacher === String(target.id)) {
                setSelectedTeacher("");
            }
            setResourceDialog(null);
            toast({ description: `${resourceType === "subject" ? "Materia" : "Docente"} eliminado correctamente.` });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "No se pudo eliminar",
                description: resourceType === "teacher"
                    ? "El docente no puede eliminarse mientras tenga horarios asignados."
                    : "La materia no puede eliminarse mientras tenga horarios asignados.",
            });
            console.error("Error al eliminar el recurso de horario:", error);
        }
    };

    const toggleNewScheduleDay = (day) => {
        if (newScheduleDays.includes(day)) {
            setNewScheduleDays(newScheduleDays.filter((d) => d !== day));
        } else {
            setNewScheduleDays([...newScheduleDays, day]);
        }
    };

    const handleSubmit = () => {
        if (!selectedSubject || !selectedTeacher || !newScheduleTime || newScheduleDays.length === 0) {
            toast({
                variant: "destructive",
                title: "Faltan datos del horario",
                description: "Selecciona materia, docente, horario y al menos un día antes de guardar.",
            });
            return;
        }

        const newSubject = {
            subject: Number(selectedSubject),
            teacher: Number(selectedTeacher),
            scheduleDays: newScheduleDays,
            scheduleTime: newScheduleTime
        };

        apiService.create("schedule-management/schedules", newSubject)
            .then(() => {
                toast({
                    description: "Horario agregado correctamente.",
                });
                setReload(prev => prev + 1);
                setNewScheduleDays([]);
                setNewScheduleTime("");
                setAssistantDialogOpen(false);
            })
            .catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error al crear el horario",
                    description: "Hubo un error al guardar el horario, por favor intenta de nuevo.",
                });
                console.error("Error al crear el horario:", error);
            });
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Horarios de clase
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <Label className="block text-gray-700 mb-2">Materia</Label>
                            <div className="mb-2 text-sm text-gray-600">
                                Materia no encontrada?{" "}
                                <span className="text-blue-500 cursor-pointer">
                                    <Popover open={subjectPopoverOpen} onOpenChange={setSubjectPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="link" className="text-blue-500 underline">
                                                Agregar Materia
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-96 p-6 bg-white shadow-lg rounded-lg">
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <h4 className="text-lg font-semibold text-gray-800">Agregar Materia</h4>
                                                    <p className="text-sm text-gray-500">Ingresa el nombre de la materia para agregarlo a la lista.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subjectName" className="text-gray-700">
                                                        Nombre de la materia
                                                    </Label>
                                                    <Input
                                                        id="subjectName"
                                                        value={subjectName}
                                                        onChange={(event) => setSubjectName(event.target.value)}
                                                        className="w-full"
                                                        placeholder="Escribe el nombre de la materia"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleAddSubjectClick}
                                                    className="w-full bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    Agregar
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </span>
                            </div>
                            <div className="mb-4">
                                <Select value={selectedSubject} onValueChange={handleSelectSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escribe el nombre de la materia..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Materia</SelectLabel>
                                            {subjectList.map((subject) => (
                                                <SelectItem key={subject.id} value={String(subject.id)}>
                                                    {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedSubject ? (
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => openResourceDialog("subject", subjectList.find((subject) => String(subject.id) === selectedSubject))}>
                                        <Pencil className="mr-1 h-4 w-4" /> Editar materia
                                    </Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={() => openResourceDialog("delete-subject", subjectList.find((subject) => String(subject.id) === selectedSubject))}>
                                        <Trash2 className="mr-1 h-4 w-4" /> Eliminar materia
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <Label className="block text-gray-700 mb-2">Docente</Label>
                            <div className="mb-2 text-sm text-gray-600">
                                ¿Docente no encontrado?{" "}
                                <span className="text-blue-500 cursor-pointer">
                                    <Popover open={teacherPopoverOpen} onOpenChange={setTeacherPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="link" className="text-blue-500 underline">
                                                Agregar Docente
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-96 p-6 bg-white shadow-lg rounded-lg">
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <h4 className="text-lg font-semibold text-gray-800">Agregar Docente</h4>
                                                    <p className="text-sm text-gray-500">Ingresa el nombre del docente para agregarlo a la lista.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="teacherName" className="text-gray-700">
                                                        Nombre del docente
                                                    </Label>
                                                    <Input
                                                        id="teacherName"
                                                        value={teacherName}
                                                        onChange={(event) => setTeacherName(event.target.value)}
                                                        className="w-full"
                                                        placeholder="Escribe el nombre del docente"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleAddTeacherClick}
                                                    className="w-full bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    Agregar
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </span>
                            </div>
                            <div className="mb-4">
                                <Select value={selectedTeacher} onValueChange={handleSelectTeacher}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escribe el nombre del docente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Docente</SelectLabel>
                                            {teacherList.map((teacher) => (
                                                <SelectItem key={teacher.id} value={String(teacher.id)}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedTeacher ? (
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => openResourceDialog("teacher", teacherList.find((teacher) => String(teacher.id) === selectedTeacher))}>
                                        <Pencil className="mr-1 h-4 w-4" /> Editar docente
                                    </Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={() => openResourceDialog("delete-teacher", teacherList.find((teacher) => String(teacher.id) === selectedTeacher))}>
                                        <Trash2 className="mr-1 h-4 w-4" /> Eliminar docente
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <Dialog open={assistantDialogOpen} onOpenChange={setAssistantDialogOpen}>
                                <Label className="block text-gray-700 mb-2">Auxiliar</Label>
                                <div className="mb-2 text-sm text-gray-600">
                                    ¿Auxiliar no encontrado?{" "}
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="link" className="h-auto p-0 text-blue-500 underline" onClick={openAssistantDialog} disabled={!selectedSubject}>
                                            Agregar Auxiliar
                                        </Button>
                                    </DialogTrigger>
                                </div>
                                <div className="mb-4">
                                    <Select value={selectedAssistant} onValueChange={setSelectedAssistant} disabled={!selectedSubject || assistantList.length === 0}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedSubject ? "Selecciona un auxiliar..." : "Primero selecciona una materia"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Auxiliar</SelectLabel>
                                                {assistantList.map((assistant) => (
                                                    <SelectItem key={assistant.id} value={String(assistant.id)}>
                                                        {assistant.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedAssistant ? (
                                    <Button type="button" variant="outline" size="sm" onClick={openAssistantDialog}>
                                        <Pencil className="mr-1 h-4 w-4" /> Editar auxiliar
                                    </Button>
                                ) : null}
                                <DialogContent className="sm:max-w-xl bg-white rounded-lg shadow p-6">
                                    <DialogHeader>
                                        <DialogTitle>{savedAssistantName ? "Editar auxiliar" : "Agregar auxiliar"}</DialogTitle>
                                        <DialogDescription>
                                            Registra el auxiliar y su horario para la materia seleccionada.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="assistant-name" className="text-sm text-gray-700">Nombre</Label>
                                            <Input
                                                id="assistant-name"
                                                value={assistantNameDraft}
                                                onChange={(event) => setAssistantNameDraft(event.target.value)}
                                                placeholder="Ana Pérez, Juan López"
                                                className="mt-1 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="assistant-schedule" className="text-sm text-gray-700">Horario</Label>
                                            <Input
                                                id="assistant-schedule"
                                                value={assistantScheduleDraft}
                                                onChange={(event) => setAssistantScheduleDraft(event.target.value)}
                                                placeholder="Lunes 14:00-16:00 | Miércoles 16:00-18:00"
                                                className="mt-1 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button type="button" variant="outline" onClick={() => setAssistantDialogOpen(false)}>
                                            Cerrar
                                        </Button>
                                        <Button type="button" onClick={handleSaveAssistant}>
                                            Guardar auxiliar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            {selectedAssistant && savedAssistantSchedule ? (
                                <p className="mt-2 text-sm text-gray-600">
                                    Horario del auxiliar: <span className="font-medium text-gray-800">{savedAssistantSchedule}</span>
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <Label className="block text-gray-700 mb-2">Horarios de Clase</Label>
                            <div className="flex items-center gap-4 mb-4">
                                <Select onValueChange={setNewScheduleTime}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Seleccione Horario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="8:00">8:00-10:00</SelectItem>
                                        <SelectItem value="10:00">10:00-12:00</SelectItem>
                                        <SelectItem value="12:00">12:00-14:00</SelectItem>
                                        <SelectItem value="14:00">14:00-16:00</SelectItem>
                                        <SelectItem value="16:00">16:00-18:00</SelectItem>
                                        <SelectItem value="18:00">18:00-20:00</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="flex gap-2 h-4">
                                    {["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"].map(
                                        (day) => (
                                            <label key={day} className="flex items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    checked={newScheduleDays.includes(day)}
                                                    onChange={() => toggleNewScheduleDay(day)}
                                                    className="form-checkbox h-4 w-4 text-blue-500"
                                                />
                                                <span className="capitalize text-sm text-gray-700">
                                                    {day.slice(0, 3)}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <Button onClick={handleSubmit} className="bg-blue-500 text-white hover:bg-blue-600">
                        Agregar al Horario
                    </Button>
                </div>
                <Dialog open={Boolean(resourceDialog)} onOpenChange={(open) => !open && setResourceDialog(null)}>
                    <DialogContent className="sm:max-w-md bg-white rounded-lg shadow p-6">
                        <DialogHeader>
                            <DialogTitle>
                                {resourceDialog?.kind?.startsWith("delete")
                                    ? `Eliminar ${resourceDialog.kind === "delete-subject" ? "materia" : "docente"}`
                                    : `Editar ${resourceDialog?.kind === "subject" ? "materia" : "docente"}`}
                            </DialogTitle>
                            <DialogDescription>
                                {resourceDialog?.kind?.startsWith("delete")
                                    ? "Esta acción no se puede deshacer."
                                    : "Actualiza el nombre y guarda los cambios."}
                            </DialogDescription>
                        </DialogHeader>
                        {resourceDialog?.kind?.startsWith("delete") ? (
                            <p className="text-sm text-gray-700">
                                ¿Seguro que deseas eliminar <strong>{resourceDialog.target.name}</strong>?
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="resource-name">Nombre</Label>
                                <Input id="resource-name" value={resourceName} onChange={(event) => setResourceName(event.target.value)} autoComplete="off" />
                            </div>
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setResourceDialog(null)}>Cancelar</Button>
                            {resourceDialog?.kind?.startsWith("delete") ? (
                                <Button type="button" variant="destructive" onClick={handleDeleteResource}>Eliminar</Button>
                            ) : (
                                <Button type="button" onClick={handleSaveResource}>Guardar cambios</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <ScheduleTable reload={reload}></ScheduleTable>
            </div>
        </div >
    );
}
