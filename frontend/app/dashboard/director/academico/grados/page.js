'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function GestionGradosPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Grados</h1>
                    <p className="text-gray-600 mt-2">Gestiona los grados académicos del instituto</p>
                </div>

                <GestionGrados />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// COMPONENTE: Gestión de Grados
// ========================================
function GestionGrados() {
    const [grados, setGrados] = useState([]);
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [cicloActivo, setCicloActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModalGrado, setShowModalGrado] = useState(false);
    const [showModalActivar, setShowModalActivar] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);

    const [formGrado, setFormGrado] = useState({
        nombre: '',
        nivel: 'básico'
    });

    const [formActivar, setFormActivar] = useState({
        gradoId: '',
        jornada: 'matutina',
        plan: 'diario'
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

            // Obtener todos los grados
            const gradosResponse = await axios.get('/academico/grados');
            setGrados(gradosResponse.data.data);

            // Obtener grados del ciclo activo
            if (ciclo) {
                const gradosCicloResponse = await axios.get(`/academico/grados-ciclo/${ciclo.id}`);
                setGradosCiclo(gradosCicloResponse.data.data);
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

    const handleCrearGrado = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await axios.put(`/academico/grados/${gradoSeleccionado.id}`, formGrado);
                setModalNotification({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Grado actualizado exitosamente',
                    variant: 'success'
                });
            } else {
                await axios.post('/academico/grados', formGrado);
                setModalNotification({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Grado creado exitosamente',
                    variant: 'success'
                });
            }
            setShowModalGrado(false);
            setFormGrado({ nombre: '', nivel: 'básico' });
            setModoEdicion(false);
            setGradoSeleccionado(null);
            cargarDatos();
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al guardar grado',
                variant: 'error'
            });
        }
    };

    const handleActivarGrado = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/academico/grados-ciclo', {
                gradoId: parseInt(formActivar.gradoId),
                cicloId: cicloActivo.id,
                jornada: formActivar.jornada,
                plan: formActivar.plan
            });
            setModalNotification({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Grado activado para el ciclo exitosamente',
                variant: 'success'
            });
            setShowModalActivar(false);
            setFormActivar({ gradoId: '', jornada: 'matutina', plan: 'diario' });
            cargarDatos();
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al activar grado',
                variant: 'error'
            });
        }
    };

    const handleDesactivarGrado = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Desactivar Grado?',
            message: '¿Estás seguro de que deseas desactivar este grado del ciclo actual?',
            onConfirm: async () => {
                try {
                    await axios.put(`/academico/grados-ciclo/${id}/desactivar`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Grado desactivado exitosamente',
                        variant: 'success'
                    });
                    cargarDatos();
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al desactivar grado',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const handleEliminarGrado = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Eliminar Grado?',
            message: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este grado?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/academico/grados/${id}`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Grado eliminado exitosamente',
                        variant: 'success'
                    });
                    cargarDatos();
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al eliminar grado',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const abrirModalEdicion = (grado) => {
        setModoEdicion(true);
        setGradoSeleccionado(grado);
        setFormGrado({
            nombre: grado.nombre,
            nivel: grado.nivel
        });
        setShowModalGrado(true);
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setGradoSeleccionado(null);
        setFormGrado({ nombre: '', nivel: 'básico' });
        setShowModalGrado(true);
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

    // Filtrar grados que NO están en el ciclo actual
    const gradosDisponibles = grados.filter(
        grado => !gradosCiclo.some(gc => gc.grado_id === grado.id)
    );

    return (
        <div className="p-4 sm:p-6">
            {/* Info del ciclo activo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                    <strong>Ciclo Activo:</strong> {cicloActivo.anio}
                </p>
            </div>

            {/* Sección: Grados del Ciclo Actual */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Grados del Ciclo {cicloActivo.anio}
                    </h2>
                    <button
                        onClick={() => setShowModalActivar(true)}
                        className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm"
                        disabled={gradosDisponibles.length === 0}
                    >
                        + Activar Grado
                    </button>
                </div>

                {gradosCiclo.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <p>No hay grados activos en este ciclo</p>
                        <p className="text-sm mt-2">Activa grados para comenzar</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {gradosCiclo.map(gc => (
                            <div key={gc.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{gc.nombre}</h3>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                            <span>Nivel: {gc.nivel}</span>
                                            <span>Jornada: {gc.jornada}</span>
                                            <span>Plan: {gc.plan}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDesactivarGrado(gc.id)}
                                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                                    >
                                        Desactivar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sección: Todos los Grados (Plantilla) */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Todos los Grados</h2>
                    <button
                        onClick={abrirModalCrear}
                        className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm"
                    >
                        + Nuevo Grado
                    </button>
                </div>

                {grados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay grados creados</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {grados.map(grado => (
                            <div key={grado.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{grado.nombre}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Nivel: {grado.nivel}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => abrirModalEdicion(grado)}
                                            className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminarGrado(grado.id)}
                                            className="text-red-600 hover:text-red-800 text-sm px-3 py-1"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Crear/Editar Grado */}
            <Modal
                isOpen={showModalGrado}
                onClose={() => setShowModalGrado(false)}
                title={modoEdicion ? "Editar Grado" : "Crear Grado"}
                showIcon={true}
                icon={modoEdicion ? "edit" : "add"}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleCrearGrado}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Grado
                        </label>
                        <input
                            type="text"
                            value={formGrado.nombre}
                            onChange={(e) => setFormGrado({ ...formGrado, nombre: e.target.value })}
                            placeholder="Ej: Primero Básico con Orientación en Computación A"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                        <select
                            value={formGrado.nivel}
                            onChange={(e) => setFormGrado({ ...formGrado, nivel: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="básico">Básico</option>
                            <option value="diversificado">Diversificado</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModalGrado(false)}
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

            {/* Modal: Activar Grado para Ciclo */}
            <Modal
                isOpen={showModalActivar}
                onClose={() => setShowModalActivar(false)}
                title={`Activar Grado para Ciclo ${cicloActivo.anio}`}
            >
                <form onSubmit={handleActivarGrado}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Grado</label>
                        <select
                            value={formActivar.gradoId}
                            onChange={(e) => setFormActivar({ ...formActivar, gradoId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {gradosDisponibles.map(grado => (
                                <option key={grado.id} value={grado.id}>
                                    {grado.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jornada</label>
                        <select
                            value={formActivar.jornada}
                            onChange={(e) => setFormActivar({ ...formActivar, jornada: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="matutina">Matutina</option>
                            <option value="vespertina">Vespertina</option>
                            <option value="ambas">Ambas</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                        <select
                            value={formActivar.plan}
                            onChange={(e) => setFormActivar({ ...formActivar, plan: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="diario">Diario</option>
                            <option value="fin de semana">Fin de Semana</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModalActivar(false)}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Activar
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
