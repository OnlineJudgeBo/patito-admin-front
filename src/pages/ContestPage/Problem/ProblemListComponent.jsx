import { useAtom } from "jotai";
import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { problemSelectAtom, problemSelectAtomErrorMessage } from "../../../context/manager";
import { apiService } from '../../../services/apiService';

const ProblemListComponent = () => {
    const [problemList, setProblemList] = useAtom(problemSelectAtom);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [errorMessages, setErrorMessages] = useAtom(problemSelectAtomErrorMessage);

    useEffect(() => {
        const validateUsers = async () => {
            const validProblems = [];
            setErrorMessages([]);
            for (const problem of problemList) {
                if (!problem.problemId || problem.problemId.toString().includes(",")) continue;
                try {
                    const response = await apiService.fetchProblemList({ searchTerm: problem.problemId });
                    if (response.length > 0) {
                        validProblems.push({
                            value: response[0].problemId,
                            label: response[0]?.title
                            //label: response[0]?.title + " <br> id: " + response[0].problemId + " <br> Clasificación: " + response[0]?.classifications.map(classification => classification.name + " ")
                        });
                    } else {
                        setErrorMessages(prev => [...prev, `Problema "${problem.problemId}" no encontrado`]);
                    }
                } catch (error) {
                    console.error('Error al verificar usuarios:', error);
                    setErrorMessages(prev => [...prev, `Error con usuario "${problem.problemId}": ${error.message}`]);
                }
            }
            setSelectedProblems(validProblems);
        };
        if (problemList.length > 0) {
            validateUsers();
        }
    }, [problemList]);

    const loadOptions = async (inputValue, callback) => {
        if (inputValue.length < 3) {
            setErrorMessages([]);
            callback([]);
            return;
        }

        try {
            const response = await apiService.fetchProblemList({ searchTerm: inputValue });
            if (response.length === 0) {
                setErrorMessages([`Problema "${inputValue}" no encontrado`]);
                callback([]);
                return;
            }
            const options = response.map(problem => ({
                value: problem.problemId,
                label: problem?.title
                //label: problem?.title + " <br> id: " + problem.problemId + " <br> Clasificación: " + problem?.classifications.map(classification => classification.name + " ")
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
            setProblemList(current => current.filter(item => item.problemId !== actionMeta.removedValue.value));
        } else {
            setProblemList(newValue.map(problem => ({ problemId: problem.value })));
        }
        setSelectedProblems(newValue || []);
    };

    return (
        <div className="mb-4">
            <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700">Seleccionar Problemas</label>
            <AsyncSelect
                isMulti
                cacheOptions
                loadOptions={loadOptions}
                defaultOptions
                onChange={handleInputChange}
                value={selectedProblems}
                placeholder="Escriba el id del problema"
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

export default ProblemListComponent;
