'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import ActivityList from '@/components/calendar/ActivityList';
import UpcomingActivities from '@/components/calendar/UpcomingActivities';
import { useAuth } from '@/context/AuthContext';
import { getActivities } from '@/lib/api/calendar';
import { MESES } from '@/lib/utils/dateUtils';

export default function EstudianteCalendarioPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    // El estudiante solo ve el calendario de su plan
    const userPlan = user?.plan || 'diario';

    const menuItems = [
        { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
        { href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' },
    ];

    useEffect(() => {
        loadActivities();
    }, [currentDate, userPlan]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const response = await getActivities({
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1,
                plan: userPlan,
                dirigido_a: 'todos', // Estudiantes solo ven actividades para todos
            });
            setActivities(response.data);
        } catch (error) {
            console.error('Error al cargar actividades:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        setDetailModalOpen(true);
    };

    return (
        <ProtectedRoute allowedRoles={['estudiante']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Columna principal - Calendario */}
                    <div className="lg:col-span-3">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Calendario de Actividades
                            </h1>
                            <p className="text-gray-600">
                                Plan: {userPlan === 'diario' ? 'Diario' : 'Fin de Semana'} | Código:{' '}
                                {user?.codigo_personal}
                            </p>
                        </div>

                        {/* Controles superiores */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                {/* Navegación de mes */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePreviousMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </button>

                                    <h2 className="text-lg font-bold text-gray-900 min-w-[200px] text-center">
                                        {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </h2>

                                    <button
                                        onClick={handleNextMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={handleToday}
                                        className="ml-4 px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                                    >
                                        Hoy
                                    </button>
                                </div>

                                {/* Toggle vista */}
                                <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calendario o Lista */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <CalendarGrid
                                year={currentDate.getFullYear()}
                                month={currentDate.getMonth()}
                                activities={activities}
                                onActivityClick={handleActivityClick}
                            />
                        ) : (
                            <ActivityList activities={activities} onActivityClick={handleActivityClick} />
                        )}
                    </div>

                    {/* Columna lateral - Próximas actividades */}
                    <div className="lg:col-span-1">
                        <UpcomingActivities plan={userPlan} rol="estudiante" />
                    </div>
                </div>

                {/* Modal de detalle de actividad */}
                {detailModalOpen && selectedActivity && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Detalle de Actividad</h2>
                                <button
                                    onClick={() => setDetailModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Código</label>
                                    <p className="text-gray-900">{selectedActivity.codigo}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Actividad</label>
                                    <p className="text-gray-900">{selectedActivity.actividad}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Fecha</label>
                                        <p className="text-gray-900">
                                            {new Date(selectedActivity.fecha).toLocaleDateString('es-GT')}
                                        </p>
                                    </div>

                                    {selectedActivity.hora && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Hora</label>
                                            <p className="text-gray-900">{selectedActivity.hora}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedActivity.responsable && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Responsable</label>
                                        <p className="text-gray-900">{selectedActivity.responsable}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Categoría</label>
                                    <div className="flex items-center mt-1">
                                        <span
                                            className="w-4 h-4 rounded mr-2"
                                            style={{ backgroundColor: selectedActivity.categoria_color }}
                                        ></span>
                                        <span className="text-gray-900">{selectedActivity.categoria_nombre}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setDetailModalOpen(false)}
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}