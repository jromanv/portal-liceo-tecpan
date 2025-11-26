'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, userName, userRole, menuItems }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Para móvil
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Para desktop

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        userName={userName}
        userRole={userRole}
        onMenuToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Content Area - Se ajusta según el estado del sidebar */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}