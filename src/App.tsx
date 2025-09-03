import React from 'react'; // React import is required for JSX but not directly referenced
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages publiques
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import MyTickets from './pages/MyTickets';
import VerifyTicket from './pages/VerifyTicket';

// Pages admin
import AdminDashboard from './pages/Admin/Dashboard';
import CreateEvent from './pages/Admin/Events/CreateEvent';
import EventsList from './pages/Admin/Events/EventsList';
import EditEvent from './pages/Admin/Events/EditEvent';
import UsersList from './pages/Admin/Users/UsersList';
import TicketsList from './pages/Admin/Tickets/TicketsList';
import SlidesList from './pages/Admin/Slides/SlidesList';
import CreateSlide from './pages/Admin/Slides/CreateSlide';
import EditSlide from './pages/Admin/Slides/EditSlide';
import Settings from './pages/Admin/Settings/Settings';

// Pages de paiement
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentCancel from './pages/Payment/PaymentCancel';
import PaymentError from './pages/Payment/PaymentError';

// Page 404
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              {/* Routes protégées utilisateur */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/my-tickets" element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              } />

              {/* Scanner - Admin uniquement */}
              <Route path="/verify-ticket" element={
                <ProtectedRoute adminOnly>
                  <VerifyTicket />
                </ProtectedRoute>
              } />

              {/* Routes admin */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute adminOnly>
                  <EventsList />
                </ProtectedRoute>
              } />
              <Route path="/admin/events/create" element={
                <ProtectedRoute adminOnly>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              <Route path="/admin/events/edit/:id" element={
                <ProtectedRoute adminOnly>
                  <EditEvent />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <UsersList />
                </ProtectedRoute>
              } />
              <Route path="/admin/tickets" element={
                <ProtectedRoute adminOnly>
                  <TicketsList />
                </ProtectedRoute>
              } />
              <Route path="/admin/slides" element={
                <ProtectedRoute adminOnly>
                  <SlidesList />
                </ProtectedRoute>
              } />
              <Route path="/admin/slides/create" element={
                <ProtectedRoute adminOnly>
                  <CreateSlide />
                </ProtectedRoute>
              } />
              <Route path="/admin/slides/edit/:id" element={
                <ProtectedRoute adminOnly>
                  <EditSlide />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute adminOnly>
                  <Settings />
                </ProtectedRoute>
              } />

              {/* Routes de paiement */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/payment/error" element={<PaymentError />} />

              {/* Page 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;