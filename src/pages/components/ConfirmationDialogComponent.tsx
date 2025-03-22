import clsx from "clsx";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    triggerLabel: string;
    triggerClassName: string;
}

const ConfirmationDialogComponent: React.FC<ConfirmationDialogProps> = ({
    title,
    description,
    confirmLabel = "Continue",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    triggerLabel,
    triggerClassName
}) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger className={clsx("text-red-600 text-sm font-semibold", triggerClassName)}>
                {triggerLabel}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmationDialogComponent