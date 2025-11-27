'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementModal({ isOpen, onClose, onSave, announcement, mode }) {
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        tipo: 'general',
        dirigido_a: 'todos',
        plan: 'todos',
        jornada: 'todos',
        activo: true,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (announcement && mode === 'edit') {
            setFormData({
                titulo: announcement.titulo || '',
                contenido: announcement.contenido || '',
                tipo: announcement.tipo || 'general',
                dirigido_a: announcement.dirigido_a || 'todos',
                plan: announcement.plan || 'todos',
                jornada: announcement.jornada || 'todos',
                activo: announcement.activo !== undefined ? announcement.activo : true,
            });
        } else {
            setFormData({
                titulo: '',
                contenido: '',
                tipo: 'general',
                dirigido_a: 'todos',
                plan: 'todos',
                jornada: 'todos',
                activo: true,
            });
        }
        setErrors({});
    }, [announcement, mode, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = 'El título es obligatorio';
        }

        if (!formData.contenido.trim()) {
            newErrors.contenido = 'El contenido es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            setErrors({ general: error.response?.data?.message || 'Error al guardar anuncio' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'create' ? 'Crear Anuncio' : 'Editar Anuncio'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            disabled={loading}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.titulo ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Ej: Examen de Matemática"
                        />
                        {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
                    </div>

                    {/* Contenido */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                        <textarea
                            name="contenido"
                            value={formData.contenido}
                            onChange={handleChange}
                            disabled={loading}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.contenido ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Escribe el contenido del anuncio..."
                        />
                        {errors.contenido && <p className="mt-1 text-sm text-red-600">{errors.contenido}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="general">General</option>
                                <option value="importante">Importante</option>
                                <option value="recordatorio">Recordatorio</option>
                            </select>
                        </div>

                        {/* Dirigido a */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dirigido a</label>
                            <select
                                name="dirigido_a"
                                value={formData.dirigido_a}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="todos">Todos</option>
                                <option value="estudiantes">Estudiantes</option>
                                <option value="docentes">Docentes</option>
                            </select>
                        </div>
                    </div>

                    {/* Plan (solo si es para estudiantes) */}
                    {formData.dirigido_a === 'estudiantes' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Plan de Estudiantes</label>
                            <select
                                name="plan"
                                value={formData.plan}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="todos">Todos los planes</option>
                                <option value="diario">Solo Plan Diario</option>
                                <option value="fin_de_semana">Solo Plan Fin de Semana</option>
                            </select>
                        </div>
                    )}

                    {/* Jornada (solo si es para docentes) */}
                    {formData.dirigido_a === 'docentes' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jornada de Docentes</label>
                            <select
                                name="jornada"
                                value={formData.jornada}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="todos">Todas las jornadas</option>
                                <option value="diario">Solo Jornada Diaria</option>
                                <option value="fin_de_semana">Solo Jornada Fin de Semana</option>
                            </select>
                        </div>
                    )}

                    {/* Estado (solo en edición) */}
                    {mode === 'edit' && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="activo"
                                id="activo"
                                checked={formData.activo}
                                onChange={handleChange}
                                disabled={loading}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                                Anuncio activo
                            </label>
                        </div>
                    )}

                    {errors.general && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
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
                            {loading ? 'Guardando...' : mode === 'create' ? 'Crear Anuncio' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}