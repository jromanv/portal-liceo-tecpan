'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';

export default function CursoPage() {
    const { user } = useAuth();
    const params = useParams();
    const cursoId = params.id;

    const [infoCurso, setInfoCurso] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarInfoCurso();
    }, [cursoId]);

    const cargarInfoCurso = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/academico/cursos/${cursoId}/info`);
            setInfoCurso(response.data.data);
        } catch (error) {
            console.error('Error al cargar info del curso:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['docente']}>
                <DashboardLayout
                    userName={`${user?.nombre} ${user?.apellido}`}
                    userRole={user?.rol}
                >
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando información...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!infoCurso) {
        return (
            <ProtectedRoute allowedRoles={['docente']}>
                <DashboardLayout
                    userName={`${user?.nombre} ${user?.apellido}`}
                    userRole={user?.rol}
                >
                    <div className="p-6 text-center">
                        <p className="text-red-600">Error al cargar el curso</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const { curso, estudiantes, unidades } = infoCurso;

    return (
        <ProtectedRoute allowedRoles={['docente']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
            >
                {/* Header del Curso */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{curso.curso_nombre}</h1>
                    <p className="text-gray-600 mt-2">
                        {curso.grado_nombre} • {curso.nivel} • {curso.plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana'} • Ciclo {curso.ciclo_anio}
                    </p>
                    {curso.curso_descripcion && (
                        <p className="text-gray-500 text-sm mt-1">{curso.curso_descripcion}</p>
                    )}
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Estudiantes</p>
                                <p className="text-2xl font-bold text-gray-900">{estudiantes.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unidades</p>
                                <p className="text-2xl font-bold text-gray-900">{unidades.length}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Estado</p>
                                <p className="text-lg font-semibold text-green-600">Activo</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Estudiantes */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="p-4 bg-gray-50 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Estudiantes Inscritos ({estudiantes.length})
                        </h2>
                    </div>

                    {estudiantes.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No hay estudiantes inscritos en este grado</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estudiantes.map((estudiante) => (
                                        <tr key={estudiante.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {estudiante.codigo_personal}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {estudiante.nombre} {estudiante.apellido}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {estudiante.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${estudiante.estado_inscripcion === 'activo'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {estudiante.estado_inscripcion}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Mensaje de desarrollo */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Fase 1 Completada:</strong> Las funcionalidades de gestión de unidades y calificaciones estarán disponibles en la siguiente fase.
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}