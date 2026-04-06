import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly }) {
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    if (!user && !token) {
        return <Navigate to="/login" replace />;
    }

    if (user && adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;