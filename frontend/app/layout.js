import { AuthProvider } from '@/context/AuthContext';
import '../styles/globals.css';

export const metadata = {
  title: 'Liceo Tecpán - Portal Educativo',
  description: 'Sistema de Gestión Educativa',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}