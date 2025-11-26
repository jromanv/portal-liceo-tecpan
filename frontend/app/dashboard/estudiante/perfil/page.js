'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function EstudiantePerfilPage() {
    const { user } = useAuth();

    const menuItems = [
        { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
        { href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' },
    ];
    const getPlanLabel = (plan) => {
        const labels = {
            diario: 'Plan Diario',
            fin_de_semana: 'Plan Fin de Semana',
        };
        return labels[plan] || plan;
    };

    const getPlanDescription = (plan) => {
        const descriptions = {
            diario: 'Clases de lunes a viernes en horario matutino',
            fin_de_semana: 'Clases los sábados y domingos',
        };
        return descriptions[plan] || '';
    };

    return (
        <ProtectedRoute allowedRoles={['estudiante']}>
            <DashboardLayout
                userName={`${user?.nombre} ${user?.apellido}`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                        Información personal del estudiante
                    </p>
                </div>

                {/* Perfil Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header del perfil */}
                    <div className="bg-gradient-to-r from-primary to-red-800 h-24"></div>

                    {/* Contenido del perfil */}
                    <div className="px-6 pb-6">
                        {/* Avatar y nombre */}
                        <div className="flex items-center -mt-12 mb-6">
                            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary">
                                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                                </span>
                            </div>
                            <div className="ml-4 mt-12">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user?.nombre} {user?.apellido}
                                </h2>
                                <p className="text-gray-600">Estudiante</p>
                            </div>
                        </div>

                        {/* Información detallada */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                                <div className="space-y-4">
                                    <DataRow label="Nombre" value={user?.nombre} />
                                    <DataRow label="Apellido" value={user?.apellido} />
                                    <DataRow label="Email Institucional" value={user?.email} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Académica</h3>
                                <div className="space-y-4">
                                    <DataRow label="Código Personal" value={user?.codigo_personal} />
                                    <DataRow label="Rol" value="Estudiante" />
                                    <DataRow label="Plan de Estudio" value={getPlanLabel(user?.plan)} />
                                </div>
                            </div>
                        </div>

                        {/* Card de Plan con más detalles */}
                        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-gray-900 mb-2">{getPlanLabel(user?.plan)}</h4>
                            <p className="text-sm text-gray-700">{getPlanDescription(user?.plan)}</p>
                        </div>
                    </div>
                </div>

                {/* Nota informativa */}
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                        <strong>Nota:</strong> Si necesitas actualizar tu información personal, contacta al director o administrador del sistema.
                    </p>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function DataRow({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">{label}</span>
            <span className="text-base font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                {value || 'N/A'}
            </span>
        </div>
    );
}