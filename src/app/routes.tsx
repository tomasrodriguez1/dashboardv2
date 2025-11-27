/**
 * Configuración de rutas de la aplicación.
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AccessGate } from './pages/AccessGate';
import { DashboardPage } from './pages/DashboardPage';
import { hasAccess } from '@domain/security';

// Componente de ruta protegida
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!hasAccess()) {
    return <Navigate to="/access" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/access',
        element: <AccessGate />,
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

