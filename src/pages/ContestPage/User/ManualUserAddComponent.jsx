import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import { userSelectAtom } from "../../../context/manager";

const ManualUserAddComponent = () => {
    const [listTextAtom, setListTextAtom] = useAtom(userSelectAtom);
    const [inputText, setInputText] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const parseUserList = (text) => text
        .split(/[\n,]+/)
        .map(userId => userId.trim())
        .filter(Boolean)
        .map(userId => ({ userId }));

    useEffect(() => {
        if (isEditing) return;

        if (Array.isArray(listTextAtom)) {
            let userList = listTextAtom.map(user => `${user.userId}`).join("\n");
            setInputText(userList);
        }
    }, [listTextAtom, isEditing]);

    const onChangeHandler = (event) => {
        const text = event.target.value;
        setInputText(text);
        setListTextAtom(parseUserList(text));
    };

    const onBlurHandler = () => {
        const users = parseUserList(inputText);
        setIsEditing(false);
        setListTextAtom(users);
        setInputText(users.map(user => user.userId).join("\n"));
    };

    return (
        <div className="mb-4">
            <Label htmlFor="manualUserList" className="block text-sm font-medium text-gray-700">Adicionar Usuarios</Label>
            <Textarea
                id="manualUserList"
                onFocus={() => setIsEditing(true)}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
                value={inputText}
                rows={20} />
        </div>
    );
}
export default ManualUserAddComponent;
