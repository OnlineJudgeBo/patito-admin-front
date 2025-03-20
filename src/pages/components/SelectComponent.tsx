import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Subject {
    id: string | number;
    name: string;
}

interface SelectSubjectComponentProps {
    subjectList: Subject[];
    selectedSubject?: string | number;
    setSelectedSubject: (value: string | number) => void;
    defaultLabel?: string;
    placeholder?: string;
}

/**
 * SelectSubjectComponent - A reusable select component for choosing a subject.
 * 
 * @param {Object} props - The component props.
 * @param {Array} props.subjectList - The list of subjects to display.
 * @param {string|number} [props.selectedSubject] - The currently selected subject.
 * @param {Function} props.setSelectedSubject - Function to call when a subject is selected.
 * @param {string} [props.defaultLabel="Select a subject"] - The label for the select group.
 * @param {string} [props.placeholder="Select..."] - The placeholder text for the select trigger.
 * @returns {JSX.Element} - The rendered select component.
 */
export function SelectComponent({
    subjectList,
    selectedSubject,
    setSelectedSubject,
    defaultLabel = "Select a subject",
    placeholder = "Select..."
}: SelectSubjectComponentProps): JSX.Element {
    return (
        <Select value={selectedSubject} onValueChange={setSelectedSubject}  >
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{defaultLabel}</SelectLabel>
                    {subjectList.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
