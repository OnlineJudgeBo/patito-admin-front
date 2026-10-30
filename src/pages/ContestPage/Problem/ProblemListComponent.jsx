import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { problemSelectAtom, problemSelectAtomErrorMessage } from "../../../context/manager";
import { apiService } from '../../../services/apiService';

const ProblemListComponent = () => {
    const [problemList, setProblemList] = useAtom(problemSelectAtom);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [errorMessages, setErrorMessages] = useAtom(problemSelectAtomErrorMessage);

    useEffect(() => {
        // A newer list (e.g. after moving a problem) makes this run's result stale.
        let stale = false;
        const validateProblems = async () => {
            const validProblems = [];
            setErrorMessages([]);
            for (const problem of problemList) {
                if (!problem.problemId || problem.problemId.toString().includes(",")) continue;
                try {
                    let problemId = problem.problemId + " ".trim();
                    const response = await apiService.fetchProblemList({ searchTerm: problemId });
                    if (response.length > 0) {
                        validProblems.push({
                            value: response[0].problemId,
                            label: response[0]?.title
                            //label: response[0]?.title + " <br> id: " + response[0].problemId + " <br> Clasificación: " + response[0]?.classifications.map(classification => classification.name + " ")
                        });
                    } else {
                        setErrorMessages(prev => [...prev, `Problema "${problemId}" eliminado de la lista porque no es un problema válido.`]);
                        setTimeout(() => {
                            setProblemList(problemList.filter(value => value.problemId !== problemId));
                        }, 3000);
                    }
                } catch (error) {
                    console.error('Error al verificar el problema:', error);
                    setErrorMessages(prev => [...prev, `Error con el problema "${problem.problemId}": ${error.message}`]);
                }
            }
            if (!stale) {
                setSelectedProblems(validProblems);
            }
        };
        if (problemList.length > 0) {
            validateProblems();
        }
        return () => { stale = true; };
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
            console.error('Error al cargar la lista de problemas:', err);
            setErrorMessages([`Error al cargar la lista de problemas: ${err.message}`]);
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

    // The order here is the contest order (A, B, C...): the API numbers the problems as they are sent.
    const move = (index, step) => {
        const moved = [...selectedProblems];
        [moved[index], moved[index + step]] = [moved[index + step], moved[index]];
        setSelectedProblems(moved);
        setProblemList(moved.map((problem) => ({ problemId: problem.value })));
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
            {selectedProblems.length > 1 && (
                <ol className="mt-3 divide-y rounded border border-gray-200 text-sm">
                    {selectedProblems.map((problem, index) => (
                        <li key={problem.value} className="flex items-center gap-2 px-3 py-1.5">
                            <span className="w-6 font-semibold">{String.fromCharCode(65 + index)}</span>
                            <span className="flex-1 truncate">{problem.label} <span className="text-gray-500">#{problem.value}</span></span>
                            <button type="button" className="px-2 disabled:opacity-30" disabled={index === 0}
                                onClick={() => move(index, -1)} aria-label={`Subir ${problem.label}`}>↑</button>
                            <button type="button" className="px-2 disabled:opacity-30" disabled={index === selectedProblems.length - 1}
                                onClick={() => move(index, 1)} aria-label={`Bajar ${problem.label}`}>↓</button>
                        </li>
                    ))}
                </ol>
            )}
            {selectedProblems.length > 1 && (
                <p className="mt-1 text-xs text-gray-500">
                    El orden se guarda con el concurso; los envíos y aclaraciones ya hechos siguen a su problema.
                </p>
            )}
            {errorMessages.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                    {errorMessages.map((msg, index) => <div key={index}>{msg}</div>)}
                </div>
            )}
        </div>
    );
}

export default ProblemListComponent;
