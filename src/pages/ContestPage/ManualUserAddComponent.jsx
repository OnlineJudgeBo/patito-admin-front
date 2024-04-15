
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import React from 'react';
import { userSelectAtom } from "../../context/manager";

export function TextareaWithLabel() {
    return (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your message</Label>
            <Textarea placeholder="Type your message here." id="message" />
        </div>
    )
}

const ManualUserAddComponent = ({ setFieldValue, userSelectedList }) => {

    const [inputText, setInputText] = useAtom(userSelectAtom);

    const onBlurHandler = (event) => {
        setInputText(event.target.value);
    };

    const onChangeHandler = (event) => {
        setInputText(event.target.value);
    };

    return (
        <div className="mb-4" onBlur={onBlurHandler}>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Adicionar Usuarios</label>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="message">Si ya tienes una lista de usuarios, simplemente cópiala desde donde la tengas y pégala en el cuadro de texto proporcionado debajo</Label>
                <Textarea id="manualUserList" onChange={onChangeHandler} value={inputText} />
            </div>
        </div>
    )
}
export default ManualUserAddComponent;
