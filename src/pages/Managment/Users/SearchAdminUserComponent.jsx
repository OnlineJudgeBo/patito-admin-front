import React, { useState, useEffect } from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import { apiService } from "../../../services/apiService";
import { userSelectAtom } from "../../../context/manager";
import { useAtom } from "jotai";

export function SearchAdminUserComponent({ userId }) {

    const [userList, setUserList] = useState([]);
    const [userAdminSelected, setUserAdminSelected] = useAtom(userSelectAtom);

    useEffect(() => {
        if (userId.length > 2) {
            apiService.fetchUserProfileList({ searchTerm: userId })
                .then(data => {
                    let userList = data.map(user => ({
                        userId: user.userId,
                        email: user.userProfile.email
                    })
                    );
                    setUserList(userList);
                    console.log(userList);
                })
                .catch(err => {
                    console.log(err);
                });
        }

    }, [userId]);


    return (
        <Select onValueChange={value => setUserAdminSelected(value)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccione un usuario" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Seleccione un usuario</SelectLabel>
                    {
                        userList.map((user, index) => (
                            <SelectItem key={index} value={user.userId}>{user.userId}</SelectItem>
                        ))
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
