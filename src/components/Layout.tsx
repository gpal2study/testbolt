import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import '../styles/Layout.css';

export default function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="layout">
      <TopBar
        user={user!}
        onLogoClick={toggleSidebar}
      />

      <div className="middle-area">
        <Sidebar
          isExpanded={isSidebarExpanded}
          currentPath={location.pathname}
        />

        <div className="content-wrapper">
          <Breadcrumb currentPath={location.pathname} />

          <div className="action-area">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <p>&copy; 2025 Admin UI. All rights reserved.</p>
      </div>
    </div>
  );
}
