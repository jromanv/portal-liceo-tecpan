'use client';

import { useState, useEffect } from 'react';

export default function ActivityModal({
    isOpen,
    onClose,
    onSave,
    activity,
    categories,
    defaultPlan,
}) {
    const [formData, setFormData] = useState({
        actividad: '',
        fecha: '',
        hora: '',
        responsable: '',
        categoria_id: '',
        plan: defaultPlan || 'diario',
        dirigido_a: 'todos',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activity) {
            // Modo edición
            setFormData({
                actividad: activity.actividad || '',
                fecha: activity.fecha ? activity.fecha.split('T')[0] : '',
                hora: activity.hora || '',
                responsable: activity.responsable || '',
                categoria_id: activity.categoria_id || '',
                plan: activity.plan || defaultPlan || 'diario',
                dirigido_a: activity.dirigido_a || 'todos',
            });
        } else {
            // Modo creación
            setFormData({
                actividad: '',
                fecha: '',
                hora: '',
                responsable: '',
                categoria_id: '',
                plan: defaultPlan || 'diario',
                dirigido_a: 'todos',
            });
        }
        setErrors({});
    }, [activity, isOpen, defaultPlan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.actividad.trim()) {
            newErrors.actividad = 'La actividad es obligatoria';
        }

        if (!formData.fecha) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.categoria_id) {
            newErrors.categoria_id = 'La categoría es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await onSave(formData);
            handleClose();
        } catch (error) {
            console.error('Error al guardar actividad:', error);
            setErrors({
                general: error.response?.data?.message || 'Error al guardar actividad',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            actividad: '',
            fecha: '',
            hora: '',
            responsable: '',
            categoria_id: '',
            plan: defaultPlan || 'diario',
            dirigido_a: 'todos',
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {activity ? 'Editar Actividad' : 'Nueva Actividad'}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error general */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* Actividad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Actividad <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="actividad"
                            value={formData.actividad}
                            onChange={handleChange}
                            rows={3}
                            className={`input-field resize-none ${errors.actividad ? 'border-red-500' : ''}`}
                            placeholder="Descripción de la actividad"
                            disabled={loading}
                        />
                        {errors.actividad && (
                            <p className="mt-1 text-sm text-red-600">{errors.actividad}</p>
                        )}
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className={`input-field ${errors.fecha ? 'border-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.fecha && (
                                <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hora (opcional)
                            </label>
                            <input
                                type="text"
                                name="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ej: 08:00 o 08:00-10:00"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Responsable */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Responsable (opcional)
                        </label>
                        <input
                            type="text"
                            name="responsable"
                            value={formData.responsable}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Nombre del responsable o comisión"
                            disabled={loading}
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="categoria_id"
                            value={formData.categoria_id}
                            onChange={handleChange}
                            className={`input-field ${errors.categoria_id ? 'border-red-500' : ''}`}
                            disabled={loading}
                        >
                            <option value="">Seleccionar categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.categoria_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>
                        )}
                    </div>

                    {/* Plan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plan
                        </label>
                        <select
                            name="plan"
                            value={formData.plan}
                            onChange={handleChange}
                            className="input-field"
                            disabled={loading}
                        >
                            <option value="diario">Plan Diario</option>
                            <option value="fin_de_semana">Plan Fin de Semana</option>
                        </select>
                    </div>

                    {/* Dirigido a */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirigido a
                        </label>
                        <select
                            name="dirigido_a"
                            value={formData.dirigido_a}
                            onChange={handleChange}
                            className="input-field"
                            disabled={loading}
                        >
                            <option value="todos">Todos (Docentes y Estudiantes)</option>
                            <option value="solo_docentes">Solo Docentes</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Las actividades "Solo Docentes" no serán visibles para estudiantes
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : activity ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}