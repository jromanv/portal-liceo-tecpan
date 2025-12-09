'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';

export default function MisCursosPage() {
    const { user } = useAuth();
    const [cursos, setCursos] = useState([]);
    const [grado, setGrado] = useState(null);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
        {
            iconType: 'book',
            label: grado ? `Mi Grado: ${grado.nombre}` : 'Mi Información Académica',
            submenu: [
                { href: '/dashboard/estudiante/cursos', label: 'Mis Cursos' },
                { href: '/dashboard/estudiante/horarios', label: 'Mi Horario' },
            ],
        },
        { href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' },
    ];

    useEffect(() => {
        cargarInfo();
    }, []);

    const cargarInfo = async () => {
        try {
            const response = await axios.get('/academico/estudiante/mi-info');
            const data = response.data.data;
            setGrado(data.grado);
            setCursos(data.cursos);
        } catch (error) {
            console.error('Error al cargar información:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['estudiante']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
                    {grado && (
                        <p className="text-gray-600 mt-2">
                            {grado.nombre} • {grado.nivel} • {grado.plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana'}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando cursos...</p>
                    </div>
                ) : !grado ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <svg className="w-16 h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">No estás inscrito</h3>
                        <p className="text-yellow-700">
                            No tienes una inscripción activa en el ciclo escolar actual.
                        </p>
                        <p className="text-sm text-yellow-600 mt-2">
                            Por favor, contacta a la dirección para más información.
                        </p>
                    </div>
                ) : cursos.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-gray-600">No hay cursos asignados a tu grado</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {cursos.map((curso) => (
                            <div
                                key={curso.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {curso.nombre}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Código: {curso.codigo}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 ml-3">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {curso.descripcion && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        {curso.descripcion}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
