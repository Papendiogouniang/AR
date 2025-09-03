import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Camera, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

interface TicketInfo {
  _id: string;
  ticketId: string;
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  isUsed: boolean;
  usedAt?: string;
}

const VerifyTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [verificationResult, setVerificationResult] = useState<'success' | 'error' | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (!user || user.role !== 'admin') {
      toast.error('Accès réservé aux administrateurs');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const startScanning = () => {
    setScanning(true);
    setTicketInfo(null);
    setVerificationResult(null);

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        verifyTicket(decodedText);
        html5QrcodeScanner.clear();
        setScanning(false);
      },
      (error) => {
        console.log('Erreur de scan:', error);
      }
    );

    setScanner(html5QrcodeScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  const verifyTicket = async (qrData: string) => {
    try {
      const response = await api.post('/tickets/verify', {
        qrData: qrData
      });

      if (response.data.success) {
        setTicketInfo(response.data.data);
        setVerificationResult('success');
        toast.success('Billet valide !');
      } else {
        setVerificationResult('error');
        toast.error(response.data.message || 'Billet invalide');
      }
    } catch (error: any) {
      console.error('Verify ticket error:', error);
      setVerificationResult('error');
      toast.error(error.response?.data?.message || 'Erreur lors de la vérification');
    }
  };

  const manualVerify = async (ticketId: string) => {
    if (!ticketId.trim()) {
      toast.error('Veuillez saisir un ID de billet');
      return;
    }

    try {
      const response = await api.get(`/tickets/verify/${ticketId}`);
      
      if (response.data.success) {
        setTicketInfo(response.data.data);
        setVerificationResult('success');
        toast.success('Billet valide !');
      } else {
        setVerificationResult('error');
        toast.error(response.data.message || 'Billet invalide');
      }
    } catch (error: any) {
      console.error('Verify ticket error:', error);
      setVerificationResult('error');
      toast.error(error.response?.data?.message || 'Erreur lors de la vérification');
    }
  };

  // Vérifier l'accès admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h2>
          <p className="text-gray-600 mb-6">Cette page est réservée aux administrateurs</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scanner de billets</h1>
            <p className="text-gray-600 mt-1">Vérifiez les billets à l'entrée de l'événement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner QR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-yellow-500" />
              Scanner QR Code
            </h2>

            {!scanning ? (
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
                <button
                  onClick={startScanning}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center mx-auto"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Démarrer le scanner
                </button>
              </div>
            ) : (
              <div>
                <div id="qr-reader" className="w-full"></div>
                <button
                  onClick={stopScanning}
                  className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Arrêter le scanner
                </button>
              </div>
            )}
          </div>

          {/* Vérification manuelle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vérification manuelle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID du billet
                </label>
                <input
                  type="text"
                  placeholder="Ex: TKT-1234567890-ABCDEF"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      manualVerify((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="TKT"]') as HTMLInputElement;
                  manualVerify(input.value);
                }}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Vérifier le billet
              </button>
            </div>
          </div>
        </div>

        {/* Résultat de la vérification */}
        {verificationResult && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              {verificationResult === 'success' ? (
                <div className="text-green-600">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Billet valide ✅</h2>
                </div>
              ) : (
                <div className="text-red-600">
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Billet invalide ❌</h2>
                </div>
              )}
            </div>

            {ticketInfo && verificationResult === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du billet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID du billet</p>
                    <p className="font-mono font-bold">{ticketInfo.ticketId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Détenteur</p>
                    <p className="font-semibold">{ticketInfo.user.firstName} {ticketInfo.user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Événement</p>
                    <p className="font-semibold">{ticketInfo.event.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantité</p>
                    <p className="font-semibold">{ticketInfo.quantity} billet(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix total</p>
                    <p className="font-semibold">{ticketInfo.totalPrice.toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ticketInfo.isUsed 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ticketInfo.isUsed ? 'Déjà utilisé' : 'Valide'}
                    </span>
                  </div>
                </div>

                {ticketInfo.isUsed && ticketInfo.usedAt && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">
                      ⚠️ Ce billet a déjà été utilisé le {new Date(ticketInfo.usedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Instructions d'utilisation</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
              Demandez au client de présenter son QR code (sur téléphone ou imprimé)
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
              Utilisez le scanner ou saisissez manuellement l'ID du billet
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
              Vérifiez que le billet correspond à l'événement et n\'a pas déjà été utilisé
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
              Autorisez l'entrée si le billet est valide
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyTicket;