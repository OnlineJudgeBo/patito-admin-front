
import { ErrorMessage, Field } from 'formik';
import parse from 'html-react-parser';
import { useAtom } from "jotai";
import React, { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { userSelectAtom } from "../../context/manager";
import { apiService } from '../../services/apiService';

const UserListComponent = ({ setFieldValue, userSelectedList }) => {
    const [inputTmp, setInputTmp] = useState([]);
    const [showSuggestionUsers, setShowSuggestionUsers] = useState([]);
    const [userSelectedProblems, setUserSelectedProblems] = useState([]);
    const [problemList, setProblemList] = useState([]);
    const [manualUserList, setManualUserList] = useAtom(userSelectAtom);

    const debouncedInputUserTmp = useDebouncedCallback((value) => {
        handleProblemSearch(value)
    }, 1000);

    useEffect(() => {
        apiService.fetchUserProfileList()
            .then(data => {
                let problemRawList = data.map(user => ({
                    userId: user.userId,
                    name: user.userProfile.nick + " " + user.userProfile.lastname + ` - (${user.userId})`
                }));
                setProblemList(problemRawList);
                const selectedUsers = userSelectedList.map(selectedProblem =>
                    problemRawList.find(pf => pf.userId === selectedProblem.userId)
                ).filter(problem => problem !== undefined);
                setUserSelectedProblems(selectedUsers);
                setFieldValue('selectedUser', JSON.stringify(selectedUsers));
                setManualUserList(selectedUsers?.map(u => u.userId).join("\n"));
            })
            .catch(err => {
                console.log(err);
            });
    }, [userSelectedList]);

    const handleProblemSearch = async (searchTerm) => {
        const filteredProblems = problemList.filter(problem =>
            problem.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !userSelectedProblems.some(selectedProblem => selectedProblem.userId === problem.userId)
        );
        setShowSuggestionUsers(filteredProblems);
    };

    const handleAddProblem = (problem) => {
        let selectedValues = [...userSelectedProblems, problem];
        setUserSelectedProblems(selectedValues);
        setShowSuggestionUsers([]);
        setFieldValue('selectedUser', JSON.stringify(selectedValues));
        setManualUserList(selectedValues?.map(u => u.userId).join("\n"));
    };

    const handleRemoveProblem = (problem) => {
        const updatedProblems = userSelectedProblems.filter(p => p.userId !== problem.userId);
        setUserSelectedProblems(updatedProblems);
        setShowSuggestionUsers([]);
        if (updatedProblems.length == 0) {
            setFieldValue('selectedUser', "");
            setManualUserList("");
        } else {
            setFieldValue('selectedUser', JSON.stringify(updatedProblems));
            setManualUserList(updatedProblems?.map(u => u.userId).join("\n"));
        }
    };

    const onBlurHandler = (event) => {
        //setShowSuggestionUsers([]);
    };

    return (<>
        <div className="mb-4" onBlur={onBlurHandler}>
            <label htmlFor="selectedProblem" className="block text-sm font-medium text-gray-700">Seleccionar Usuarios</label>
            <Field
                type="hidden"
                name="selectedProblem"
                id="selectedProblem"
            />
            <Field
                type="text"
                autoComplete="off"
                value={inputTmp}
                name="selectedUserList"
                id="selectedUserList"
                placeholder="Ingrese el nombre del problema"
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                onChange={(e) => {
                    //handleProblemSearch(e.target.value);
                    debouncedInputUserTmp(e.target.value);
                    setInputTmp(e.target.value);
                }}
            />
            {showSuggestionUsers.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                    {showSuggestionUsers.map((problem) => (
                        <div
                            key={problem.userId}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                                handleAddProblem(problem)
                                setInputTmp("")
                            }
                            }
                        >
                            {parse(problem.name)}
                        </div>
                    ))}
                </div>
            )}
            <ErrorMessage name="selectedProblem" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {userSelectedProblems.length > 0 && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Usuarios Seleccionados</label>
                {userSelectedProblems.map((problem, index) => (
                    <div key={problem.userId + index} className="flex items-center mt-1">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2">{parse(problem.name)}</span>
                        <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                                handleRemoveProblem(problem);
                            }}> x
                        </button>
                    </div>
                ))}
            </div>
        )}
    </>)
}
export default UserListComponent;
