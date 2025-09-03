import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticket');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
            <p className="text-gray-600">
              Votre billet a été acheté avec succès
            </p>
          </div>

          {ticketId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 mb-2">Numéro de billet :</p>
              <p className="font-mono font-bold text-green-900">{ticketId}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center text-gray-600">
              <Mail className="w-5 h-5 mr-2" />
              <span>Un email de confirmation vous a été envoyé</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Download className="w-5 h-5 mr-2" />
              <span>Votre billet PDF est en pièce jointe</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>Présentez le QR code le jour de l'événement</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/my-tickets"
              className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
            >
              Voir mes billets
            </Link>
            
            <Link
              to="/"
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              Retour à l'accueil {countdown > 0 && `(${countdown}s)`}
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Important :</strong> Conservez votre email de confirmation. 
              Vous devrez présenter le QR code à l'entrée de l\'événement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;