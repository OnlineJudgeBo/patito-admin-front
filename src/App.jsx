import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import AppRoutes from './Routes';

const App = () => {
    return (
        <>
            <Toaster />
            <AppRoutes />
        </>
    );
};

export default App;
