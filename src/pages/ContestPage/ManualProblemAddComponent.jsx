
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import React from 'react';
import { problemSelectAtom } from "../../context/manager";

export function TextareaWithLabel() {
    return (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your message</Label>
            <Textarea placeholder="Type your message here." id="message" />
        </div>
    )
}

const ManualProblemAddComponent = ({ setFieldValue, userSelectedList }) => {

    const [inputText, setInputText] = useAtom(problemSelectAtom);
    const onBlurHandler = (event) => {
        console.log(event.target.value);
        setInputText(event.target.value);
    };

    const onChangeHandler = (event) => {
        setInputText(event.target.value);
        console.log(event.target.value);
    };

    return (
        <div className="mb-4" onBlur={onBlurHandler}>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Adicionar Problemas</label>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="message">Por favor, copia y pega la lista de problemas en el siguiente campo de texto.</Label>
                <Textarea id="manualProblemList" onChange={onChangeHandler} value={inputText} rows={20} />
            </div>
        </div>
    )
}
export default ManualProblemAddComponent;
