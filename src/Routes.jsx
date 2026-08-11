import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import PrivateRoute from './PrivateRoute';
import Sidebar from './components/Sidebar';
import UseAuth from './hooks/UseAuth';
import CourseAdminDetailPage from './pages/AcademicPage/CourseAdminDetailPage';
import ListAcademicCoursePage from './pages/AcademicPage/ListAcademicCoursePage';
import LearningPathDetailPage from './pages/AcademicPage/LearningPathDetailPage';
import LearningPathListPage from './pages/AcademicPage/LearningPathListPage';
import CreateContestPage from './pages/ContestPage/CreateContestPage';
import EditContestPage from './pages/ContestPage/EditContestPage';
import ListContestPage from './pages/ContestPage/ListContestPage';
import FileManagerAcPage from './pages/FileManagerPage/FileManagerAcPage';
import FileManagerPage from './pages/FileManagerPage/FileManagerPage';
import IndexPage from './pages/IndexPage/IndexPage';
import RejudgePage from './pages/JudgePage/RejudgePage';
import LoginPage from './pages/LoginPage/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RoleManagementPage from './pages/Managment/Roles/RoleManagementPage';
import CreateProblemPage from './pages/ProblemsPage/CreateProblemPage';
import EditProblemPage from './pages/ProblemsPage/EditProblemPage';
import ListProblemPage from './pages/ProblemsPage/ListProblemPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import TopicsClassificationsPage from './pages/TopicsClassificationsPage/TopicsClassificationsPage';
import ListUserProfilePage from './pages/UsersPage/ListUserProfilePage';


const App = () => {
    const { isAuthenticated, isLoading } = UseAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <BrowserRouter>
            <div className='flex min-h-screen bg-gray-50'>
                {isAuthenticated && (
                    <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(value => !value)} />
                )}
                <main className='min-w-0 flex-1 p-4 md:p-6'>
                    <Routes>
                        <Route path="/admin" element={<PrivateRoute><IndexPage /></PrivateRoute>} />
                        <Route path="/admin/users" element={<PrivateRoute><ListUserProfilePage /></PrivateRoute>} />
                        <Route path="/admin/problems" element={<PrivateRoute><ListProblemPage /></PrivateRoute>} />

                        <Route path="/admin/schedules" element={<PrivateRoute><SchedulePage /></PrivateRoute>} />

                        <Route path="/admin/problems/add" element={<PrivateRoute><CreateProblemPage /></PrivateRoute>} />
                        <Route path="/admin/problems/edit/:problemId" element={<PrivateRoute><EditProblemPage /></PrivateRoute>} />
                        <Route path="/admin/problems/rejudge" element={<PrivateRoute><RejudgePage /></PrivateRoute>} />

                        <Route path="/admin/topicsClassifications" element={<PrivateRoute><TopicsClassificationsPage /></PrivateRoute>} />

                        <Route path="/admin/academic/courses" element={<PrivateRoute><ListAcademicCoursePage /></PrivateRoute>} />
                        <Route path="/admin/academic/courses/:courseId" element={<PrivateRoute><CourseAdminDetailPage /></PrivateRoute>} />
                        <Route path="/admin/academic/learning-paths" element={<PrivateRoute><LearningPathListPage /></PrivateRoute>} />
                        <Route path="/admin/academic/learning-paths/:pathId" element={<PrivateRoute><LearningPathDetailPage /></PrivateRoute>} />

                        <Route path="/admin/contests" element={<PrivateRoute><ListContestPage /></PrivateRoute>} />
                        <Route path="/admin/contests/add" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />
                        <Route path="/admin/contests/edit/:contestId" element={<PrivateRoute><EditContestPage /></PrivateRoute>} />

                        <Route path="/admin/management/users" element={<Navigate to="/admin/management/roles" replace />} />
                        <Route path="/admin/management/roles" element={<PrivateRoute><RoleManagementPage /></PrivateRoute>} />

                        <Route path="/admin/fileManager/:problemId" element={<PrivateRoute><FileManagerPage /></PrivateRoute>} />
                        <Route path="/admin/fileManager/:problemId/ac" element={<PrivateRoute><FileManagerAcPage /></PrivateRoute>} />

                        <Route path="/admin/logout" element={<LogoutPage />} />
                        <Route path="/admin/login" element={<LoginPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
