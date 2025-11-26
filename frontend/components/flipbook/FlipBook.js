'use client';

import { useState } from 'react';

export default function FlipBook({ manuals }) {
    const [selectedManual, setSelectedManual] = useState(0);

    // Configurar Google Docs Viewer para modo lectura sin descarga
    const getViewerUrl = (pdfUrl) => {
        // Convertir ruta relativa a absoluta
        const fullUrl = `${window.location.origin}${pdfUrl}`;
        const encodedUrl = encodeURIComponent(fullUrl);

        // Usar Google Docs Viewer en modo embebido
        return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
    };

    const currentManual = manuals[selectedManual];

    return (
        <div className="flex flex-col space-y-4">
            {/* Pestañas si hay múltiples manuales */}
            {manuals.length > 1 && (
                <div className="flex space-x-2 bg-gray-100 p-2 rounded-lg">
                    {manuals.map((manual, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedManual(index)}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${selectedManual === index
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {manual.title}
                        </button>
                    ))}
                </div>
            )}

            {/* Contenedor del libro con diseño tipo storybook */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl p-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header del libro */}
                    <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <h3 className="text-2xl font-bold">{currentManual.title}</h3>
                                </div>
                                <p className="text-white/90 text-sm">{currentManual.description}</p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <p className="text-xs text-white/80">Solo lectura</p>
                                    <p className="text-sm font-semibold">Modo Protegido</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visor del PDF con efecto de libro */}
                    <div className="relative bg-gradient-to-b from-gray-50 to-white">
                        {/* Decoración de páginas */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/50 to-transparent pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200/50 to-transparent pointer-events-none"></div>

                        {/* Contenedor del iframe */}
                        <div className="relative" style={{ height: '700px' }}>
                            <iframe
                                src={getViewerUrl(currentManual.url)}
                                className="absolute inset-0 w-full h-full border-0"
                                title={currentManual.title}
                                sandbox="allow-scripts allow-same-origin"
                                loading="lazy"
                            />
                        </div>

                        {/* Marcador de libro decorativo */}
                        <div className="absolute top-0 right-12 w-2 h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-b-sm shadow-lg"></div>
                    </div>

                    {/* Footer del libro */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Usa los controles del visor para navegar entre páginas</span>
                            </div>
                            <div className="hidden sm:flex items-center space-x-2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Documento protegido</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm text-blue-800 font-medium">Acerca de este manual</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Este documento es de uso exclusivo institucional. Utiliza las herramientas de navegación
                            del visor para explorar el contenido. El documento está protegido y solo puede ser visualizado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}