'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function GestionAcademicaPage() {
    const { user } = useAuth();
    const [vista, setVista] = useState('ciclos');

    const menuItems = [
        { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
        { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
        { href: '/dashboard/director/academico', iconType: 'book', label: 'Gestión Académica' },
    ];

    return (
        <ProtectedRoute allowedRoles={['director']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión Académica</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                        Administra ciclos escolares, grados, cursos y horarios
                    </p>
                </div>

                {/* Navegación de pestañas */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex flex-wrap px-4 sm:px-6" aria-label="Tabs">
                            <TabButton
                                active={vista === 'ciclos'}
                                onClick={() => setVista('ciclos')}
                                label="Ciclos Escolares"
                            />
                            <TabButton
                                active={vista === 'grados'}
                                onClick={() => setVista('grados')}
                                label="Grados"
                            />
                            <TabButton
                                active={vista === 'cursos'}
                                onClick={() => setVista('cursos')}
                                label="Cursos"
                            />
                            <TabButton
                                active={vista === 'horarios'}
                                onClick={() => setVista('horarios')}
                                label="Horarios"
                            />
                            <TabButton
                                active={vista === 'inscripciones'}
                                onClick={() => setVista('inscripciones')}
                                label="Inscripciones"
                            />
                        </nav>
                    </div>
                </div>

                {/* Contenido según la vista */}
                <div className="bg-white rounded-lg shadow-md">
                    {vista === 'ciclos' && <GestionCiclos />}
                    {vista === 'grados' && <GestionGrados />}
                    {vista === 'cursos' && <GestionCursos />}
                    {vista === 'horarios' && <GestionHorarios />}
                    {vista === 'inscripciones' && <GestionInscripciones />}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// Componente de botón de pestaña
function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${active
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
        >
            {label}
        </button>
    );
}

// ========================================
// COMPONENTE: Gestión de Ciclos Escolares
// ========================================
function GestionCiclos() {
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [showModal, setShowModal] = useState(false);
    const [showModalCiclo, setShowModalCiclo] = useState(false);
    const [formData, setFormData] = useState({
        anio: new Date().getFullYear() + 1,
        fecha_inicio: '',
        fecha_fin: '',
        activo: false
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
            alert('Ciclo escolar creado exitosamente');
            setShowModal(false);
            cargarCiclos();
            setFormData({
                anio: new Date().getFullYear() + 1,
                fecha_inicio: '',
                fecha_fin: '',
                activo: false
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Error al crear ciclo');
        }
    };

    const activarCiclo = async (id) => {
        if (!confirm('¿Activar este ciclo escolar? Los demás se desactivarán.')) return;
        try {
            await axios.put(`/academico/ciclos/${id}/activar`);
            alert('Ciclo activado exitosamente');
            cargarCiclos();
        } catch (error) {
            alert('Error al activar ciclo');
        }
    };

    const eliminarCiclo = async (id) => {
        if (!confirm('¿Eliminar este ciclo escolar? Esta acción no se puede deshacer.')) return;
        try {
            await axios.delete(`/academico/ciclos/${id}`);
            alert('Ciclo eliminado');
            cargarCiclos();
        } catch (error) {
            alert('Error al eliminar ciclo');
        }
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
                    // onClick={() => setShowModal(true)}
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
                            onClick={() => setShowModal(false)}
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
        </div>
    );
}

// ========================================
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
                alert('Grado actualizado');
            } else {
                await axios.post('/academico/grados', formGrado);
                alert('Grado creado');
            }
            setShowModalGrado(false);
            setFormGrado({ nombre: '', nivel: 'básico' });
            setModoEdicion(false);
            setGradoSeleccionado(null);
            cargarDatos();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar grado');
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
            alert('Grado activado para el ciclo');
            setShowModalActivar(false);
            setFormActivar({ gradoId: '', jornada: 'matutina', plan: 'diario' });
            cargarDatos();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al activar grado');
        }
    };

    const handleDesactivarGrado = async (id) => {
        if (!confirm('¿Desactivar este grado del ciclo actual?')) return;
        try {
            await axios.put(`/academico/grados-ciclo/${id}/desactivar`);
            alert('Grado desactivado');
            cargarDatos();
        } catch (error) {
            alert('Error al desactivar grado');
        }
    };

    const handleEliminarGrado = async (id) => {
        if (!confirm('¿Eliminar este grado? Esta acción no se puede deshacer.')) return;
        try {
            await axios.delete(`/academico/grados/${id}`);
            alert('Grado eliminado');
            cargarDatos();
        } catch (error) {
            alert('Error al eliminar grado');
        }
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
                <p className="text-red-600 text-lg">⚠️ No hay ciclo escolar activo</p>
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
                                            <span>📚 {gc.nivel}</span>
                                            <span>🕐 {gc.jornada}</span>
                                            <span>📅 {gc.plan}</span>
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
        </div>
    );
}

// ========================================
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
                alert('Curso actualizado');
            } else {
                await axios.post('/academico/cursos', formCurso);
                alert('Curso creado');
            }
            setShowModalCurso(false);
            setFormCurso({ nombre: '', descripcion: '' });
            setModoEdicion(false);
            setCursoSeleccionado(null);
            cargarDatos();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar curso');
        }
    };

    const handleAsignarCurso = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/academico/cursos-grado', {
                cursoId: parseInt(formAsignar.cursoId),
                gradoCicloId: parseInt(formAsignar.gradoCicloId)
            });
            alert('Curso asignado al grado');
            setShowModalAsignar(false);
            setFormAsignar({ cursoId: '', gradoCicloId: '' });
            if (gradoSeleccionado) {
                cargarCursosGrado(gradoSeleccionado.id);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error al asignar curso');
        }
    };

    const handleQuitarCurso = async (id) => {
        if (!confirm('¿Quitar este curso del grado?')) return;
        try {
            await axios.delete(`/academico/cursos-grado/${id}`);
            alert('Curso quitado del grado');
            if (gradoSeleccionado) {
                cargarCursosGrado(gradoSeleccionado.id);
            }
        } catch (error) {
            alert('Error al quitar curso');
        }
    };

    const handleEliminarCurso = async (id) => {
        if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return;
        try {
            await axios.delete(`/academico/cursos/${id}`);
            alert('Curso eliminado');
            cargarDatos();
        } catch (error) {
            alert('Error al eliminar curso');
        }
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
            alert('Selecciona un grado primero');
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
                <p className="text-red-600 text-lg">⚠️ No hay ciclo escolar activo</p>
                <p className="text-gray-600 text-sm mt-2">Activa un ciclo en la pestaña "Ciclos Escolares"</p>
            </div>
        );
    }

    if (gradosCiclo.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-orange-600 text-lg">⚠️ No hay grados activos en el ciclo</p>
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
        </div>
    );
}

