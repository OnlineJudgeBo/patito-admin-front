import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { SearchAdminUserComponent } from "./SearchAdminUserComponent"
import { userSelectAtom } from "../../../context/manager"
import { useAtomValue } from "jotai";

export function AddUserRuleComponent({ title }) {

    const [inputValue, setInputValue] = useState("");
    const searchText = useAtomValue(userSelectAtom);

    const handleInputChange = (e) => {
        setInputValue(e.currentTarget.value);
        console.log(e.currentTarget.value);
    };

    function miFuncionOnClick() {
        alert(searchText)
    }

    return (
        <Dialog>
            <div className="space-y-1">
                <DialogTrigger>
                    <Button variant="outline" className="bg-gray-700 text-white">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        {title}
                    </Button>
                </DialogTrigger>
            </div>
            <div className="w-full border-t border-gray-700 my-4"></div>

            <DialogContent className="sm:max-w-xl bg-white rounded-lg shadow p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="md:text-right font-medium">
                            Nombre de Usuario
                        </Label>
                        <Input
                            id="name"
                            defaultValue=""
                            onChangeCapture={handleInputChange}
                            className="col-span-1 md:col-span-3 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <Label
                            htmlFor="username"
                            className="md:text-right font-medium">
                            Username
                        </Label>
                        <SearchAdminUserComponent userId={inputValue}/>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button
                        type="submit"
                        className="ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={miFuncionOnClick}
                    >
                        Agregar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
