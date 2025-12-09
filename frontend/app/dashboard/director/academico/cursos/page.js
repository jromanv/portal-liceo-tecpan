'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function GestionCursosPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
                    <p className="text-gray-600 mt-2">Gestiona los cursos y asignaciones por grado</p>
                </div>

                <GestionCursos />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// COMPONENTE: Gestión de Cursos
// ========================================
function GestionCursos() {
    const [cursos, setCursos] = useState([]);
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [cicloActivo, setCicloActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModalCurso, setShowModalCurso] = useState(false);
    const [showModalAsignar, setShowModalAsignar] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
    const [cursosAsignados, setCursosAsignados] = useState([]);

    const [formCurso, setFormCurso] = useState({
        nombre: '',
        descripcion: ''
    });

    const [formAsignar, setFormAsignar] = useState({
        cursoId: '',
        gradoCicloId: ''
    });

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

            // Obtener todos los cursos
            const cursosResponse = await axios.get('/academico/cursos');
            setCursos(cursosResponse.data.data);

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

    const cargarCursosGrado = async (gradoCicloId) => {
        try {
            const response = await axios.get(`/academico/cursos-grado/${gradoCicloId}`);
            setCursosAsignados(response.data.data);
        } catch (error) {
            console.error('Error al cargar cursos del grado:', error);
            setCursosAsignados([]);
        }
    };

    const handleCrearCurso = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await axios.put(`/academico/cursos/${cursoSeleccionado.id}`, formCurso);
                setModalNotification({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Curso actualizado exitosamente',
                    variant: 'success'
                });
            } else {
                await axios.post('/academico/cursos', formCurso);
                setModalNotification({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Curso creado exitosamente',
                    variant: 'success'
                });
            }
            setShowModalCurso(false);
            setFormCurso({ nombre: '', descripcion: '' });
            setModoEdicion(false);
            setCursoSeleccionado(null);
            cargarDatos();
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al guardar curso',
                variant: 'error'
            });
        }
    };

    const handleAsignarCurso = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/academico/cursos-grado', {
                cursoId: parseInt(formAsignar.cursoId),
                gradoCicloId: parseInt(formAsignar.gradoCicloId)
            });
            setModalNotification({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Curso asignado al grado exitosamente',
                variant: 'success'
            });
            setShowModalAsignar(false);
            setFormAsignar({ cursoId: '', gradoCicloId: '' });
            if (gradoSeleccionado) {
                cargarCursosGrado(gradoSeleccionado.id);
            }
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al asignar curso',
                variant: 'error'
            });
        }
    };

    const handleQuitarCurso = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Quitar Curso?',
            message: '¿Estás seguro de que deseas quitar este curso del grado?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/academico/cursos-grado/${id}`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Curso quitado del grado exitosamente',
                        variant: 'success'
                    });
                    if (gradoSeleccionado) {
                        cargarCursosGrado(gradoSeleccionado.id);
                    }
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al quitar curso',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const handleEliminarCurso = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Eliminar Curso?',
            message: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este curso?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/academico/cursos/${id}`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Curso eliminado exitosamente',
                        variant: 'success'
                    });
                    cargarDatos();
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al eliminar curso',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const abrirModalEdicion = (curso) => {
        setModoEdicion(true);
        setCursoSeleccionado(curso);
        setFormCurso({
            nombre: curso.nombre,
            descripcion: curso.descripcion || ''
        });
        setShowModalCurso(true);
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setCursoSeleccionado(null);
        setFormCurso({ nombre: '', descripcion: '' });
        setShowModalCurso(true);
    };

    const seleccionarGrado = (grado) => {
        setGradoSeleccionado(grado);
        cargarCursosGrado(grado.id);
    };

    const abrirModalAsignar = () => {
        if (!gradoSeleccionado) {
            setModalNotification({
                isOpen: true,
                title: 'Atención',
                message: 'Por favor, selecciona un grado primero',
                variant: 'info'
            });
            return;
        }
        setFormAsignar({ cursoId: '', gradoCicloId: gradoSeleccionado.id });
        setShowModalAsignar(true);
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

    // Cursos ya asignados al grado seleccionado
    const cursosAsignadosIds = cursosAsignados.map(ca => ca.curso_id);
    const cursosDisponibles = cursos.filter(curso => !cursosAsignadosIds.includes(curso.id));

    return (
        <div className="p-4 sm:p-6">
            {/* Info del ciclo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                    <strong>Ciclo Activo:</strong> {cicloActivo.anio}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda: Seleccionar Grado */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Selecciona un Grado</h2>
                    <div className="space-y-2">
                        {gradosCiclo.map(grado => (
                            <button
                                key={grado.id}
                                onClick={() => seleccionarGrado(grado)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition ${gradoSeleccionado?.id === grado.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <h3 className="font-semibold text-gray-900">{grado.nombre}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {grado.nivel} • {grado.jornada} • {grado.plan}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Cursos del Grado */}
                <div>
                    {!gradoSeleccionado ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>← Selecciona un grado para ver sus cursos</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    2. Cursos de {gradoSeleccionado.nombre}
                                </h2>
                                <button
                                    onClick={abrirModalAsignar}
                                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm"
                                >
                                    + Asignar Curso
                                </button>
                            </div>

                            {cursosAsignados.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                    <p>No hay cursos asignados a este grado</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {cursosAsignados.map(ca => (
                                        <div
                                            key={ca.id}
                                            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                                        >
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{ca.nombre}</h3>
                                                {ca.descripcion && (
                                                    <p className="text-sm text-gray-600 mt-1">{ca.descripcion}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleQuitarCurso(ca.id)}
                                                className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Sección: Todos los Cursos */}
            <div className="mt-8 border-t pt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Todos los Cursos</h2>
                    <button
                        onClick={abrirModalCrear}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm"
                    >
                        + Nuevo Curso
                    </button>
                </div>

                {cursos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay cursos creados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cursos.map(curso => (
                            <div key={curso.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900">{curso.nombre}</h3>
                                {curso.descripcion && (
                                    <p className="text-sm text-gray-600 mt-1">{curso.descripcion}</p>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => abrirModalEdicion(curso)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminarCurso(curso.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Crear/Editar Curso */}
            <Modal
                isOpen={showModalCurso}
                onClose={() => setShowModalCurso(false)}
                title={modoEdicion ? "Editar Curso" : "Crear Curso"}
                showIcon={true}
                icon={modoEdicion ? "edit" : "add"}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleCrearCurso}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Curso
                        </label>
                        <input
                            type="text"
                            value={formCurso.nombre}
                            onChange={(e) => setFormCurso({ ...formCurso, nombre: e.target.value })}
                            placeholder="Ej: Matemáticas"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={formCurso.descripcion}
                            onChange={(e) => setFormCurso({ ...formCurso, descripcion: e.target.value })}
                            placeholder="Breve descripción del curso"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            rows="3"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModalCurso(false)}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                        >
                            {modoEdicion ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Asignar Curso a Grado */}
            <Modal
                isOpen={showModalAsignar}
                onClose={() => setShowModalAsignar(false)}
                title={`Asignar Curso a ${gradoSeleccionado?.nombre}`}
            >
                <form onSubmit={handleAsignarCurso}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Curso
                        </label>
                        <select
                            value={formAsignar.cursoId}
                            onChange={(e) => setFormAsignar({ ...formAsignar, cursoId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {cursosDisponibles.map(curso => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModalAsignar(false)}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Asignar
                        </button>
                    </div>
                </form>
            </Modal>

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
