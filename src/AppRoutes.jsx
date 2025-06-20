// frontend/src/AppRoutes.jsx

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import AdminLogin from './pages/auth/AdminLogin';
import WorkerLogin from './pages/auth/WorkerLogin';
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDepartments from './pages/admin/ManageDepartments'
import ManageWorkers from './pages/admin/ManageWorkers';
import GenerateQuestions from './pages/admin/GenerateQuestions';
import QuestionHistory from './pages/admin/QuestionHistory'; // Import new component
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTestPage from './pages/worker/WorkerTestPage';
import ScoreboardPage from './pages/ScoreboardPage';
import NotFound from './pages/NotFound';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import WorkerLayout from './layouts/WorkerLayout';
import Loader from './components/common/Loader';

function AppRoutes() {
    const { user, isLoading } = useAuth(); // Correctly uses isLoading
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            const publicPaths = ['/', '/admin/login', '/worker/login', '/scoreboard'];
            const currentPath = window.location.pathname;

            const isPublic = publicPaths.some(path => currentPath === path || (currentPath.startsWith(path) && (currentPath.length === path.length || currentPath[path.length] === '/')));

            if (!isPublic) {
                navigate('/');
            }
        }
    }, [isLoading, user, navigate]);

    if (isLoading) {
        return <Loader />;
    }
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
            <Route path="/worker/login" element={<AuthLayout><WorkerLogin /></AuthLayout>} />
            <Route
                path="/admin/*"
                element={user && user.role === 'admin' ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
            >
                <Route index element={<AdminDashboard />} />
                <Route path="departments" element={<ManageDepartments />} />
                <Route path="workers" element={<ManageWorkers />} />
                <Route path="questions" element={<GenerateQuestions />} />
                <Route path="question-history" element={<QuestionHistory />} />
            </Route>
            {/* Corrected Worker Routes */}
            <Route
                path="/worker/*"
                element={user && user.role === 'worker' ? <WorkerLayout /> : <Navigate to="/worker/login" replace />}
            >
                <Route index element={<WorkerDashboard />} /> {/* WorkerDashboard is now the default child of WorkerLayout */}
                <Route path=":workerId/test/:departmentId" element={<WorkerTestPage />} />
            </Route>
            {/* End Corrected Worker Routes */}
            <Route path="/scoreboard" element={<ScoreboardPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
export default AppRoutes;