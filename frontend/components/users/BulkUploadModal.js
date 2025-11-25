'use client';

import { useState } from 'react';
import { validateBulkFile, bulkCreateUsers } from '@/lib/api/users';

export default function BulkUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar extensión
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(extension)) {
        alert('Solo se permiten archivos CSV o Excel (.xlsx, .xls)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);

    try {
      const response = await validateBulkFile(file);
      setValidationData(response.data);
      setStep(2);
    } catch (error) {
      console.error('Error al validar archivo:', error);
      alert(error.response?.data?.message || 'Error al validar archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!validationData || validationData.validUsers === 0) {
      alert('No hay usuarios válidos para crear');
      return;
    }

    const confirmed = confirm(
      `¿Está seguro que desea crear ${validationData.validUsers} usuarios?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await bulkCreateUsers(validationData.users);
      setResults(response.data);
      setStep(3);
    } catch (error) {
      console.error('Error al crear usuarios:', error);
      alert(error.response?.data?.message || 'Error al crear usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep(1);
    setValidationData(null);
    setResults(null);
    onClose();
  };

  const handleFinish = () => {
    handleClose();
    onSuccess();
  };

  const downloadTemplate = () => {
    const csvContent = `email,password,rol,nombre,apellido,codigo_personal,plan,jornada
estudiante1@liceotecpan.edu.gt,liceo2025,estudiante,Pedro,González,EST-2025-010,diario,
estudiante2@liceotecpan.edu.gt,liceo2025,estudiante,Laura,Martínez,EST-2025-011,fin_de_semana,
docente1@liceotecpan.edu.gt,liceo2025,docente,Carlos,López,DOC-010,,diario
docente2@liceotecpan.edu.gt,liceo2025,docente,Ana,Pérez,DOC-011,,ambas
director1@liceotecpan.edu.gt,liceo2025,director,Roberto,Ramírez,,,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_usuarios.csv';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Carga Masiva de Usuarios</h2>
          <button
            onClick={handleClose}
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

        {/* Content */}
        <div className="p-6">
          {/* PASO 1: Subir archivo */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Instrucciones */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Instrucciones:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Descarga la plantilla CSV de ejemplo</li>
                  <li>Llena los datos de los usuarios</li>
                  <li>Guarda el archivo y súbelo aquí</li>
                  <li>Formatos aceptados: CSV, Excel (.xlsx, .xls)</li>
                </ul>
              </div>

              {/* Botón descargar plantilla */}
              <div>
                <button
                  onClick={downloadTemplate}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Descargar Plantilla CSV
                </button>
              </div>

              {/* Input de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Archivo seleccionado: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>

              {/* Botón validar */}
              <button
                onClick={handleValidate}
                disabled={!file || loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validando...' : 'Validar Archivo'}
              </button>
            </div>
          )}

          {/* PASO 2: Preview y confirmación */}
          {step === 2 && validationData && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Filas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {validationData.totalRows}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Usuarios Válidos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {validationData.validUsers}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Errores</p>
                  <p className="text-2xl font-bold text-red-600">
                    {validationData.invalidUsers}
                  </p>
                </div>
              </div>

              {/* Errores */}
              {validationData.errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-h-60 overflow-y-auto">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Errores encontrados:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationData.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview de usuarios válidos */}
              {validationData.validUsers > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Usuarios a crear ({validationData.validUsers}):
                  </h3>
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Nombre
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Rol
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Código
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {validationData.users.map((user, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {user.nombre} {user.apellido}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{user.rol}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {user.codigo_personal || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || validationData.validUsers === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? 'Creando...' : `Crear ${validationData.validUsers} Usuarios`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Resultados */}
          {step === 3 && results && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Proceso Completado
                </h3>
                <p className="text-sm text-gray-600">{results.message}</p>
              </div>

              {/* Usuarios creados exitosamente */}
              {results.success && results.success.length > 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Usuarios creados exitosamente ({results.success.length}):
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-sm text-green-700 space-y-1">
                      {results.success.map((user, index) => (
                        <li key={index}>
                          ✓ {user.nombre} - {user.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Errores */}
              {results.errors && results.errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Errores ({results.errors.length}):
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-sm text-red-700 space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index}>
                          ✗ {error.email} - {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Botón finalizar */}
              <button
                onClick={handleFinish}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}