// ========================================
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
                alert('Bloque actualizado');
            } else {
                await axios.post('/academico/horarios', {
                    gradoCicloId: gradoSeleccionado.id,
                    cursoId: parseInt(formBloque.cursoId),
                    diaSemana: parseInt(formBloque.dia_semana),
                    horaInicio: formBloque.hora_inicio,
                    horaFin: formBloque.hora_fin
                });
                alert('Bloque creado');
            }
            setShowModal(false);
            setFormBloque({ dia_semana: '1', hora_inicio: '', hora_fin: '', cursoId: '' });
            setModoEdicion(false);
            setBloqueSeleccionado(null);
            seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            console.error('Error completo:', error.response?.data);
            alert(error.response?.data?.message || 'Error al guardar bloque');
        }
    };

    const handleEliminarBloque = async (id) => {
        if (!confirm('¿Eliminar este bloque del horario?')) return;
        try {
            await axios.delete(`/academico/horarios/${id}`);
            alert('Bloque eliminado');
            seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            alert('Error al eliminar bloque');
        }
    };

    const abrirModalCrear = () => {
        if (!gradoSeleccionado) {
            alert('Selecciona un grado primero');
            return;
        }
        if (cursosGrado.length === 0) {
            alert('Este grado no tiene cursos asignados. Ve a la pestaña "Cursos" para asignar cursos primero.');
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
                <p className="text-red-600 text-lg">⚠️ No hay ciclo escolar activo</p>
                <p className="text-gray-600 text-sm mt-2">Activa un ciclo en la pestaña "Ciclos Escolares"</p>
            </div>
        );
    }

    if (gradosCiclo.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-orange-600 text-lg">⚠️ No hay grados activos en el ciclo</p>
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
        </div>
    );
}

// ========================================
// COMPONENTE: Gestión de Inscripciones
// ========================================
function GestionInscripciones() {
    const [gradosCiclo, setGradosCiclo] = useState([]);
    const [cicloActivo, setCicloActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
    const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]); // ⭐ NUEVO
    const [inscribiendo, setInscribiendo] = useState(false); // ⭐ NUEVO
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [historial, setHistorial] = useState([]);

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

    // ⭐ NUEVO: Inscribir estudiantes seleccionados
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

            alert(`Inscripción completada:\n✓ Exitosos: ${exitosos}\n✗ Fallidos: ${fallidos}`);

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
        if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;
        try {
            await axios.put(`/academico/inscripciones/${inscripcionId}/estado`, {
                estado: nuevoEstado
            });
            alert('Estado actualizado');
            seleccionarGrado(gradoSeleccionado);
        } catch (error) {
            alert('Error al cambiar estado');
        }
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
                <p className="text-red-600 text-lg">⚠️ No hay ciclo escolar activo</p>
                <p className="text-gray-600 text-sm mt-2">Activa un ciclo en la pestaña "Ciclos Escolares"</p>
            </div>
        );
    }

    if (gradosCiclo.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-orange-600 text-lg">⚠️ No hay grados activos en el ciclo</p>
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
                                    {console.log('👥 Estudiantes disponibles:', estudiantesDisponibles)}
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
        </div>
    );
}