'use client';

import { useState, useEffect } from 'react';

export default function UserModal({ isOpen, onClose, onSave, user, mode }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'estudiante',
    codigo_personal: '',
    plan: 'diario',
    jornada: 'diario',
    activo: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        email: user.email || '',
        password: '',
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        rol: user.rol || 'estudiante',
        codigo_personal: user.codigo_personal || '',
        plan: user.plan || 'diario',
        jornada: user.jornada || 'diario',
        activo: user.activo !== undefined ? user.activo : true,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        rol: 'estudiante',
        codigo_personal: '',
        plan: 'diario',
        jornada: 'diario',
        activo: true,
      });
    }
    setErrors({});
    setShowPassword(false);
  }, [user, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    if (!formData.email) {
      newErrors.email = 'El correo es obligatorio';
    }
    else {
      const isValidDomain = formData.email.endsWith('@liceotecpan.edu.gt') ||
        formData.email.endsWith('@liceotecpan.com');
      if (!isValidDomain) {
        newErrors.email = 'Debe usar correo institucional (@liceotecpan.edu.gt o @liceotecpan.com)';
      }
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellido) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if ((formData.rol === 'estudiante' || formData.rol === 'docente') && !formData.codigo_personal) {
      newErrors.codigo_personal = 'El código personal es obligatorio';
    }

    if (formData.rol === 'estudiante' && !formData.plan) {
      newErrors.plan = 'El plan es obligatorio';
    }

    if (formData.rol === 'docente' && !formData.jornada) {
      newErrors.jornada = 'La jornada es obligatoria';
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
      setErrors({ general: error.message || 'Error al guardar usuario' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
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
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo institucional *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="usuario@liceotecpan.edu.gt"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {mode === 'create' ? '*' : '(dejar vacío para no cambiar)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.apellido ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={loading || mode === 'edit'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="director">Director</option>
            </select>
            {mode === 'edit' && (
              <p className="mt-1 text-sm text-gray-500">El rol no se puede modificar</p>
            )}
          </div>

          {/* Código Personal (solo para estudiantes y docentes) */}
          {(formData.rol === 'estudiante' || formData.rol === 'docente') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Personal *
              </label>
              <input
                type="text"
                name="codigo_personal"
                value={formData.codigo_personal}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.codigo_personal ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder={formData.rol === 'estudiante' ? 'EST-2025-001' : 'DOC-001'}
              />
              {errors.codigo_personal && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo_personal}</p>
              )}
            </div>
          )}

          {/* Plan (solo para estudiantes) */}
          {formData.rol === 'estudiante' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan *</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="diario">Diario</option>
                <option value="fin_de_semana">Fin de Semana</option>
              </select>
              {errors.plan && <p className="mt-1 text-sm text-red-600">{errors.plan}</p>}
            </div>
          )}

          {/* Jornada (solo para docentes) */}
          {formData.rol === 'docente' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jornada *</label>
              <select
                name="jornada"
                value={formData.jornada}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="diario">Diario</option>
                <option value="fin_de_semana">Fin de Semana</option>
                <option value="ambas">Ambas Jornadas</option>
              </select>
              {errors.jornada && <p className="mt-1 text-sm text-red-600">{errors.jornada}</p>}
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
                Usuario activo
              </label>
            </div>
          )}

          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Botones */}
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
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}