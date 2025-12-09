const fs = require('fs');
const path = require('path');

// Leer el archivo original
const originalFile = 'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/page.js';
const content = fs.readFileSync(originalFile, 'utf8');

// Definir los componentes a extraer
const components = [
    { name: 'GestionGrados', folder: 'grados', title: 'Grados', description: 'Gestiona los grados académicos del instituto' },
    { name: 'GestionCursos', folder: 'cursos', title: 'Cursos', description: 'Gestiona los cursos y asignaciones por grado' },
    { name: 'GestionHorarios', folder: 'horarios', title: 'Horarios', description: 'Gestiona los horarios de clases' },
    { name: 'GestionInscripciones', folder: 'inscripciones', title: 'Inscripciones', description: 'Gestiona las inscripciones de estudiantes' },
    { name: 'GestionAsignaciones', folder: 'asignaciones', title: 'Asignaciones', description: 'Gestiona las asignaciones de docentes a cursos' }
];

// Template base para cada página
const getPageTemplate = (componentName, title, description, componentCode) => `'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import axios from '@/lib/axios';
import Modal from '@/components/ui/Modal';

export default function ${componentName}Page() {
    const { user } = useAuth();

    const menuItems = [
        { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
        { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
        { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
        {
            iconType: 'book',
            label: 'Gestión Académica',
            submenu: [
                { href: '/dashboard/director/academico/ciclos', label: 'Ciclos Escolares' },
                { href: '/dashboard/director/academico/grados', label: 'Grados' },
                { href: '/dashboard/director/academico/cursos', label: 'Cursos' },
                { href: '/dashboard/director/academico/horarios', label: 'Horarios' },
                { href: '/dashboard/director/academico/inscripciones', label: 'Inscripciones' },
                { href: '/dashboard/director/academico/asignaciones', label: 'Asignaciones' },
            ],
        },
    ];

    return (
        <ProtectedRoute allowedRoles={['director']}>
            <DashboardLayout
                userName={\`\${user?.nombre} \${user?.apellido}\`}
                userRole={user?.rol}
                menuItems={menuItems}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">${title}</h1>
                    <p className="text-gray-600 mt-2">${description}</p>
                </div>

                <${componentName} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

${componentCode}
`;

// Extraer cada componente
components.forEach(comp => {
    const startMarker = `// COMPONENTE: Gestión de ${comp.title === 'Grados' ? 'Grados' : comp.title === 'Cursos' ? 'Cursos' : comp.title === 'Horarios' ? 'Horarios' : comp.title === 'Inscripciones' ? 'Inscripciones' : 'Asignaciones Docente-Curso'}`;
    const startIndex = content.indexOf(startMarker);

    if (startIndex === -1) {
        console.log(`No se encontró el componente ${comp.name}`);
        return;
    }

    // Buscar el siguiente componente o el final del archivo
    const nextComponentIndex = content.indexOf('\n// ========================================\n// COMPONENTE:', startIndex + startMarker.length);
    const endIndex = nextComponentIndex !== -1 ? nextComponentIndex : content.indexOf('\nexport default function GestionAcademicaPage', startIndex);

    if (endIndex === -1) {
        console.log(`No se encontró el final del componente ${comp.name}`);
        return;
    }

    const componentCode = content.substring(startIndex, endIndex).trim();
    const pageContent = getPageTemplate(comp.name, comp.title, comp.description, componentCode);

    // Crear directorio si no existe
    const dir = path.join('d:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico', comp.folder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Escribir archivo
    const filePath = path.join(dir, 'page.js');
    fs.writeFileSync(filePath, pageContent, 'utf8');
    console.log(`✓ Creado: ${comp.folder}/page.js`);
});

console.log('\n✅ Todas las páginas han sido creadas exitosamente');
