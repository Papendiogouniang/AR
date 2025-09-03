import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Settings,
  Eye,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  recentEvents: any[];
  recentSales: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalTickets: 0,
    totalRevenue: 0,
    recentEvents: [],
    recentSales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Garder les stats par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, to, color }: any) => (
    <Link
      to={to}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:scale-105"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme Kanzey.CO</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Événements"
            value={stats.totalEvents}
            icon={Calendar}
            color="bg-blue-500"
            change="+12% ce mois"
          />
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            icon={Users}
            color="bg-green-500"
            change="+8% ce mois"
          />
          <StatCard
            title="Billets vendus"
            value={stats.totalTickets}
            icon={Ticket}
            color="bg-purple-500"
            change="+15% ce mois"
          />
          <StatCard
            title="Revenus"
            value={`${stats.totalRevenue.toLocaleString()} FCFA`}
            icon={DollarSign}
            color="bg-yellow-500"
            change="+20% ce mois"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Événements récents</h2>
              <Link to="/admin/events" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentEvents.length > 0 ? (
                stats.recentEvents.slice(0, 5).map((event) => (
                  <div key={event._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{event.price} FCFA</p>
                      <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun événement récent</p>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Ventes récentes</h2>
              <Link to="/admin/tickets" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentSales.length > 0 ? (
                stats.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{sale.event?.title || 'Événement supprimé'}</h3>
                      <p className="text-sm text-gray-600">{sale.user?.email || 'Utilisateur inconnu'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{sale.totalPrice} FCFA</p>
                      <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune vente récente</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Nouvel événement"
              description="Créer un nouvel événement"
              icon={Plus}
              to="/admin/events/create"
              color="bg-blue-500"
            />
            <QuickAction
              title="Gérer les événements"
              description="Voir et modifier les événements"
              icon={Calendar}
              to="/admin/events"
              color="bg-green-500"
            />
            <QuickAction
              title="Gérer les utilisateurs"
              description="Administrer les comptes utilisateurs"
              icon={Users}
              to="/admin/users"
              color="bg-purple-500"
            />
            <QuickAction
              title="Voir les billets"
              description="Gérer les billets vendus"
              icon={Ticket}
              to="/admin/tickets"
              color="bg-orange-500"
            />
            <QuickAction
              title="Scanner les billets"
              description="Vérifier les billets à l'entrée"
              icon={UserCheck}
              to="/verify-ticket"
              color="bg-red-500"
            />
            <QuickAction
              title="Paramètres"
              description="Configuration de la plateforme"
              icon={Settings}
              to="/admin/settings"
              color="bg-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;