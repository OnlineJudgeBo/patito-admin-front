import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import { userSelectAtom } from "../../../context/manager";

const ManualUserAddComponent = () => {
    const [listTextAtom, setListTextAtom] = useAtom(userSelectAtom);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        let value = []
        if (inputText.includes(",") === true) {
            value = inputText.split(",").map(userId => ({ userId: userId.trim() }));
            let userList = value.map(user => `${user.userId}`).join("\n");
            setInputText(userList);
            setListTextAtom(value);
        } else if (Array.isArray(listTextAtom)) {
            let userList = listTextAtom.map(user => `${user.userId}`).join("\n");
            setInputText(userList);
        }
    }, [listTextAtom, setListTextAtom]);

    const onChangeHandler = (event) => {
        setInputText(event.target.value);
    };

    const onBlurHandler = () => {
        setListTextAtom(inputText.split("\n").map(userId => ({ userId })));
    };

    return (
        <div className="mb-4">
            <Label htmlFor="manualUserList" className="block text-sm font-medium text-gray-700">Adicionar Usuarios</Label>
            <Textarea
                id="manualUserList"
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
                value={inputText}
                rows={20} />
        </div>
    );
}
export default ManualUserAddComponent;
