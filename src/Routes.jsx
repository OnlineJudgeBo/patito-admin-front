import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Sidebar from './components/Sidebar';
import UseAuth from './hooks/UseAuth';
import CreateContestPage from './pages/ContestPage/CreateContestPage';
import EditContestPage from './pages/ContestPage/EditContestPage';
import ListContestPage from './pages/ContestPage/ListContestPage';
import FileManagerPage from './pages/FileManagerPage/FileManagerPage';
import IndexPage from './pages/IndexPage/IndexPage';
import LoginPage from './pages/LoginPage/LoginPage';
import LogoutPage from './pages/LogoutPage';
import UserAdminPage from './pages/Managment/Users/UserAdminPage';
import CreateProblemPage from './pages/ProblemsPage/CreateProblemPage';
import EditProblemPage from './pages/ProblemsPage/EditProblemPage';
import ListProblemPage from './pages/ProblemsPage/ListProblemPage';
import ListUserProfilePage from './pages/UsersPage/ListUserProfilePage';

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
                        <Route path="/admin2" element={<PrivateRoute><IndexPage /></PrivateRoute>} />
                        <Route path="/admin2/users" element={<PrivateRoute><ListUserProfilePage /></PrivateRoute>} />
                        <Route path="/admin2/problems" element={<PrivateRoute><ListProblemPage /></PrivateRoute>} />

                        <Route path="/admin2/problems/add" element={<PrivateRoute><CreateProblemPage /></PrivateRoute>} />
                        <Route path="/admin2/problems/edit/:problemId" element={<PrivateRoute><EditProblemPage /></PrivateRoute>} />
                        <Route path="/admin2/problems/rejudge" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />

                        <Route path="/admin2/contests" element={<PrivateRoute><ListContestPage /></PrivateRoute>} />
                        <Route path="/admin2/contests/add" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />
                        <Route path="/admin2/contests/edit/:contestId" element={<PrivateRoute><EditContestPage /></PrivateRoute>} />

                        <Route path="/admin2/management/users" element={<PrivateRoute><UserAdminPage /></PrivateRoute>} />
                        <Route path="/admin2/management/roles" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />

                        <Route path="/admin2/fileManager/:problemId" element={<PrivateRoute><FileManagerPage /></PrivateRoute>} />

                        <Route path="/admin2/logout" element={<LogoutPage />} />
                        <Route path="/admin2/login" element={<LoginPage />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;
