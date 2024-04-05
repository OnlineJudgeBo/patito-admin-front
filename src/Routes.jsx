import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UseAuth from './hooks/UseAuth';
import IndexPage from './pages/IndexPage/IndexPage';
import Sidebar from './components/Sidebar';
import ListProblemPage from './pages/ProblemsPage/ListProblemPage';
import EditProblemPage from './pages/ProblemsPage/EditProblemPage';
import CreateProblemPage from './pages/ProblemsPage/CreateProblemPage';
import CreateContestPage from './pages/ContestPage/CreateContestPage';
import ListUserProfilePage from './pages/UsersPage/ListUserProfilePage';
import ListContestPage from './pages/ContestPage/ListContestPage';
import LoginPage from './pages/LoginPage/LoginPage';
import PrivateRoute from './PrivateRoute';
import UserAdminPage from './pages/Managment/Users/UserAdminPage';

const App = () => {
    const { isAuthenticated, isLoading } = UseAuth();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <BrowserRouter>
            <div className='flex'>
                {isAuthenticated && (
                    <div className="w-64">
                        <Sidebar />
                    </div>
                )}
                <div className='flex-1 p-4 ml-5 mt-1'>
                    <Routes>
                        <Route path="/admin" element={<PrivateRoute><IndexPage /></PrivateRoute>} />
                        <Route path="/admin/users" element={<PrivateRoute><ListUserProfilePage /></PrivateRoute>} />
                        <Route path="/admin/problems" element={<PrivateRoute><ListProblemPage /></PrivateRoute>} />
                        <Route path="/admin/problems/add" element={<PrivateRoute><CreateProblemPage /></PrivateRoute>} />
                        <Route path="/admin/problems/edit/:problemId" element={<PrivateRoute><EditProblemPage /></PrivateRoute>} />

                        <Route path="/admin/problems/rejudge" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />

                        <Route path="/admin/contests/add" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />
                        <Route path="/admin/contests" element={<PrivateRoute><ListContestPage /></PrivateRoute>} />

                        <Route path="/admin/management/users" element={<PrivateRoute><UserAdminPage /></PrivateRoute>} />
                        <Route path="/admin/management/roles" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />

                        <Route path="/admin/logout" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />
                        <Route path="/admin/login" element={<LoginPage />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;
