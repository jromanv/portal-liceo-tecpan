'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function GestionInscripcionesPage() {
    const { user } = useAuth();

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

    return (
        <ProtectedRoute allowedRoles={['director']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Inscripciones</h1>
                    <p className="text-gray-600 mt-2">Gestiona las inscripciones de estudiantes</p>
                </div>

                <GestionInscripciones />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// COMPONENTE: Gestión de Inscripciones
// ========================================
function GestionInscripciones() {
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [cicloActivo, setCicloActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
    const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [historial, setHistorial] = useState([]);

    // Estados para modales de confirmación y notificación
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [modalNotification, setModalNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success'
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Obtener ciclo activo
            const cicloResponse = await axios.get('/academico/ciclos/activo');
            const ciclo = cicloResponse.data.data;
            setCicloActivo(ciclo);

            // Obtener grados del ciclo activo
            if (ciclo) {
                const gradosResponse = await axios.get(`/academico/grados-ciclo/${ciclo.id}`);
                setGradosCiclo(gradosResponse.data.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            if (error.response?.status === 404) {
                setCicloActivo(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const seleccionarGrado = async (grado) => {
        setGradoSeleccionado(grado);
        setEstudiantesSeleccionados([]); // Limpiar selección

        try {
            // Cargar inscripciones del grado
            const inscripcionesResponse = await axios.get(`/academico/inscripciones/grado/${grado.id}`);
            setInscripciones(inscripcionesResponse.data.data);

            // Cargar estudiantes disponibles (mismo plan, no inscritos en este ciclo)
            const estudiantesResponse = await axios.get('/users', {
                params: {
                    rol: 'estudiante',
                    plan: grado.plan,
                    inscrito: 'false',
                    limit: 1000
                }
            });

            const estudiantes = estudiantesResponse.data?.data?.users || estudiantesResponse.data?.users || [];
            setEstudiantesDisponibles(estudiantes);
        } catch (error) {
            console.error('Error al cargar inscripciones:', error);
            setInscripciones([]);
            setEstudiantesDisponibles([]);
        }
    };

    // Toggle selección de un estudiante
    const toggleSeleccionEstudiante = (estudianteId) => {
        setEstudiantesSeleccionados(prev => {
            if (prev.includes(estudianteId)) {
                return prev.filter(id => id !== estudianteId);
            } else {
                return [...prev, estudianteId];
            }
        });
    };

    // Seleccionar/Deseleccionar todos
    const toggleSeleccionarTodos = () => {
        if (estudiantesSeleccionados.length === estudiantesDisponibles.length) {
            setEstudiantesSeleccionados([]);
        } else {
            const todosLosIds = estudiantesDisponibles.map(e => e.id);
            setEstudiantesSeleccionados(todosLosIds);
        }
    };

    // NUEVO: Inscribir estudiantes seleccionados
    const inscribirSeleccionados = async () => {
        if (estudiantesSeleccionados.length === 0) {
            alert('Selecciona al menos un estudiante');
            return;
        }

        const confirmacion = confirm(
            `¿Inscribir ${estudiantesSeleccionados.length} estudiante(s) a ${gradoSeleccionado.nombre}?`
        );

        if (!confirmacion) return;

        setInscribiendo(true);

        try {
            let exitosos = 0;
            let fallidos = 0;

            for (const estudianteId of estudiantesSeleccionados) {
                try {
                    await axios.post('/academico/inscripciones', {
                        estudianteId: estudianteId,
                        gradoCicloId: gradoSeleccionado.id,
                        cicloId: cicloActivo.id,
                        fechaInscripcion: new Date().toISOString().split('T')[0]
                    });
                    exitosos++;
                } catch (error) {
                    console.error(`Error al inscribir estudiante ${estudianteId}:`, error);
                    fallidos++;
                }
            }

            alert(`Inscripción completada:\nExitosos: ${exitosos}\nFallidos: ${fallidos}`);

            // Recargar datos
            setEstudiantesSeleccionados([]);
            seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            alert('Error al inscribir estudiantes');
        } finally {
            setInscribiendo(false);
        }
    };

    const cambiarEstado = async (inscripcionId, nuevoEstado) => {
        const estadoTexto = {
            'retirado': 'retirar',
            'graduado': 'graduar',
            'activo': 'activar'
        };

        const estadoMensaje = {
            'retirado': 'El estudiante será marcado como retirado del grado.',
            'graduado': 'El estudiante será marcado como graduado.',
            'activo': 'El estudiante será marcado como activo.'
        };

        setModalConfirm({
            isOpen: true,
            title: `¿${estadoTexto[nuevoEstado].charAt(0).toUpperCase() + estadoTexto[nuevoEstado].slice(1)} estudiante?`,
            message: estadoMensaje[nuevoEstado],
            onConfirm: async () => {
                try {
                    await axios.put(`/academico/inscripciones/${inscripcionId}/estado`, {
                        estado: nuevoEstado
                    });
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Estado actualizado exitosamente',
                        variant: 'success'
                    });
                    seleccionarGrado(gradoSeleccionado);
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al cambiar estado',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const verHistorial = async (estudiante) => {
        setEstudianteSeleccionado(estudiante);
        try {
            const response = await axios.get(`/academico/inscripciones/historial/${estudiante.estudiante_id}`);
            setHistorial(response.data.data);
            setShowModalHistorial(true);
        } catch (error) {
            console.error('Error al cargar historial:', error);
            setHistorial([]);
            setShowModalHistorial(true);
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            activo: 'bg-green-100 text-green-800',
            retirado: 'bg-red-100 text-red-800',
            graduado: 'bg-blue-100 text-blue-800'
        };
        return badges[estado] || badges.activo;
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
        );
    }

    if (!cicloActivo) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600 text-lg">No hay ciclo escolar activo</p>
                <p className="text-gray-600 text-sm mt-2">Activa un ciclo en la pestaña "Ciclos Escolares"</p>
            </div>
        );
    }

    if (gradosCiclo.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-orange-600 text-lg">No hay grados activos en el ciclo</p>
                <p className="text-gray-600 text-sm mt-2">Activa grados en la pestaña "Grados"</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Info del ciclo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                    <strong>Ciclo Activo:</strong> {cicloActivo.anio}
                </p>
            </div>

            {/* Seleccionar Grado */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Selecciona un Grado</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {gradosCiclo.map(grado => (
                        <button
                            key={grado.id}
                            onClick={() => seleccionarGrado(grado)}
                            className={`text-left p-4 rounded-lg border-2 transition ${gradoSeleccionado?.id === grado.id
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <h3 className="font-semibold text-gray-900 text-sm">{grado.nombre}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                                {grado.nivel} • {grado.plan}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido del Grado Seleccionado */}
            {!gradoSeleccionado ? (
                <div className="text-center py-12 text-gray-400">
                    <p>← Selecciona un grado para gestionar inscripciones</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* SECCIÓN A: Estudiantes Disponibles */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                2. Estudiantes Disponibles ({estudiantesDisponibles.length})
                            </h2>
                            {estudiantesSeleccionados.length > 0 && (
                                <button
                                    onClick={inscribirSeleccionados}
                                    disabled={inscribiendo}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm disabled:opacity-50"
                                >
                                    {inscribiendo
                                        ? 'Inscribiendo...'
                                        : `Inscribir ${estudiantesSeleccionados.length} Seleccionado(s)`
                                    }
                                </button>
                            )}
                        </div>

                        {estudiantesDisponibles.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                <p>No hay estudiantes disponibles para inscribir</p>
                                <p className="text-sm mt-2">Todos los estudiantes de este plan ya están inscritos</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200">
                                {/* Header con checkbox "Seleccionar todos" */}
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={estudiantesSeleccionados.length === estudiantesDisponibles.length}
                                        onChange={toggleSeleccionarTodos}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Seleccionar Todos ({estudiantesDisponibles.length})
                                    </span>
                                </div>

                                {/* Lista de estudiantes */}
                                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                    {console.log('Estudiantes disponibles:', estudiantesDisponibles)}
                                    {estudiantesDisponibles.map(estudiante => (
                                        <div key={estudiante.id} className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={estudiantesSeleccionados.includes(estudiante.id)}
                                                onChange={() => toggleSeleccionEstudiante(estudiante.id)}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {estudiante.nombre} {estudiante.apellido}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {estudiante.codigo_personal} • {estudiante.email}
                                                </p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                {estudiante.plan}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN B: Estudiantes Inscritos */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            3. Estudiantes Inscritos ({inscripciones.length})
                        </h2>

                        {inscripciones.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                <p>No hay estudiantes inscritos en este grado</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Código</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Estudiante</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Email</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Estado</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inscripciones.map(inscripcion => (
                                            <tr key={inscripcion.id} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                                    {inscripcion.codigo_personal}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                                    {inscripcion.nombre} {inscripcion.apellido}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                                    {inscripcion.email}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${getEstadoBadge(inscripcion.estado)}`}>
                                                        {inscripcion.estado}
                                                    </span>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => verHistorial(inscripcion)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs"
                                                        >
                                                            Historial
                                                        </button>
                                                        {inscripcion.estado === 'activo' && (
                                                            <>
                                                                <button
                                                                    onClick={() => cambiarEstado(inscripcion.id, 'retirado')}
                                                                    className="text-orange-600 hover:text-orange-800 text-xs"
                                                                >
                                                                    Retirar
                                                                </button>
                                                                <button
                                                                    onClick={() => cambiarEstado(inscripcion.id, 'graduado')}
                                                                    className="text-green-600 hover:text-green-800 text-xs"
                                                                >
                                                                    Graduar
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Historial */}
            {showModalHistorial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-4">
                            Historial de {estudianteSeleccionado?.nombre} {estudianteSeleccionado?.apellido}
                        </h3>
                        {historial.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hay historial disponible</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {historial.map(h => (
                                    <div key={h.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Ciclo {h.ciclo_anio}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {h.grado_nombre} ({h.nivel})
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {h.jornada} • {h.plan}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded ${getEstadoBadge(h.estado)}`}>
                                                {h.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setShowModalHistorial(false)}
                            className="w-full mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            <Modal
                isOpen={modalConfirm.isOpen}
                onClose={() => setModalConfirm({ ...modalConfirm, isOpen: false })}
                title={modalConfirm.title}
                message={modalConfirm.message}
                variant="confirm"
                showIcon={true}
                icon="warning"
                onConfirm={modalConfirm.onConfirm}
                confirmText="Sí, continuar"
                cancelText="Cancelar"
                maxWidth="max-w-md"
            />

            {/* Modal de Notificación */}
            <Modal
                isOpen={modalNotification.isOpen}
                onClose={() => setModalNotification({ ...modalNotification, isOpen: false })}
                title={modalNotification.title}
                message={modalNotification.message}
                variant={modalNotification.variant}
                showIcon={true}
                maxWidth="max-w-md"
            />
        </div>
    );
}
