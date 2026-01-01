import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from "../layout/AppLayout.jsx";
import {useAuth} from "../../context/AuthContext";

function ProtectedRoute() {
    const {isAuthenticated, loading} = useAuth();
    
    if(loading) {
        return <div>Loading...</div>
    }
    return isAuthenticated ? (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ) : (
        <AppLayout>
            <Navigate to="/login" replace />
        </AppLayout>
    )
}

export default ProtectedRoute;