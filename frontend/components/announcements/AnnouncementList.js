'use client';

import AnnouncementCard from './AnnouncementCard';

export default function AnnouncementList({ announcements, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando anuncios...</p>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600">No hay anuncios disponibles</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
        </div>
    );
}