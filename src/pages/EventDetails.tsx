import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  ArrowLeft,
  Ticket,
  Share2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  capacity: number;
  availableTickets: number;
  category: string;
  image: string;
  isFeatured: boolean;
  tags: string[];
  organizer: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.data);
      } else {
        toast.error('Événement non trouvé');
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      toast.error('Erreur lors du chargement de l\'événement');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour acheter un billet');
      navigate('/login');
      return;
    }

    if (!event) return;

    if (quantity > event.availableTickets) {
      toast.error('Quantité demandée non disponible');
      return;
    }

    try {
      setPurchasing(true);
      
      const response = await api.post('/payment/initiate', {
        eventId: event._id,
        quantity,
        totalAmount: event.price * quantity
      });

      if (response.data.success) {
        // Redirection vers InTouch
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error(response.data.message || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'achat:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'achat du billet');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h2>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header avec image */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={getImageUrl(event.image)}
          alt={event.title}
          className="w-full h-full object-cover opacity-70"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Badges */}
        <div className="absolute top-6 right-6 flex space-x-2">
          <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <Star className="w-4 h-4 mr-1" />
              À la une
            </span>
          )}
        </div>

        {/* Titre */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
          <p className="text-xl text-gray-200">{event.shortDescription}</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de cet événement</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Organisateur */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organisateur</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {event.organizer.firstName.charAt(0)}{event.organizer.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </h3>
                  <p className="text-gray-600">{event.organizer.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Achat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {event.price.toLocaleString()} FCFA
                </div>
                <p className="text-gray-600">par billet</p>
              </div>

              {/* Informations événement */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-yellow-500" />
                  <div>
                    <div className="font-medium">{formatDate(event.date)}</div>
                    <div className="text-sm text-gray-600">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-yellow-500" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                    <div className="text-sm text-gray-600">{event.address}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-yellow-500" />
                  <div>
                    <div className="font-medium">{event.availableTickets} places disponibles</div>
                    <div className="text-sm text-gray-600">sur {event.capacity} au total</div>
                  </div>
                </div>
              </div>

              {/* Sélection quantité */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de billets
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {Array.from({ length: Math.min(10, event.availableTickets) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} billet{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {(event.price * quantity).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Bouton d'achat */}
              {event.availableTickets > 0 ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !user}
                  className="w-full bg-yellow-500 text-white py-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5 mr-2" />
                      {user ? 'Acheter maintenant' : 'Se connecter pour acheter'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-4 rounded-lg cursor-not-allowed font-semibold"
                >
                  Événement complet
                </button>
              )}

              {!user && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Connectez-vous
                  </button>
                  {' '}ou{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    créez un compte
                  </button>
                  {' '}pour acheter des billets
                </p>
              )}

              {/* Partage */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: event.title,
                      text: event.shortDescription,
                      url: window.location.href
                    }) || navigator.clipboard.writeText(window.location.href);
                    toast.success('Lien copié !');
                  }}
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager cet événement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;