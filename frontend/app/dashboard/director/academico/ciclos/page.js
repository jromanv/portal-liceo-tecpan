'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function CiclosEscolaresPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Ciclos Escolares</h1>
                    <p className="text-gray-600 mt-2">Gestiona los ciclos escolares del instituto</p>
                </div>

                <GestionCiclos />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// ========================================
// COMPONENTE: Gestión de Ciclos Escolares
// ========================================
function GestionCiclos() {
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModalCiclo, setShowModalCiclo] = useState(false);
    const [formData, setFormData] = useState({
        anio: new Date().getFullYear() + 1,
        fecha_inicio: '',
        fecha_fin: '',
        activo: false
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
        cargarCiclos();
    }, []);

    const cargarCiclos = async () => {
        try {
            const response = await axios.get('/academico/ciclos');
            setCiclos(response.data.data);
        } catch (error) {
            console.error('Error al cargar ciclos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/academico/ciclos', formData);
            setModalNotification({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Ciclo escolar creado exitosamente',
                variant: 'success'
            });
            setShowModalCiclo(false);
            cargarCiclos();
            setFormData({
                anio: new Date().getFullYear() + 1,
                fecha_inicio: '',
                fecha_fin: '',
                activo: false
            });
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al crear ciclo',
                variant: 'error'
            });
        }
    };

    const activarCiclo = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Activar Ciclo Escolar?',
            message: 'Al activar este ciclo escolar, todos los demás ciclos se desactivarán automáticamente.',
            onConfirm: async () => {
                try {
                    await axios.put(`/academico/ciclos/${id}/activar`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Ciclo activado exitosamente',
                        variant: 'success'
                    });
                    cargarCiclos();
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al activar ciclo',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const eliminarCiclo = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Eliminar Ciclo Escolar?',
            message: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este ciclo escolar?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/academico/ciclos/${id}`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Ciclo eliminado exitosamente',
                        variant: 'success'
                    });
                    cargarCiclos();
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al eliminar ciclo',
                        variant: 'error'
                    });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Header con botón */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Ciclos Escolares</h2>
                <button
                    onClick={() => setShowModalCiclo(true)}
                    className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition text-sm sm:text-base"
                >
                    + Nuevo Ciclo
                </button>
            </div>

            {/* Lista de ciclos */}
            {ciclos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-base sm:text-lg mb-2">No hay ciclos escolares creados</p>
                    <p className="text-xs sm:text-sm">Crea el primer ciclo para empezar</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ciclos.map(ciclo => (
                        <div
                            key={ciclo.id}
                            className={`border rounded-lg p-4 ${ciclo.activo ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-base sm:text-lg font-semibold">Ciclo {ciclo.anio}</h3>
                                        {ciclo.activo && (
                                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                ACTIVO
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                        {new Date(ciclo.fecha_inicio).toLocaleDateString('es-GT')} -{' '}
                                        {new Date(ciclo.fecha_fin).toLocaleDateString('es-GT')}
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    {!ciclo.activo && (
                                        <button
                                            onClick={() => activarCiclo(ciclo.id)}
                                            className="flex-1 sm:flex-none text-xs sm:text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            Activar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => eliminarCiclo(ciclo.id)}
                                        className="flex-1 sm:flex-none text-xs sm:text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para crear ciclo */}
            <Modal
                isOpen={showModalCiclo}
                onClose={() => setShowModalCiclo(false)}
                title="Crear Ciclo Escolar"
                showIcon={true}
                icon="add"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                        <input
                            type="number"
                            value={formData.anio}
                            onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                        <input
                            type="date"
                            value={formData.fecha_inicio}
                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
                        <input
                            type="date"
                            value={formData.fecha_fin}
                            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.activo}
                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Activar este ciclo</span>
                        </label>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModalCiclo(false)}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm sm:text-base"
                        >
                            Crear
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
