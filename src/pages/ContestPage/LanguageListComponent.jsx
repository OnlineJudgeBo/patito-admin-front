
import { ErrorMessage, Field } from 'formik';
import parse from 'html-react-parser';
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

const LanguageListComponent = ({ setFieldValue, userSelectedList }) => {
    const [inputTmp, setInputTmp] = useState([]);
    const [showSuggestionUsers, setShowSuggestionUsers] = useState([]);
    const [userElementSelected, setUserElementSelected] = useState([]);
    const [valueList, setValueList] = useState([]);

    useEffect(() => {
        apiService.get('programmingLanguages')
            .then(data => {
                let problemRawList = data.map(problem => ({
                    languageId: problem.languageId,
                    name: problem.name
                }));
                setValueList(problemRawList);

                const selectedProblems = userSelectedList.map(selectedProblem =>
                    problemRawList.find(pf => pf.languageId === selectedProblem.languageId)
                ).filter(problem => problem !== undefined);
                setUserElementSelected(selectedProblems);
                setFieldValue('selectedLanguages', JSON.stringify(selectedProblems));
            })
            .catch(err => {
                console.log(err);
            });
    }, [userSelectedList]);

    const handleProblemSearch = async (searchTerm) => {
        const filteredProblems = valueList.filter(problem =>
            problem.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !userElementSelected.some(language => language.languageId === problem.languageId)
        );
        setShowSuggestionUsers(filteredProblems);
    };

    const handleAddProblem = (problem) => {
        setUserElementSelected([...userElementSelected, problem]);
        setShowSuggestionUsers([]);
        setFieldValue('selectedLanguages', JSON.stringify([...userElementSelected, problem]));
    };

    const handleRemoveProblem = (problem) => {
        const updatedProblems = userElementSelected.filter(p => p.languageId !== problem.languageId);
        setUserElementSelected(updatedProblems);
        setShowSuggestionUsers([]);
        if (updatedProblems.length == 0) {
            setFieldValue('selectedLanguages', "");
        } else {
            setFieldValue('selectedLanguages', JSON.stringify(updatedProblems));
        }
    };

    const onBlurHandler = (event) => {
        //setShowSuggestionUsers([]);
    };

    return (<>
        <div className="mb-4" onBlur={onBlurHandler}>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Seleccionar Lenguajes</label>
            <Field
                type="hidden"
                name="selectedLanguage"
                id="selectedLanguage"
            />
            <Field
                type="text"
                autoComplete="off"
                value={inputTmp}
                name="languageUserList"
                id="languageUserList"
                placeholder="Ingrese el nombre del problema"
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                onClick={(e) => {
                    handleProblemSearch(e.target.value);
                }}
            />
            {showSuggestionUsers.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 shadow-md">
                    {showSuggestionUsers.map((problem) => (
                        <div
                            key={problem.languageId}
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
            <ErrorMessage name="language" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {userElementSelected.length > 0 && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Lenguajes Seleccionados</label>
                {userElementSelected.map((problem, index) => (
                    <div key={problem.languageId + index} className="flex items-center mt-1">
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
export default LanguageListComponent;
