'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import ActivityList from '@/components/calendar/ActivityList';
import ActivityModal from '@/components/calendar/ActivityModal';
import { useAuth } from '@/context/AuthContext';
import { generateCalendarPDF } from '@/lib/utils/pdfGenerator';
import {
    getCategories,
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForPDF,
} from '@/lib/api/calendar';
import { MESES } from '@/lib/utils/dateUtils';

export default function DirectorCalendarioPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPlan, setSelectedPlan] = useState('diario');
    const [categories, setCategories] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

    const menuItems = [
        { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
        { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadActivities();
    }, [currentDate, selectedPlan]);

    // Detectar tamaño de pantalla para cambiar vista automáticamente
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('list');
            } else {
                setViewMode('grid');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const loadActivities = async () => {
        try {
            setLoading(true);
            const response = await getActivities({
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1,
                plan: selectedPlan,
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

    const handleCreateActivity = () => {
        setSelectedActivity(null);
        setModalOpen(true);
    };

    const handleEditActivity = (activity) => {
        setSelectedActivity(activity);
        setModalOpen(true);
    };

    const handleSaveActivity = async (activityData) => {
        try {
            if (selectedActivity) {
                await updateActivity(selectedActivity.id, activityData);
            } else {
                await createActivity(activityData);
            }
            await loadActivities();
            setModalOpen(false);
            setSelectedActivity(null);
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!confirm('¿Estás seguro de eliminar esta actividad?')) {
            return;
        }

        try {
            await deleteActivity(activityId);
            await loadActivities();
            setModalOpen(false);
            setSelectedActivity(null);
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
            alert('Error al eliminar actividad');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            // Generar PDF con las actividades actuales
            generateCalendarPDF(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                selectedPlan,
                activities
            );
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar PDF');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['director']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Calendario de Actividades
                    </h1>
                    <p className="text-gray-600">Gestiona las actividades del centro educativo</p>
                </div>

                {/* Controles superiores */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Selector de Plan */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Plan:</label>
                            <select
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="diario">Plan Diario</option>
                                <option value="fin_de_semana">Plan Fin de Semana</option>
                            </select>
                        </div>

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

                        {/* Botones de acción */}
                        <div className="flex items-center space-x-2">
                            {/* Toggle vista (solo visible en desktop) */}
                            <div className="hidden md:flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
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

                            <button
                                onClick={handleDownloadPDF}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                PDF
                            </button>

                            <button
                                onClick={handleCreateActivity}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Nueva Actividad
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
                        onActivityClick={handleEditActivity}
                    />
                ) : (
                    <ActivityList activities={activities} onActivityClick={handleEditActivity} />
                )}

                {/* Modal de actividad */}
                <ActivityModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedActivity(null);
                    }}
                    onSave={handleSaveActivity}
                    activity={selectedActivity}
                    categories={categories}
                    defaultPlan={selectedPlan}
                />

                {/* Botón de eliminar (solo en modo edición) */}
                {selectedActivity && modalOpen && (
                    <div className="fixed bottom-8 right-8 z-50">
                        <button
                            onClick={() => handleDeleteActivity(selectedActivity.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors inline-flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            Eliminar Actividad
                        </button>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}