import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Sidebar from './components/Sidebar';
import UseAuth from './hooks/UseAuth';
import CourseAdminDetailPage from './pages/AcademicPage/CourseAdminDetailPage';
import ListAcademicCoursePage from './pages/AcademicPage/ListAcademicCoursePage';
import CreateContestPage from './pages/ContestPage/CreateContestPage';
import EditContestPage from './pages/ContestPage/EditContestPage';
import ListContestPage from './pages/ContestPage/ListContestPage';
import FileManagerAcPage from './pages/FileManagerPage/FileManagerAcPage';
import FileManagerPage from './pages/FileManagerPage/FileManagerPage';
import IndexPage from './pages/IndexPage/IndexPage';
import LoginPage from './pages/LoginPage/LoginPage';
import LogoutPage from './pages/LogoutPage';
import UserAdminPage from './pages/Managment/Users/UserAdminPage';
import BocaImportPage from './pages/ProblemsPage/BocaImportPage';
import CreateProblemPage from './pages/ProblemsPage/CreateProblemPage';
import EditProblemPage from './pages/ProblemsPage/EditProblemPage';
import ListProblemPage from './pages/ProblemsPage/ListProblemPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import TopicsClassificationsPage from './pages/TopicsClassificationsPage/TopicsClassificationsPage';
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
                    <Sidebar />
                )}
                <main className='min-w-0 flex-1 p-4 ml-5 mt-1 transition-[width] duration-300 ease-in-out'>
                    <Routes>
                        <Route path="/admin" element={<PrivateRoute><IndexPage /></PrivateRoute>} />
                        <Route path="/admin/users" element={<PrivateRoute><ListUserProfilePage /></PrivateRoute>} />
                        <Route path="/admin/problems" element={<PrivateRoute><ListProblemPage /></PrivateRoute>} />

                        <Route path="/admin/schedules" element={<PrivateRoute><SchedulePage /></PrivateRoute>} />

                        <Route path="/admin/problems/add" element={<PrivateRoute><CreateProblemPage /></PrivateRoute>} />
                        <Route path="/admin/problems/import-boca" element={<PrivateRoute><BocaImportPage /></PrivateRoute>} />
                        <Route path="/admin/problems/edit/:problemId" element={<PrivateRoute><EditProblemPage /></PrivateRoute>} />
                        <Route path="/admin/problems/rejudge" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />

                        <Route path="/admin/topicsClassifications" element={<PrivateRoute><TopicsClassificationsPage /></PrivateRoute>} />

                        <Route path="/admin/academic/courses" element={<PrivateRoute><ListAcademicCoursePage /></PrivateRoute>} />
                        <Route path="/admin/academic/courses/:courseId" element={<PrivateRoute><CourseAdminDetailPage /></PrivateRoute>} />

                        <Route path="/admin/contests" element={<PrivateRoute><ListContestPage /></PrivateRoute>} />
                        <Route path="/admin/contests/add" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />
                        <Route path="/admin/contests/edit/:contestId" element={<PrivateRoute><EditContestPage /></PrivateRoute>} />

                        <Route path="/admin/management/users" element={<PrivateRoute><UserAdminPage /></PrivateRoute>} />
                        <Route path="/admin/management/roles" element={<PrivateRoute><CreateContestPage /></PrivateRoute>} />

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
