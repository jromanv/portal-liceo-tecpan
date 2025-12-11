'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function GestionAsignacionesPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Asignaciones Docente-Curso</h1>
                    <p className="text-gray-600 mt-2">Gestiona las asignaciones de docentes a cursos</p>
                </div>

                <GestionAsignaciones />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// ========================================
// COMPONENTE: Gestión de Asignaciones Docente-Curso
// ========================================
function GestionAsignaciones() {
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [cicloActivo, setCicloActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
    const [cursosGrado, setCursosGrado] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [docentesAsignados, setDocentesAsignados] = useState([]);
    const [docentesDisponibles, setDocentesDisponibles] = useState([]);
    const [showModalAsignar, setShowModalAsignar] = useState(false);
    const [loadingExport, setLoadingExport] = useState(false);
    const [loadingExportGrado, setLoadingExportGrado] = useState(false);

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
            const cicloResponse = await axios.get('/academico/ciclos/activo');
            const ciclo = cicloResponse.data.data;
            setCicloActivo(ciclo);

            if (ciclo) {
                const gradosResponse = await axios.get(`/academico/grados-ciclo/${ciclo.id}`);
                setGradosCiclo(gradosResponse.data.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setCicloActivo(null);
        } finally {
            setLoading(false);
        }
    };

    const seleccionarGrado = async (grado) => {
        setGradoSeleccionado(grado);
        setCursoSeleccionado(null);
        setDocentesAsignados([]);

        try {
            const cursosResponse = await axios.get(`/academico/cursos-grado/${grado.id}`);
            setCursosGrado(cursosResponse.data.data);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            setCursosGrado([]);
        }
    };

    const seleccionarCurso = async (curso) => {
        setCursoSeleccionado(curso);

        try {
            const docentesResponse = await axios.get(`/academico/docente-cursos/curso/${curso.id}`);
            setDocentesAsignados(docentesResponse.data.data);
        } catch (error) {
            console.error('Error al cargar docentes:', error);
            setDocentesAsignados([]);
        }
    };

    const abrirModalAsignar = async () => {
        if (!cursoSeleccionado) {
            setModalNotification({
                isOpen: true,
                title: 'Atención',
                message: 'Por favor, selecciona un curso primero',
                variant: 'info'
            });
            return;
        }

        try {
            const response = await axios.get(`/academico/docente-cursos/disponibles/${cursoSeleccionado.id}`);
            setDocentesDisponibles(response.data.data);
            setShowModalAsignar(true);
        } catch (error) {
            console.error('Error al cargar docentes disponibles:', error);
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: 'Error al cargar docentes disponibles',
                variant: 'error'
            });
        }
    };

    const asignarDocente = async (docenteId) => {
        try {
            await axios.post('/academico/docente-cursos', {
                docenteId: docenteId,
                cursoGradoCicloId: cursoSeleccionado.id
            });
            setModalNotification({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Docente asignado exitosamente',
                variant: 'success'
            });
            setShowModalAsignar(false);
            seleccionarCurso(cursoSeleccionado);
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al asignar docente',
                variant: 'error'
            });
        }
    };

    const quitarDocente = async (asignacionId) => {
        setModalConfirm({
            isOpen: true,
            title: '¿Quitar Docente?',
            message: '¿Estás seguro de que deseas quitar este docente del curso?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/academico/docente-cursos/${asignacionId}`);
                    setModalNotification({
                        isOpen: true,
                        title: '¡Éxito!',
                        message: 'Docente removido exitosamente',
                        variant: 'success'
                    });
                    seleccionarCurso(cursoSeleccionado);
                } catch (error) {
                    setModalNotification({
                        isOpen: true,
                        title: 'Error',
                        message: 'Error al quitar docente',
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

    if (!cicloActivo) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600 text-lg">No hay ciclo escolar activo</p>
                <p className="text-gray-600 text-sm mt-2">Activa un ciclo en la sección "Ciclos Escolares"</p>
            </div>
        );
    }

    // Función para descargar todas las asignaciones del ciclo
    const descargarTodasAsignaciones = async () => {
        if (!cicloActivo) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: 'No hay ciclo activo',
                variant: 'error'
            });
            return;
        }

        try {
            setLoadingExport(true);

            const response = await axios.get(
                `/academico/export/asignaciones-docentes/${cicloActivo.id}`,
                { responseType: 'blob' }
            );

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Asignaciones_Docentes_${cicloActivo.anio}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setModalNotification({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Archivo Excel generado correctamente',
                variant: 'success'
            });
        } catch (error) {
            console.error('Error al descargar Excel:', error);
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al generar el archivo Excel',
                variant: 'error'
            });
        } finally {
            setLoadingExport(false);
        }
    };

    // Función para descargar asignaciones de un grado específico
    const descargarAsignacionesGrado = async () => {
        if (!gradoSeleccionado) {
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: 'Por favor, selecciona un grado primero',
                variant: 'error'
            });
            return;
        }

        try {
            setLoadingExportGrado(true);

            const response = await axios.get(
                `/academico/export/asignaciones-grado/${gradoSeleccionado.id}`,
                { responseType: 'blob' }
            );

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const nombreArchivo = `Asignaciones_${gradoSeleccionado.nombre.replace(/\s+/g, '_')}_${cicloActivo.anio}.xlsx`;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setModalNotification({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Archivo Excel generado correctamente',
                variant: 'success'
            });
        } catch (error) {
            console.error('Error al descargar Excel:', error);
            setModalNotification({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Error al generar el archivo Excel',
                variant: 'error'
            });
        } finally {
            setLoadingExportGrado(false);
        }
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Info del ciclo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                    <strong>Ciclo Activo:</strong> {cicloActivo.anio}
                </p>
            </div>

            {/* Botón para exportar todas las asignaciones */}
            {cicloActivo && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Exportar Asignaciones</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Descarga un reporte completo de todas las asignaciones del ciclo {cicloActivo.anio}
                            </p>
                        </div>
                        <button
                            onClick={descargarTodasAsignaciones}
                            disabled={loadingExport}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingExport ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descargar Todas las Asignaciones
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Paso 1: Seleccionar Grado */}
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

            {/* Paso 2 y 3: Cursos y Docentes */}
            {gradoSeleccionado && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda: Cursos */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                2. Cursos de {gradoSeleccionado.nombre}
                            </h2>
                            <button
                                onClick={descargarAsignacionesGrado}
                                disabled={loadingExportGrado}
                                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loadingExportGrado ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        ...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                                        </svg>
                                        Exportar Grado
                                    </>
                                )}
                            </button>
                        </div>
                        {cursosGrado.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                <p>No hay cursos asignados a este grado</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cursosGrado.map(curso => (
                                    <button
                                        key={curso.id}
                                        onClick={() => seleccionarCurso(curso)}
                                        className={`w-full text-left p-3 rounded-lg border transition ${cursoSeleccionado?.id === curso.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <p className="font-medium text-gray-900 text-sm">{curso.nombre}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha: Docentes Asignados */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                3. Docentes Asignados
                            </h2>
                            {cursoSeleccionado && (
                                <button
                                    onClick={abrirModalAsignar}
                                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                                >
                                    + Asignar Docente
                                </button>
                            )}
                        </div>

                        {!cursoSeleccionado ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-400">
                                <p>← Selecciona un curso</p>
                            </div>
                        ) : docentesAsignados.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                <p>No hay docentes asignados</p>
                                <p className="text-sm mt-2">Agrega el primer docente</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {docentesAsignados.map(docente => (
                                    <div
                                        key={docente.id}
                                        className="p-3 border border-gray-200 rounded-lg flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {docente.nombre} {docente.apellido}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {docente.codigo_personal} • {docente.email}
                                            </p>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded inline-block mt-1">
                                                {docente.jornada}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => quitarDocente(docente.id)}
                                            className="text-red-600 hover:text-red-800 text-xs"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Asignar Docente */}
            {showModalAsignar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-4">
                            Asignar Docente a: {cursoSeleccionado?.nombre}
                        </h3>

                        {docentesDisponibles.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No hay docentes disponibles para asignar
                            </p>
                        ) : (
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {docentesDisponibles.map(docente => (
                                    <div
                                        key={docente.docente_id}
                                        className="p-3 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {docente.nombre} {docente.apellido}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {docente.codigo_personal} • {docente.email}
                                            </p>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded inline-block mt-1">
                                                {docente.jornada}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => asignarDocente(docente.docente_id)}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm"
                                        >
                                            Asignar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowModalAsignar(false)}
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
