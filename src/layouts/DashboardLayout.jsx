import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

const DashboardLayout = ({ role }) => {
  return (
    <div className="dashboard-shell market-dark flex min-h-screen flex-col md:flex-row">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col dashboard-main-pane">
        <DashboardHeader />
        <main className="dashboard-main flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
