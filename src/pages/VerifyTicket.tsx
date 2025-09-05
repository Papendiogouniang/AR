import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Camera, Shield, ArrowLeft, User, Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiHelpers } from '../services/api';
import QRScanner from '../components/QRScanner/QRScanner';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface TicketValidation {
  isValid: boolean;
  status: string;
  isScanned: boolean;
  scannedAt?: string;
  scannedBy?: string;
  ticketId: string;
  holderName?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  message: string;
  quantity?: number;
}

const VerifyTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [manualTicketId, setManualTicketId] = useState('');
  const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (!user || user.role !== 'admin') {
      toast.error('Accès réservé aux administrateurs');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleQRScanSuccess = (decodedText: string) => {
    console.log('QR Code scanné:', decodedText);
    setShowScanner(false);
    
    // Extraire l'ID du billet depuis l'URL du QR code
    const ticketId = extractTicketIdFromQR(decodedText);
    if (ticketId) {
      verifyTicket(ticketId);
    } else {
      toast.error('QR Code invalide');
    }
  };

  const extractTicketIdFromQR = (qrData: string): string | null => {
    try {
      // Le QR code peut contenir une URL comme: http://localhost:5173/verify-ticket/TKT-123456
      // Ou directement l'ID du billet
      if (qrData.includes('/verify-ticket/')) {
        return qrData.split('/verify-ticket/')[1];
      } else if (qrData.startsWith('TKT-')) {
        return qrData;
      } else {
        // Essayer de parser comme URL
        const url = new URL(qrData);
        const pathParts = url.pathname.split('/');
        const ticketId = pathParts[pathParts.length - 1];
        return ticketId.startsWith('TKT-') ? ticketId : null;
      }
    } catch {
      // Si ce n'est pas une URL, vérifier si c'est directement un ID
      return qrData.startsWith('TKT-') ? qrData : null;
    }
  };

  const verifyTicket = async (ticketId: string) => {
    if (!ticketId.trim()) {
      toast.error('Veuillez saisir un ID de billet valide');
      return;
    }

    try {
      setVerifying(true);
      setValidationResult(null);

      const response = await apiHelpers.verifyQRTicket(ticketId);
      
      if (response.success) {
        setValidationResult(response.validationResult);
        
        if (response.validationResult.isValid) {
          toast.success('✅ Billet valide - Entrée autorisée');
        } else {
          toast.error(`❌ ${response.validationResult.message}`);
        }
      } else {
        setValidationResult({
          isValid: false,
          status: 'error',
          isScanned: false,
          ticketId: ticketId,
          message: response.message || 'Billet non trouvé'
        });
        toast.error(response.message || 'Billet non trouvé');
      }
    } catch (error: any) {
      console.error('Verify ticket error:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la vérification';
      
      setValidationResult({
        isValid: false,
        status: 'error',
        isScanned: false,
        ticketId: ticketId,
        message: errorMessage
      });
      
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerify = () => {
    verifyTicket(manualTicketId);
  };

  const resetValidation = () => {
    setValidationResult(null);
    setManualTicketId('');
  };

  // Vérifier l'accès admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h2>
          <p className="text-gray-600 mb-6">Cette page est réservée aux administrateurs</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
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
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
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
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-yellow-500" />
              Scanner QR Code
            </h2>

            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-300">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              
              <Button
                variant="primary"
                onClick={() => setShowScanner(true)}
                className="mb-4"
              >
                <Camera className="w-5 h-5 mr-2" />
                Ouvrir le scanner
              </Button>
              
              <p className="text-sm text-gray-600">
                Cliquez pour activer la caméra et scanner un code QR
              </p>
            </div>
          </div>

          {/* Vérification manuelle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Vérification manuelle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID du billet
                </label>
                <input
                  type="text"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                  placeholder="Ex: TKT-1234567890-ABCDEF"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualVerify();
                    }
                  }}
                />
              </div>
              
              <Button
                variant="primary"
                fullWidth
                onClick={handleManualVerify}
                disabled={!manualTicketId.trim() || verifying}
                loading={verifying}
              >
                Vérifier le billet
              </Button>
            </div>
          </div>
        </div>

        {/* Résultat de la vérification */}
        {validationResult && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              {validationResult.isValid ? (
                <div className="text-green-600">
                  <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Billet valide ✅</h2>
                  <p className="text-lg text-green-700">Entrée autorisée</p>
                </div>
              ) : (
                <div className="text-red-600">
                  <XCircle className="w-20 h-20 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Billet invalide ❌</h2>
                  <p className="text-lg text-red-700">{validationResult.message}</p>
                </div>
              )}
            </div>

            {validationResult.ticketId && (
              <div className={`${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du billet</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <TicketIcon className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">ID du billet</p>
                      <p className="font-mono font-bold text-gray-900">{validationResult.ticketId}</p>
                    </div>
                  </div>

                  {validationResult.holderName && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Détenteur</p>
                        <p className="font-semibold text-gray-900">{validationResult.holderName}</p>
                      </div>
                    </div>
                  )}

                  {validationResult.eventTitle && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Événement</p>
                        <p className="font-semibold text-gray-900">{validationResult.eventTitle}</p>
                      </div>
                    </div>
                  )}

                  {validationResult.eventLocation && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Lieu</p>
                        <p className="font-semibold text-gray-900">{validationResult.eventLocation}</p>
                      </div>
                    </div>
                  )}

                  {validationResult.quantity && (
                    <div>
                      <p className="text-sm text-gray-600">Quantité</p>
                      <p className="font-semibold text-gray-900">{validationResult.quantity} billet(s)</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      validationResult.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {validationResult.status}
                    </span>
                  </div>
                </div>

                {validationResult.isScanned && validationResult.scannedAt && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 font-medium">
                      ⚠️ Ce billet a déjà été scanné le {new Date(validationResult.scannedAt).toLocaleString('fr-FR')}
                      {validationResult.scannedBy && ` par ${validationResult.scannedBy}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={resetValidation}
              >
                Scanner un autre billet
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Instructions d'utilisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                Demandez au client de présenter son QR code
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                Utilisez le scanner ou saisissez l'ID manuellement
              </li>
            </ul>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                Vérifiez les informations affichées
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                Autorisez l'entrée si le billet est valide
              </li>
            </ul>
          </div>
        </div>

        {/* QR Scanner Modal */}
        <QRScanner
          isActive={showScanner}
          onScanSuccess={handleQRScanSuccess}
          onScanError={(error) => {
            console.error('QR Scan error:', error);
            toast.error('Erreur de scan');
          }}
          onClose={() => setShowScanner(false)}
        />
      </div>
    </div>
  );
};

export default VerifyTicket;