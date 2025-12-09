const fs = require('fs');

const menuItemsCode = `const menuItems = [
    { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
    { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
    {
      iconType: 'book',
      label: 'Gestión Académica',
      submenu: [
        { href: '/dashboard/director/academico/ciclos', label: 'Ciclos Escolares', icon: '📅' },
        { href: '/dashboard/director/academico/grados', label: 'Grados', icon: '🎓' },
        { href: '/dashboard/director/academico/cursos', label: 'Cursos', icon: '📚' },
        { href: '/dashboard/director/academico/horarios', label: 'Horarios', icon: '🕐' },
        { href: '/dashboard/director/academico/inscripciones', label: 'Inscripciones', icon: '✍️' },
        { href: '/dashboard/director/academico/asignaciones', label: 'Asignaciones', icon: '👨‍🏫' },
      ],
    },
  ];`;

const files = [
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/usuarios/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/calendario/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/ciclos/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/grados/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/cursos/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/horarios/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/inscripciones/page.js',
    'd:/Sistemas JR/PortalLT/liceo-tecpan/frontend/app/dashboard/director/academico/asignaciones/page.js'
];

files.forEach(file => {
    try {
        if (!fs.existsSync(file)) {
            console.log(`⚠️  Archivo no existe: ${file.split('/').pop()}`);
            return;
        }

        let content = fs.readFileSync(file, 'utf8');

        // Buscar el inicio y fin del menuItems actual
        const startPattern = /const menuItems = \[/;
        const startMatch = content.match(startPattern);

        if (!startMatch) {
            console.log(`❌ No se encontró menuItems en ${file.split('/').pop()}`);
            return;
        }

        const startIndex = startMatch.index;
        let bracketCount = 0;
        let endIndex = startIndex;
        let foundStart = false;

        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '[') {
                bracketCount++;
                foundStart = true;
            } else if (content[i] === ']') {
                bracketCount--;
                if (foundStart && bracketCount === 0) {
                    endIndex = i + 2; // +2 para incluir ]; 
                    break;
                }
            }
        }

        // Reemplazar el menuItems
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        const newContent = before + menuItemsCode + after;

        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`✓ Actualizado: ${file.split('/').pop()}`);
    } catch (error) {
        console.log(`❌ Error en ${file.split('/').pop()}:`, error.message);
    }
});

console.log('\n✅ MenuItems actualizados con iconos');
