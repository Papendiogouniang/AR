import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  ArrowRight, 
  Search, 
  Filter,
  Ticket,
  TrendingUp,
  Music,
  Theater,
  Trophy,
  Mic,
  Palette,
  Heart,
  Globe,
  Zap
} from 'lucide-react';
import { apiHelpers } from '../services/api';
import { Event, Slide } from '../types';
import HeroSlider from '../components/Home/HeroSlider';
import EventCard from '../components/UI/EventCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Tous', icon: Star, color: 'bg-yellow-500' },
    { value: 'concert', label: 'Concerts', icon: Music, color: 'bg-purple-500' },
    { value: 'theatre', label: 'Théâtre', icon: Theater, color: 'bg-red-500' },
    { value: 'sport', label: 'Sport', icon: Trophy, color: 'bg-green-500' },
    { value: 'festival', label: 'Festivals', icon: Palette, color: 'bg-pink-500' },
    { value: 'conference', label: 'Conférences', icon: Mic, color: 'bg-blue-500' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les événements
      const eventsParams = selectedCategory === 'all' ? {} : { category: selectedCategory };
      const eventsResponse = await apiHelpers.getEvents(eventsParams);
      
      if (eventsResponse.success) {
        const allEvents = eventsResponse.data || [];
        setEvents(allEvents);
        setFeaturedEvents(allEvents.filter((event: Event) => event.isFeatured));
      }

      // Récupérer les slides
      try {
        const slidesResponse = await apiHelpers.getSlides();
        if (slidesResponse.success) {
          setSlides(slidesResponse.data.slides || []);
        }
      } catch (slideError) {
        console.log('Pas de slides disponibles');
        setSlides([]);
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de la page d'accueil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec Carousel de Slides */}
      <HeroSlider slides={slides} />

      {/* Catégories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explorez par catégorie</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trouvez facilement les événements qui vous intéressent
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-6 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.value
                      ? `${category.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-medium text-sm">{category.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Événements à la une */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Événements à la une</h2>
                <p className="text-gray-600">
                  Les événements les plus populaires du moment
                </p>
              </div>
              <Link to="/events?featured=true">
                <Button variant="outline">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.slice(0, 6).map((event) => (
                <EventCard key={event._id} event={event} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recherche et filtres */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none bg-white min-w-[200px]"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Tous les événements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedCategory === 'all' ? 'Tous les événements' : 
                 categories.find(cat => cat.value === selectedCategory)?.label}
              </h2>
              <p className="text-gray-600">
                {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} disponible{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link to="/events">
              <Button variant="primary">
                Voir tous les événements
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.slice(0, 8).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Aucun événement disponible pour le moment'
                }
              </p>
              <Button 
                variant="primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kanzey.co en chiffres</h2>
            <p className="text-gray-600">La confiance de milliers de Sénégalais</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">500+</div>
              <div className="text-gray-600">Événements organisés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-gray-600">Billets vendus</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
              <div className="text-gray-600">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Organisateurs partenaires</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir Kanzey.co */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Kanzey.co ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              La plateforme de référence pour vos événements au Sénégal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paiement rapide</h3>
              <p className="text-gray-600">
                Payez en quelques clics avec Orange Money, Free Money, Wave ou Touch Point
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Billets électroniques</h3>
              <p className="text-gray-600">
                Recevez vos billets par email avec code QR pour un accès facile
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% sénégalais</h3>
              <p className="text-gray-600">
                Plateforme locale adaptée aux besoins des événements sénégalais
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Organisez votre propre événement
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Rejoignez notre plateforme et vendez vos billets en ligne facilement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Créer un compte organisateur
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="lg">
                <Ticket className="w-5 h-5 mr-2" />
                Découvrir les événements
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
          <p className="text-gray-300 mb-8">
            Recevez les dernières actualités et les nouveaux événements directement dans votre boîte mail
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
            <Button variant="primary">
              S'abonner
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            Nous respectons votre vie privée. Désabonnement possible à tout moment.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;