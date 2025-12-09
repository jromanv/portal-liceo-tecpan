'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';

export default function MiHorarioPage() {
    const { user } = useAuth();
    const [horarios, setHorarios] = useState([]);
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

    const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    useEffect(() => {
        cargarInfo();
    }, []);

    const cargarInfo = async () => {
        try {
            const response = await axios.get('/academico/estudiante/mi-info');
            const data = response.data.data;
            setGrado(data.grado);
            setHorarios(data.horarios);
        } catch (error) {
            console.error('Error al cargar información:', error);
        } finally {
            setLoading(false);
        }
    };

    const getHorariosPorDia = (dia) => {
        return horarios.filter(h => h.dia_semana.toLowerCase() === dia.toLowerCase());
    };

    const formatHora = (hora) => {
        return hora.substring(0, 5); // HH:MM
    };

    return (
        <ProtectedRoute allowedRoles={['estudiante']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Mi Horario</h1>
                    {grado && (
                        <p className="text-gray-600 mt-2">
                            {grado.nombre} • {grado.nivel} • {grado.plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana'}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando horario...</p>
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
                    </div>
                ) : horarios.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600">No hay horarios configurados para tu grado</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Día
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Horario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Curso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aula
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dias.map(dia => {
                                        const horariosDelDia = getHorariosPorDia(dia);
                                        if (horariosDelDia.length === 0) return null;

                                        return horariosDelDia.map((horario, index) => (
                                            <tr key={horario.id} className="hover:bg-gray-50">
                                                {index === 0 && (
                                                    <td
                                                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize"
                                                        rowSpan={horariosDelDia.length}
                                                    >
                                                        {dia}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div>
                                                        <p className="font-medium">{horario.curso_nombre}</p>
                                                        <p className="text-gray-500 text-xs">{horario.curso_codigo}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {horario.aula || 'N/A'}
                                                </td>
                                            </tr>
                                        ));
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Vista de tarjetas para móvil */}
                {!loading && grado && horarios.length > 0 && (
                    <div className="md:hidden mt-6 space-y-4">
                        {dias.map(dia => {
                            const horariosDelDia = getHorariosPorDia(dia);
                            if (horariosDelDia.length === 0) return null;

                            return (
                                <div key={dia} className="bg-white rounded-lg shadow-md p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">{dia}</h3>
                                    <div className="space-y-3">
                                        {horariosDelDia.map(horario => (
                                            <div key={horario.id} className="border-l-4 border-primary pl-3">
                                                <p className="text-sm font-medium text-gray-900">{horario.curso_nombre}</p>
                                                <p className="text-xs text-gray-500">{horario.curso_codigo}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                                                </p>
                                                {horario.aula && (
                                                    <p className="text-xs text-gray-500">Aula: {horario.aula}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
