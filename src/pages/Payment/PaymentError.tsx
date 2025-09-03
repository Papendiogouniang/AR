import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
            <p className="text-gray-600">
              Une erreur s'est produite lors du traitement de votre paiement.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              <strong>Que s'est-il passé ?</strong><br />
              Le paiement n'a pas pu être traité. Aucun montant n'a été débité de votre compte.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Réessayer
            </button>
            
            <Link
              to="/"
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Besoin d'aide ?</strong><br />
              Si le problème persiste, contactez notre support à{' '}
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

export default PaymentError;