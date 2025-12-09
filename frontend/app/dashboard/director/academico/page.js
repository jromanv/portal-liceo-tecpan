'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AcademicoPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir automáticamente a Ciclos Escolares
        router.replace('/dashboard/director/academico/ciclos');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirigiendo...</p>
            </div>
        </div>
    );
}