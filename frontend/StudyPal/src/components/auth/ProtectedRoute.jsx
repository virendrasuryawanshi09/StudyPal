import React from 'react'

function ProtectedRoute() {
    const isAuthenticated = true// Replace with actual authentication logic
    const loading = false // Replace with actual loading state

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