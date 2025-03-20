import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";
import ConfirmationDialogComponent from "../components/ConfirmationDialogComponent";

export function ScheduleTable({ reload }) {
    const [schedules, setSchedule] = useState([]);

    const days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const hours = Array.from({ length: 8 }, (_, i) => 6 + i * 2);
    const { toast } = useToast();

    useEffect(() => {
        apiService.get("schedule-management/schedules/teachers")
            .then((data) => {
                setSchedule(data);
            })
            .catch((error) => {
                console.error("Error al cargar los horarios:", error);
            });
    }, [reload]);

    const parseTime = (time) => parseInt(time.split(":")[0], 10);

    const handleDelete = (schedule) => {
        apiService.delete(`schedule-management/schedules/${schedule.id}`)
            .then(() => {
                setSchedule(schedules.filter(item => item.id !== schedule.id));
            }).catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error eliminar el horario",
                    description: "Hubo un error al eliminar el horario, por favor intenta de nuevo.",
                });
                console.error("Error al eliminar el horario:", error);
            });
    };
    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Horarios de Clase</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border">Hora</th>
                            {days.map((day) => (
                                <th key={day} className="px-4 py-2 border">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length > 0 && hours.map((hour) => (
                            <tr key={hour}>
                                <td className="px-4 py-2 border">{`${hour}:00 - ${hour + 2}:00`}</td>
                                {days.map((day) => {
                                    const schedulesForCell = schedules.filter(item =>
                                        item.dayOfWeek === day && parseTime(item.startTime) === hour
                                    );

                                    return (
                                        <td key={day} className="px-4 py-2 border">
                                            {schedulesForCell.length > 0 ? (
                                                schedulesForCell.map((schedule, index) => (
                                                    <div key={index} className="mb-2 border-b pb-2">
                                                        <strong>{schedule.subject.name}</strong><br />
                                                        <strong>{schedule.teacher.name}</strong>
                                                        <br />
                                                        <div>
                                                            <ConfirmationDialogComponent
                                                                triggerLabel="Eliminar"
                                                                triggerClassName="text-red-500 text-xs"
                                                                title="Eliminar Horario"
                                                                message="¿Estás seguro de eliminar el horario?"
                                                                onConfirm={() => handleDelete(schedule)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : ""}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
