"use client";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";
import { ScheduleTable } from "./ScheduleTable";

export function AddSubjectPage() {
    const [teacherList, setTeacherList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);
    const [teacherPopoverOpen, setTeacherPopoverOpen] = useState(false);

    const [newScheduleTime, setNewScheduleTime] = useState("");
    const [newScheduleDays, setNewScheduleDays] = useState([]);

    const [reload, setReload] = useState(0);

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

    const toggleNewScheduleDay = (day) => {
        if (newScheduleDays.includes(day)) {
            setNewScheduleDays(newScheduleDays.filter((d) => d !== day));
        } else {
            setNewScheduleDays([...newScheduleDays, day]);
        }
    };

    const handleSubmit = () => {
        if (!selectedSubject || !selectedTeacher || !newScheduleTime || newScheduleDays.length === 0) {
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
                setReload(prev => prev + 1);
            })
            .catch((error) => {
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
                <ScheduleTable reload={reload}></ScheduleTable>
            </div>
        </div >
    );
}
