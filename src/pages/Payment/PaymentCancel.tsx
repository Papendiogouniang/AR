import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
            <p className="text-gray-600">
              Votre transaction a été annulée. Aucun montant n'a été débité.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-800 text-sm">
              Votre billet n'a pas été réservé. Vous pouvez réessayer quand vous le souhaitez.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Réessayer le paiement
            </button>
            
            <Link
              to="/"
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>

          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Besoin d'aide ? Contactez-nous à{' '}
              <a href="mailto:support@kanzey.co" className="text-yellow-600 hover:text-yellow-700">
                support@kanzey.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;