'use client';

import { useEffect } from 'react';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-2xl',
    showIcon = false,
    icon = 'edit', // 'edit', 'add', 'warning', 'info', 'success', 'error', 'delete'
    variant = 'default', // 'default', 'confirm', 'success', 'error', 'info'
    onConfirm = null,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    message = '' // For simple notification modals
}) {
    // Cerrar modal con tecla ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Iconos SVG
    const icons = {
        edit: (
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        add: (
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        warning: (
            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        error: (
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        delete: (
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        )
    };

    // Colores de fondo del icono según variante
    const iconBgColors = {
        default: 'bg-red-50',
        confirm: 'bg-orange-50',
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-blue-50'
    };

    // Determinar el icono a mostrar según la variante
    const getIconForVariant = () => {
        if (icon) return icons[icon] || icons.edit;

        switch (variant) {
            case 'confirm':
                return icons.warning;
            case 'success':
                return icons.success;
            case 'error':
                return icons.error;
            case 'info':
                return icons.info;
            default:
                return icons.edit;
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay con animación */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 backdrop-blur-sm"
                onClick={variant === 'confirm' ? null : onClose}
            />

            {/* Contenedor del modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} transform transition-all duration-300 scale-100 animate-fadeIn`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Icono decorativo (opcional) */}
                    {showIcon && (
                        <div className="flex justify-center pt-6 pb-2">
                            <div className={`${iconBgColors[variant] || iconBgColors.default} rounded-full p-3`}>
                                {getIconForVariant()}
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-center px-6 pt-6 pb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {title}
                        </h3>
                        {variant !== 'confirm' && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        {/* Si hay un mensaje simple, mostrarlo */}
                        {message && (
                            <p className="text-gray-600 mb-4">{message}</p>
                        )}

                        {/* Contenido personalizado */}
                        {children}

                        {/* Botones para variante confirm */}
                        {variant === 'confirm' && onConfirm && (
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base font-medium"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition text-sm sm:text-base font-medium"
                                >
                                    {confirmText}
                                </button>
                            </div>
                        )}

                        {/* Botón OK para variantes de notificación */}
                        {(variant === 'success' || variant === 'error' || variant === 'info') && !children && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`w-full px-4 py-2 rounded-lg transition text-sm sm:text-base font-medium ${variant === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                        variant === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                            'bg-blue-500 hover:bg-blue-600 text-white'
                                        }`}
                                >
                                    Entendido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}