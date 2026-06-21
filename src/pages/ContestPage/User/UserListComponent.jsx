import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { userSelectAtom, userSelectAtomErrorMessage } from "../../../context/manager";
import { apiService } from '../../../services/apiService';

const UserListComponent = () => {
    const [userList, setUserList] = useAtom(userSelectAtom);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [errorMessages, setErrorMessages] = useAtom(userSelectAtomErrorMessage);

    useEffect(() => {
        const validateUsers = async () => {
            const validUsers = [];
            setErrorMessages([]);
            for (const user of userList) {
                if (!user.userId || user.userId.includes(",")) continue;
                const userId = user.userId.trim();
                try {
                    const response = await apiService.fetchUserProfileList({ searchTerm: userId });
                    if (response.length > 0) {
                        validUsers.push({
                            value: userId,
                            label: `${userId}`
                            //label: `${user.userId} - (${user.userProfile?.nick} ${user.userProfile?.lastname})`
                        });
                    } else {
                        setErrorMessages(prev => [...prev, `Usuario "${userId}" eliminado de la lista porque no es un usuario válido.`]);
                        setTimeout(() => {
                            setUserList(userList.filter(value => value.userId !== userId));
                        }, 3000);
                    }
                } catch (error) {
                    console.error('Error al verificar usuarios:', error);
                    setErrorMessages(prev => [...prev, `Error con usuario "${userId}": ${error.message}`]);
                }
            }
            setSelectedUsers(validUsers);
        };

        validateUsers();
    }, [userList]);

    const loadOptions = async (inputValue, callback) => {
        if (inputValue.length < 3) {
            setErrorMessages([]);
            callback([]);
            return;
        }

        try {
            const response = await apiService.fetchUserProfileList({ searchTerm: inputValue });
            if (response.length === 0) {
                setErrorMessages([`Usuario "${inputValue}" no encontrado`]);
                callback([]);
                return;
            }
            const options = response.map(user => ({
                value: user.userId,
                label: `${user.userProfile.nick} ${user.userProfile.lastname} - (${user.userId})`
            }));
            callback(options.sort((a, b) => a.label.localeCompare(b.label)));
            setErrorMessages([]);
        } catch (err) {
            console.error('Error al cargar la lista de usuarios:', err);
            setErrorMessages([`Error al cargar la lista de usuarios: ${err.message}`]);
            callback([]);
        }
    };

    const handleInputChange = (newValue, actionMeta) => {
        if (actionMeta.action === 'remove-value') {
            setUserList(current => current.filter(item => item.userId !== actionMeta.removedValue.value));
        } else {
            setUserList(newValue.map(user => ({ userId: user.value })));
        }
        setSelectedUsers(newValue || []);
    };

    return (
        <div className="mb-4">
            <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700">Seleccionar Usuarios</label>
            <AsyncSelect
                isMulti
                cacheOptions
                loadOptions={loadOptions}
                defaultOptions
                onChange={handleInputChange}
                value={selectedUsers}
                placeholder="Escriba el nombre del usuario"
                className="text-base w-full"
            />
            {errorMessages.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                    {errorMessages.map((msg, index) => <div key={index}>{msg}</div>)}
                </div>
            )}
        </div>
    );
}

export default UserListComponent;
