import {
  Boxes,
  CircleDollarSign,
  Grid2X2,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Megaphone,
  PackageCheck,
  ShoppingBag,
  Store,
  Users,
  UserRoundCheck,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = {
  vendor: {
    label: 'Vendor portal',
    links: [
      ['/vendor/dashboard', 'Overview', LayoutDashboard],
      ['/vendor/products', 'Products', ShoppingBag],
      ['/vendor/categories', 'Categories', Grid2X2],
      ['/vendor/orders', 'Orders', PackageCheck],
      ['/vendor/messages', 'Messages', MessageCircle],
      ['/vendor/updates', 'Store updates', Megaphone],
      ['/vendor/support', 'Admin support', LifeBuoy],
      ['/vendor/payouts', 'Payouts', CircleDollarSign],
    ],
  },
  super_admin: {
    label: 'Admin console',
    links: [
      ['/admin/dashboard', 'Overview', LayoutDashboard],
      ['/admin/vendors', 'Vendors', Users],
      ['/admin/categories', 'Categories', Boxes],
      ['/admin/vendor-chats', 'Vendor support', LifeBuoy],
    ],
  },
  customer: {
    label: 'Account',
    links: [
      ['/customer/wishlist', 'Saved products', ShoppingBag],
      ['/customer/following', 'Following', UserRoundCheck],
      ['/customer/updates', 'Seller updates', Megaphone],
      ['/customer/orders', 'Orders', PackageCheck],
      ['/customer/chat', 'Messages', MessageCircle],
    ],
  },
};

const Sidebar = ({ role }) => {
  const menu = navigation[role] || navigation.customer;
  const linkClasses = ({ isActive }) =>
    `dashboard-sidebar-link flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'dashboard-sidebar-link-active' : ''
    }`;

  return (
    <aside className="dashboard-sidebar w-full px-4 py-4 md:min-h-screen md:w-64 md:px-5 md:py-6">
      <div className="flex items-center gap-2 px-2">
        <span className="brand-gem">A</span>
        <div>
          <p className="dashboard-sidebar-brand">ABUAD Market Place</p>
          <p className="dashboard-sidebar-label">{menu.label}</p>
        </div>
      </div>

      <nav className="mt-5 flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
        {menu.links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={linkClasses}>
            <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/"
        className="dashboard-market-link mt-5 hidden items-center gap-2 px-3 pt-5 text-sm font-medium md:flex"
      >
        <Store size={16} aria-hidden="true" />
        View marketplace
      </NavLink>
    </aside>
  );
};

export default Sidebar;
