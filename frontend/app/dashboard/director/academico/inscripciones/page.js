'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

export default function InscripcionesPage() {
    const { user } = useAuth();

    const [cicloActivo, setCicloActivo] = useState(null);
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
    const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
    const [estudiantesInscritos, setEstudiantesInscritos] = useState([]);
    const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
        { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
        {
            iconType: 'book',
            label: 'Gestión Académica',
            submenu: [
                { href: '/dashboard/director/academico/ciclos', label: 'Ciclos Escolares' },
                { href: '/dashboard/director/academico/grados', label: 'Grados' },
                { href: '/dashboard/director/academico/cursos', label: 'Cursos' },
                { href: '/dashboard/director/academico/horarios', label: 'Horarios' },
                { href: '/dashboard/director/academico/inscripciones', label: 'Inscripciones' },
                { href: '/dashboard/director/academico/asignaciones', label: 'Asignaciones' },
            ],
        },
    ];

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const cicloResponse = await axios.get('/academico/ciclos/activo');
            const ciclo = cicloResponse.data.data;
            setCicloActivo(ciclo);

            if (ciclo) {
                const gradosResponse = await axios.get(`/academico/grados-ciclo/${ciclo.id}`);
                setGradosCiclo(gradosResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            if (error.response?.status === 404) {
                setCicloActivo(null);
                setGradosCiclo([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const seleccionarGrado = async (grado) => {
        try {
            setGradoSeleccionado(grado);
            setCargandoEstudiantes(true);
            setEstudiantesDisponibles([]);
            setEstudiantesInscritos([]);
            setEstudiantesSeleccionados([]);

            const disponiblesResponse = await axios.get('/users', {
                params: {
                    rol: 'estudiante',
                    inscrito: 'false',
                    plan: grado.plan
                }
            });

            console.log('Respuesta disponibles:', disponiblesResponse.data);
            const disponibles = disponiblesResponse.data?.data?.users || [];
            console.log('Estudiantes disponibles procesados:', disponibles);
            setEstudiantesDisponibles(Array.isArray(disponibles) ? disponibles : []);


            const inscritosResponse = await axios.get(`/academico/inscripciones/grado/${grado.id}`);

            console.log('Respuesta inscritos:', inscritosResponse.data);
            const inscritos = inscritosResponse.data?.data || [];
            console.log('Estudiantes inscritos procesados:', inscritos);
            setEstudiantesInscritos(Array.isArray(inscritos) ? inscritos : []);

        } catch (error) {
            console.error('Error completo:', error);
            console.error('Response:', error.response?.data);

            setEstudiantesDisponibles([]);
            setEstudiantesInscritos([]);

            if (error.response?.status !== 404) {
                alert('Error al cargar estudiantes: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setCargandoEstudiantes(false);
        }
    };

    const seleccionarTodos = (seleccionar) => {
        if (seleccionar) {
            const todosLosIds = estudiantesDisponibles.map(est => est.id);
            setEstudiantesSeleccionados(todosLosIds);
        } else {
            setEstudiantesSeleccionados([]);
        }
    };

    const toggleEstudiante = (estudianteId) => {
        setEstudiantesSeleccionados(prev => {
            if (prev.includes(estudianteId)) {
                return prev.filter(id => id !== estudianteId);
            } else {
                return [...prev, estudianteId];
            }
        });
    };

    const inscribirSeleccionados = async () => {
        if (estudiantesSeleccionados.length === 0) {
            alert('Selecciona al menos un estudiante');
            return;
        }

        if (!confirm(`¿Inscribir ${estudiantesSeleccionados.length} estudiante(s) a ${gradoSeleccionado.nombre}?`)) {
            return;
        }

        setInscribiendo(true);

        try {
            let exitosos = 0;
            let fallidos = 0;

            for (const estudianteId of estudiantesSeleccionados) {
                try {
                    await axios.post('/academico/inscripciones', {
                        estudianteId: parseInt(estudianteId),
                        gradoCicloId: parseInt(gradoSeleccionado.id),
                        cicloId: parseInt(cicloActivo.id),
                        fechaInscripcion: new Date().toISOString().split('T')[0]
                    });
                    exitosos++;
                } catch (error) {
                    console.error('Error al inscribir:', error);
                    fallidos++;
                }
            }

            alert(`Exitosos: ${exitosos}, Fallidos: ${fallidos}`);
            setEstudiantesSeleccionados([]);
            await seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            alert('Error al inscribir estudiantes');
        } finally {
            setInscribiendo(false);
        }
    };

    const cambiarEstado = async (inscripcionId, nuevoEstado) => {
        if (!confirm(`¿Está seguro de cambiar el estado?`)) return;

        try {
            await axios.put(`/academico/inscripciones/${inscripcionId}/estado`, { estado: nuevoEstado });
            alert('Estado actualizado correctamente');
            await seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['director']}>
                <DashboardLayout user={user} menuItems={menuItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4">Cargando...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!cicloActivo) {
        return (
            <ProtectedRoute allowedRoles={['director']}>
                <DashboardLayout user={user} menuItems={menuItems}>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p>No hay ciclo escolar activo.</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['director']}>
            <DashboardLayout user={user} menuItems={menuItems}>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold">Inscripciones</h1>
                        <p className="text-gray-600">Gestiona las inscripciones de estudiantes</p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <p><span className="font-semibold">Ciclo Activo:</span> {cicloActivo.anio}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">1. Selecciona un Grado</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {gradosCiclo.map(grado => (
                                <button
                                    key={grado.id}
                                    onClick={() => seleccionarGrado(grado)}
                                    className={`p-4 border rounded-lg text-left ${gradoSeleccionado?.id === grado.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <h3 className="font-semibold">{grado.nombre}</h3>
                                    <p className="text-sm text-gray-600">{grado.nivel} - {grado.plan}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {gradoSeleccionado && (
                        <>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">2. Estudiantes Disponibles ({estudiantesDisponibles.length})</h2>
                                    {estudiantesDisponibles.length > 0 && (
                                        <button
                                            onClick={inscribirSeleccionados}
                                            disabled={estudiantesSeleccionados.length === 0 || inscribiendo}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {inscribiendo ? 'Inscribiendo...' : `Inscribir (${estudiantesSeleccionados.length})`}
                                        </button>
                                    )}
                                </div>

                                {cargandoEstudiantes ? (
                                    <p className="text-center py-8">Cargando...</p>
                                ) : estudiantesDisponibles.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No hay estudiantes disponibles</p>
                                ) : (
                                    <>
                                        <label className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                checked={estudiantesSeleccionados.length === estudiantesDisponibles.length}
                                                onChange={(e) => seleccionarTodos(e.target.checked)}
                                                className="mr-2"
                                            />
                                            Seleccionar Todos
                                        </label>

                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {estudiantesDisponibles.map(est => (
                                                <label key={est.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={estudiantesSeleccionados.includes(est.id)}
                                                        onChange={() => toggleEstudiante(est.id)}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{est.nombre} {est.apellido}</p>
                                                        <p className="text-sm text-gray-600">{est.codigo_personal}</p>
                                                        <p className="text-sm text-gray-500">{est.email}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4">3. Estudiantes Inscritos ({estudiantesInscritos.length})</h2>

                                {estudiantesInscritos.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No hay estudiantes inscritos</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {estudiantesInscritos.map(est => (
                                                    <tr key={est.inscripcion_id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{est.codigo_personal}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{est.nombre} {est.apellido}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{est.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs rounded ${est.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {est.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {est.estado === 'activo' && (
                                                                <button
                                                                    onClick={() => cambiarEstado(est.inscripcion_id, 'retirado')}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Retirar
                                                                </button>
                                                            )}
                                                            {est.estado === 'retirado' && (
                                                                <button
                                                                    onClick={() => cambiarEstado(est.inscripcion_id, 'activo')}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Activar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}