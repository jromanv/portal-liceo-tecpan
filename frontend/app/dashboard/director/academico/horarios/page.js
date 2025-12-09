'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function GestionHorariosPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
                    <p className="text-gray-600 mt-2">Gestiona los horarios de clases</p>
                </div>

                <GestionHorarios />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// COMPONENTE: Gestión de Horarios
// ========================================
function GestionHorarios() {
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [cicloActivo, setCicloActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [cursosGrado, setCursosGrado] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);

    const [formBloque, setFormBloque] = useState({
        dia_semana: '1',
        hora_inicio: '',
        hora_fin: '',
        cursoId: ''
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

    const diasSemana = {
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
        7: 'Domingo'
    };

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

        try {
            // Cargar horarios del grado
            const horariosResponse = await axios.get(`/academico/horarios/grado/${grado.id}`);
            setHorarios(horariosResponse.data.data);

            // Cargar cursos asignados al grado
            const cursosResponse = await axios.get(`/academico/cursos-grado/${grado.id}`);
            setCursosGrado(cursosResponse.data.data);
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            setHorarios([]);
            setCursosGrado([]);
        }
    };

    const handleCrearBloque = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await axios.put(`/academico/horarios/${bloqueSeleccionado.id}`, {
                    cursoId: parseInt(formBloque.cursoId),
                    diaSemana: parseInt(formBloque.dia_semana),
                    horaInicio: formBloque.hora_inicio,
                    horaFin: formBloque.hora_fin
                });
                setModalNotification({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Bloque actualizado exitosamente',
                    variant: 'success'
                });
            } else {
                await axios.post('/academico/horarios', {
                    gradoCicloId: gradoSeleccionado.id,
                    cursoId: parseInt(formBloque.cursoId),
                    diaSemana: parseInt(formBloque.dia_semana),
                    horaInicio: formBloque.hora_inicio,
                    horaFin: formBloque.hora_fin
                });
                setModalNotification({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Bloque creado exitosamente',
                    variant: 'success'
                });
            }
            setShowModal(false);
            setFormBloque({ dia_semana: '1', hora_inicio: '', hora_fin: '', cursoId: '' });
            setModoEdicion(false);
            setBloqueSeleccionado(null);
            seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            console.error('Error completo:', error.response?.data);
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al guardar bloque',
                variant: 'error'
            });
        }
    };

    const handleEliminarBloque = async (id) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Eliminar Bloque?',
            message: '¿Estás seguro de que deseas eliminar este bloque del horario?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/academico/horarios/${id}`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Bloque eliminado exitosamente',
                        variant: 'success'
                    });
                    seleccionarGrado(gradoSeleccionado);
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al eliminar bloque',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const abrirModalCrear = () => {
        if (!gradoSeleccionado) {
            setModalNotification({
                isOpen: true,
                title: 'Atención',
                message: 'Por favor, selecciona un grado primero',
                variant: 'info'
            });
            return;
        }
        if (cursosGrado.length === 0) {
            setModalNotification({
                isOpen: true,
                title: 'Atención',
                message: 'Este grado no tiene cursos asignados. Ve a la pestaña "Cursos" para asignar cursos primero.',
                variant: 'info'
            });
            return;
        }
        setModoEdicion(false);
        setBloqueSeleccionado(null);
        setFormBloque({ dia_semana: '1', hora_inicio: '', hora_fin: '', cursoId: '' });
        setShowModal(true);
    };

    const abrirModalEdicion = (bloque) => {
        setModoEdicion(true);
        setBloqueSeleccionado(bloque);
        setFormBloque({
            dia_semana: bloque.dia_semana.toString(),
            hora_inicio: bloque.hora_inicio,
            hora_fin: bloque.hora_fin,
            cursoId: bloque.curso_id.toString()
        });
        setShowModal(true);
    };

    // Agrupar horarios por día
    const horariosPorDia = {};
    [1, 2, 3, 4, 5, 6, 7].forEach(dia => {
        horariosPorDia[dia] = horarios
            .filter(h => h.dia_semana === dia)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    });

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

            {/* Horario del Grado */}
            {!gradoSeleccionado ? (
                <div className="text-center py-12 text-gray-400">
                    <p>← Selecciona un grado para ver su horario</p>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            2. Horario de {gradoSeleccionado.nombre}
                        </h2>
                        <button
                            onClick={abrirModalCrear}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm"
                        >
                            + Agregar Bloque
                        </button>
                    </div>

                    {horarios.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                            <p>No hay bloques en el horario</p>
                            <p className="text-sm mt-2">Agrega el primer bloque</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Día</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Hora</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Curso</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(horariosPorDia).map(dia => {
                                        const bloques = horariosPorDia[dia];
                                        if (bloques.length === 0) return null;

                                        return bloques.map((bloque, index) => (
                                            <tr key={bloque.id} className="hover:bg-gray-50">
                                                {index === 0 && (
                                                    <td
                                                        rowSpan={bloques.length}
                                                        className="border border-gray-300 px-4 py-2 font-medium bg-gray-50"
                                                    >
                                                        {diasSemana[dia]}
                                                    </td>
                                                )}
                                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                                    {bloque.hora_inicio} - {bloque.hora_fin}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                                    {bloque.curso_nombre}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => abrirModalEdicion(bloque)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminarBloque(bloque.id)}
                                                            className="text-red-600 hover:text-red-800 text-xs"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ));
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Modal: Crear/Editar Bloque */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modoEdicion ? 'Editar Bloque' : 'Agregar Bloque al Horario'}
                showIcon={true}
                icon={modoEdicion ? "edit" : "add"}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleCrearBloque}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
                        <select
                            value={formBloque.dia_semana}
                            onChange={(e) => setFormBloque({ ...formBloque, dia_semana: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        >
                            {Object.keys(diasSemana).map(dia => (
                                <option key={dia} value={dia}>{diasSemana[dia]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio</label>
                        <input
                            type="time"
                            value={formBloque.hora_inicio}
                            onChange={(e) => setFormBloque({ ...formBloque, hora_inicio: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin</label>
                        <input
                            type="time"
                            value={formBloque.hora_fin}
                            onChange={(e) => setFormBloque({ ...formBloque, hora_fin: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                        <select
                            value={formBloque.cursoId}
                            onChange={(e) => setFormBloque({ ...formBloque, cursoId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {cursosGrado.map(curso => (
                                <option key={curso.curso_id} value={curso.curso_id}>
                                    {curso.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            {modoEdicion ? 'Actualizar' : 'Agregar'}
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
