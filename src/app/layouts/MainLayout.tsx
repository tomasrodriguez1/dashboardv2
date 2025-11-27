/**
 * MainLayout - Layout principal con guard de autenticación.
 */

import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { hasAccess } from '@domain/security';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si no tiene acceso y no está en la página de acceso, redirigir
    if (!hasAccess() && location.pathname !== '/access') {
      navigate('/access');
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

