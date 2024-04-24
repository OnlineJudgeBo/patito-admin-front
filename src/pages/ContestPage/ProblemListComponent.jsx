
import { ErrorMessage, Field } from 'formik';
import parse from 'html-react-parser';
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

const ProblemListComponent = ({ setFieldValue, problemSelectedList }) => {

    const [inputTmp, setInputTmp] = useState([]);
    const [showSuggestionProblems, setShowSuggestionProblems] = useState([]);
    const [userSelectedProblems, setUserSelectedProblems] = useState([]);
    const [problemList, setProblemList] = useState([]);

    useEffect(() => {
        if (problemSelectedList.length > 0) {
            let problemRawList = problemSelectedList.map(problem => ({
                problemId: problem.problemId,
                name: problem.problemId + "<br>"
                //name: problem.title + " <br> id: " + problem.problemId + " <br> Clasificación: " + problem.classifications.map(classification => classification.name + " ")
            }));
            setUserSelectedProblems(problemRawList);
            setFieldValue('selectedProblem', JSON.stringify(problemRawList));
        }
    }, [problemSelectedList]);

    const handleProblemSearch = async (searchTerm) => {
        apiService.fetchProblemList({ searchTerm })
            .then(data => {
                let userList = data.map(problem => ({
                    problemId: problem.problemId,
                    name: problem.title + " <br> id: " + problem.problemId + " <br> Clasificación: " + problem.classifications.map(classification => classification.name + " ")
                }))
                setShowSuggestionProblems(userList);
                //setShowSuggestionUsers(userList);
                //setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                //debugger
                //setError(err.message);
                //setIsLoading(false);
            });
    };

    const handleAddProblem = (problem) => {
        setUserSelectedProblems([...userSelectedProblems, problem]);
        setShowSuggestionProblems([]);
        setFieldValue('selectedProblem', JSON.stringify([...userSelectedProblems, problem]));
    };

    const handleRemoveProblem = (problem) => {
        const updatedProblems = userSelectedProblems.filter(p => p.problemId !== problem.problemId);
        setUserSelectedProblems(updatedProblems);
        setShowSuggestionProblems([]);
        if (updatedProblems.length == 0) {
            setFieldValue('selectedProblem', "");
        } else {
            setFieldValue('selectedProblem', JSON.stringify(updatedProblems));
        }
    };

    const onBlurHandler = (event) => {
        /*if (event.target.name != "selectedProblemList") {
            setShowSuggestionProblems([]);
        }*/
    };

    return (<>
        <div className="mb-4" onBlur={onBlurHandler}>
            <label htmlFor="selectedProblem" className="block text-sm font-medium text-gray-700">Seleccionar Problema</label>
            <Field
                type="hidden"
                name="selectedProblem"
                id="selectedProblem"
            />
            <Field
                type="text"
                autoComplete="off"
                name="selectedProblemList"
                id="selectedProblemList"
                value={inputTmp}
                placeholder="Ingrese el nombre del problema"
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                onChange={(e) => {
                    handleProblemSearch(e.target.value);
                    setInputTmp(e.target.value)
                }}
            />
            {showSuggestionProblems.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                    {showSuggestionProblems.map((problem) => (
                        <div
                            key={problem.problemId}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                                handleAddProblem(problem)
                                setInputTmp("")
                            }}
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
                <label className="block text-sm font-medium text-gray-700">Problemas Seleccionados</label>
                {userSelectedProblems.map((problem) => (
                    <div key={problem.problemId} className="flex items-center mt-1">
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
export default ProblemListComponent;
