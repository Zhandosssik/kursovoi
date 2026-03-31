import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    // Егер токен немесе қолданушы жоқ болса, бірден кіру бетіне бағыттау
    if (!user && !token) {
        return <Navigate to="/login" replace />;
    }

    // Рұқсат болса, сұраған бетті ашу
    return children;
}

export default ProtectedRoute;