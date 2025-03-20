import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface InputPopoverComponentProps {
    /**
     * Callback function that is called when a new subject is added.
     * @param subjectName - The name of the new subject.
     */
    onAddSubject: (subjectName: string) => void;
    /**
     * Text to display on the trigger button.
     * @default "Agregar Materia"
     */
    triggerText?: string;
    /**
     * Title of the popover content.
     * @default "Agregar Materia"
     */
    popoverTitle?: string;
    /**
     * Description text in the popover content.
     * @default "Ingresa el nombre de la materia para agregarlo a la lista."
     */
    popoverDescription?: string;
    /**
     * Label for the input field.
     * @default "Nombre de la materia"
     */
    inputLabel?: string;
    /**
     * Placeholder for the input field.
     * @default "Escribe el nombre de la materia"
     */
    inputPlaceholder?: string;
    /**
     * Text for the submit button.
     * @default "Agregar"
     */
    buttonText?: string;
}

/**
 * CreateNewSubjectComponent - A reusable component for adding a new subject.
 * It includes a popover with a form to input the subject name and a button to submit.
 */
export function InputPopoverComponent({
    onAddSubject,
    triggerText = "Agregar Materia",
    popoverTitle = "Agregar Materia",
    popoverDescription = "Ingresa el nombre de la materia para agregarlo a la lista.",
    inputLabel = "Nombre de la materia",
    inputPlaceholder = "Escribe el nombre de la materia",
    buttonText = "Agregar",
}: InputPopoverComponentProps) {
    const [subjectName, setSubjectName] = useState<string>("");
    const [showCreateSubject, setShowCreateSubject] = useState<boolean>(false);

    const handleAddSubject = () => {
        if (subjectName.trim()) {
            onAddSubject(subjectName);
            setSubjectName("");
            setShowCreateSubject(false);
        }
    };

    return (
        <Popover open={showCreateSubject} onOpenChange={setShowCreateSubject}>
            <PopoverTrigger asChild>
                <Button variant="link" className="text-blue-500 underline">
                    {triggerText}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-6 bg-white shadow-lg rounded-lg">
                <div className="space-y-4">
                    <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-800">{popoverTitle}</h4>
                        <p className="text-sm text-gray-500">{popoverDescription}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subjectName" className="text-gray-700">
                            {inputLabel}
                        </Label>
                        <Input
                            id="subjectName"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="w-full"
                            placeholder={inputPlaceholder}
                            autoComplete="off"
                        />
                    </div>
                    <Button
                        onClick={handleAddSubject}
                        className="w-full bg-blue-500 text-white hover:bg-blue-600"
                    >
                        {buttonText}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}