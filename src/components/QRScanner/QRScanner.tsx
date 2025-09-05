import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerConfig } from 'html5-qrcode';
import { Camera, X, RotateCcw } from 'lucide-react';
import Button from '../UI/Button';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  isActive,
  onClose
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const startScanner = async () => {
    try {
      // Demander la permission de la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Arrêter le stream de test
      setHasPermission(true);
      setError('');

      const config: Html5QrcodeScannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      };

      const scanner = new Html5QrcodeScanner("qr-reader", config, false);
      
      scanner.render(
        (decodedText: string) => {
          console.log('QR Code scanné:', decodedText);
          onScanSuccess(decodedText);
          stopScanner();
        },
        (error: string) => {
          // Ignorer les erreurs de scan normales
          if (onScanError && !error.includes('NotFoundException')) {
            onScanError(error);
          }
        }
      );

      scannerRef.current = scanner;
    } catch (err: any) {
      console.error('Erreur d\'accès à la caméra:', err);
      setHasPermission(false);
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Erreur lors de l\'arrêt du scanner:', err);
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError('');
      startScanner();
    } catch (err) {
      setHasPermission(false);
      setError('Permission de caméra refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Scanner QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-6">
          {hasPermission === false ? (
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Accès à la caméra requis
              </h3>
              <p className="text-gray-600 mb-6">
                {error || 'Nous avons besoin d\'accéder à votre caméra pour scanner les codes QR.'}
              </p>
              <Button
                variant="primary"
                onClick={requestCameraPermission}
              >
                <Camera className="w-4 h-4 mr-2" />
                Autoriser la caméra
              </Button>
            </div>
          ) : hasPermission === null ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Initialisation de la caméra...</p>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="w-full"></div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Pointez la caméra vers le code QR du billet
                </p>
                
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      stopScanner();
                      setTimeout(startScanner, 100);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Redémarrer
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;