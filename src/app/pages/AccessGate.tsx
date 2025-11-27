/**
 * Página AccessGate - pantalla de ingreso con clave hardcodeada.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAccessKey, grantAccess } from '@domain/security';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';

export function AccessGate() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (validateAccessKey(key)) {
      grantAccess();
      navigate('/');
    } else {
      setError('Clave de acceso incorrecta');
      setKey('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <CardHeader>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Ejecutivo
              </h1>
              <p className="text-sm text-gray-600">
                Análisis de Ventas y Oportunidades
              </p>
            </div>
            <CardTitle className="text-center">Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                label="Clave de Acceso"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Ingrese la clave"
                error={error}
                autoFocus
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!key.trim()}
              >
                Ingresar
              </Button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> Esta es una capa de seguridad demostrativa.
                En producción se requeriría autenticación real con backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

