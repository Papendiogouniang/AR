import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-yellow-500 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
          <p className="text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Page précédente
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Que cherchez-vous ?</h2>
          <div className="space-y-2 text-left">
            <Link to="/events" className="block text-yellow-600 hover:text-yellow-700 transition-colors">
              → Tous les événements
            </Link>
            <Link to="/profile" className="block text-yellow-600 hover:text-yellow-700 transition-colors">
              → Mon profil
            </Link>
            <Link to="/my-tickets" className="block text-yellow-600 hover:text-yellow-700 transition-colors">
              → Mes billets
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Besoin d'aide ? Contactez-nous à{' '}
            <a href="mailto:support@kanzey.co" className="text-yellow-600 hover:text-yellow-700">
              support@kanzey.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;