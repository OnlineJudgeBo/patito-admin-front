import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { useEffect, useState } from 'react';
import { problemSelectAtom, problemSelectAtomErrorMessage } from "../../../context/manager";

const ManualProblemAddComponent = () => {
    const [listTextAtom, setListTextAtom] = useAtom(problemSelectAtom);
    const [inputText, setInputText] = useState("");
    const [errorMessagesProblem, setErrorMessagesProblem] = useAtom(problemSelectAtomErrorMessage);

    useEffect(() => {
        let value = []
        if (inputText.includes(",") === true) {
            value = inputText.split(",").map(problemId => ({ problemId: problemId.trim() }));
            let problemList = value.map(problem => `${problem.problemId}`).join("\n");
            setInputText(problemList);
            setListTextAtom(value);
        } else if (Array.isArray(listTextAtom)) {
            let problemList = listTextAtom.map(problem => `${problem.problemId}`).join("\n");
            setInputText(problemList);
        }
        setErrorMessagesProblem([]);
    }, [listTextAtom, setListTextAtom]);

    const onChangeHandler = (event) => {
        setInputText(event.target.value);
    };

    const onBlurHandler = () => {
        setListTextAtom(inputText.split("\n").map(problemId => ({ problemId })));
    };

    return (
        <div className="mb-4">
            <Label htmlFor="manualProblemList" className="block text-sm font-medium text-gray-700">Adicionar Problemas</Label>
            <Textarea
                id="manualProblemList"
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
                value={inputText}
                rows={20} />
        </div>
    );
}
export default ManualProblemAddComponent;
