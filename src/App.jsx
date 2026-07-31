import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guard
import ProtectedRoute from './components/ProtectedRoute';

// Customer / Public Pages
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import CheckoutVerify from './pages/public/CheckoutVerify';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Wishlist from './pages/customer/Wishlist';
import CustomerOrders from './pages/customer/Orders';
import Following from './pages/customer/Following';
import CustomerUpdates from './pages/customer/Updates';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorCategories from './pages/vendor/Categories';
import VendorOrders from './pages/vendor/Orders';
import VendorPayouts from './pages/vendor/Payouts';
import VendorSupportChat from './pages/vendor/SupportChat';
import VendorMessages from './pages/vendor/Messages';
import VendorUpdates from './pages/vendor/Updates';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVendors from './pages/admin/Vendors';
import AdminCategories from './pages/admin/Categories';
import AdminVendorChats from './pages/admin/VendorChats';

// Customer Chat
import CustomerChat from './pages/customer/Chat';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC & CUSTOMER ROUTES */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Only */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/verify" element={<CheckoutVerify />} />
            <Route path="/customer/wishlist" element={<Wishlist />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />
            <Route path="/customer/chat" element={<CustomerChat />} />
            <Route path="/customer/following" element={<Following />} />
            <Route path="/customer/updates" element={<CustomerUpdates />} />
          </Route>
        </Route>

        {/* VENDOR PORTAL */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
          <Route element={<DashboardLayout role="vendor" />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/categories" element={<VendorCategories />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
            <Route path="/vendor/support" element={<VendorSupportChat />} />
            <Route path="/vendor/messages" element={<VendorMessages />} />
            <Route path="/vendor/updates" element={<VendorUpdates />} />
            <Route path="/vendor/payouts" element={<VendorPayouts />} />
          </Route>
        </Route>

        {/* SUPER ADMIN PORTAL */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route element={<DashboardLayout role="super_admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/vendor-chats" element={<AdminVendorChats />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
