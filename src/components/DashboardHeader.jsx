import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Account';
  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AM';

  return (
    <header className="dashboard-header sticky top-0 z-30 flex h-16 items-center justify-between px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div>
        <p className="dashboard-header-kicker">ABUAD Market Place</p>
        <p className="dashboard-header-name">{displayName}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="dashboard-header-button" aria-label="Notifications">
          <Bell size={16} aria-hidden="true" />
        </button>
        <div className="dashboard-avatar">{initials}</div>
        <button
          type="button"
          onClick={logout}
          className="dashboard-header-button"
          aria-label="Sign out"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
