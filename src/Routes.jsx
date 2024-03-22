import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Sidebar from './components/Sidebar';
import ListProblemPage from './pages/ProblemsPage/ListProblemPage';
import EditProblemPage from './pages/ProblemsPage/EditProblemPage';
import CreateContestPage from './pages/ContestPage/CreateContestPage';

const App = () => {
    return (
        <BrowserRouter>
            <div className='flex'>
                <div className="w-64">
                    <Sidebar />
                </div>
                <div className='flex-1 p-4 ml-5 mt-1'>
                    <Routes>
                        <Route path="/admin" element={<HomePage />} />
                        <Route path="/admin/users" element={<ListProblemPage />} />
                        <Route path="/admin/roles" element={<EditProblemPage />} />
                        <Route path="/admin/management" element={<CreateContestPage />} />
                        <Route path="/admin/problems" element={<ListProblemPage />} />
                        <Route path="/admin/problems/add" element={<CreateContestPage />} />
                        <Route path="/admin/problems/edit/:problemId" element={<EditProblemPage />} />
                        <Route path="/admin/problems/rejudge" element={<CreateContestPage />} />
                        <Route path="/admin/contests/add" element={<CreateContestPage />} />
                        <Route path="/admin/contests" element={<CreateContestPage />} />
                        <Route path="/admin/logout" element={<CreateContestPage />} />
                    </Routes>
                    <div />
                </div>
            </div>

        </BrowserRouter>
    );
};

export default App;

