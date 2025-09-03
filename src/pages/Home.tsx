import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, ArrowRight, Search, Filter } from 'lucide-react';
import api from '../services/api';

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
  organizer: {
    firstName: string;
    lastName: string;
  };
}

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
}

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Tous les événements' },
    { value: 'concert', label: 'Concerts' },
    { value: 'theatre', label: 'Théâtre' },
    { value: 'sport', label: 'Sport' },
    { value: 'festival', label: 'Festivals' },
    { value: 'conference', label: 'Conférences' },
    { value: 'spectacle', label: 'Spectacles' },
    { value: 'formation', label: 'Formations' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les événements
      const eventsResponse = await api.get('/events', {
        params: {
          category: selectedCategory,
          status: 'published'
        }
      });
      
      if (eventsResponse.data.success) {
        const allEvents = eventsResponse.data.data;
        setEvents(allEvents);
        setFeaturedEvents(allEvents.filter((event: Event) => event.isFeatured));
      }

      // Récupérer les slides
      try {
        const slidesResponse = await api.get('/slides');
        if (slidesResponse.data.success) {
          setSlides(slidesResponse.data.data.filter((slide: Slide) => slide.isActive));
        }
      } catch (slideError) {
        console.log('Pas de slides disponibles');
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
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec Slides */}
      {slides.length > 0 && (
        <section className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {slides[0]?.title || 'Kanzey.co'}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                {slides[0]?.description || 'La première plateforme sénégalaise de billetterie événementielle'}
              </p>
              <Link
                to={slides[0]?.buttonLink || '/events'}
                className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                {slides[0]?.buttonText || 'Découvrir les événements'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Événements à la une */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Événements à la une</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez les événements les plus populaires et ne manquez aucune occasion de vivre des moments inoubliables
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.slice(0, 3).map((event) => (
                <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        À la une
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.shortDescription || event.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{formatDate(event.date)} à {event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.availableTickets} places disponibles</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-600">{event.price.toLocaleString()} FCFA</span>
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Acheter
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recherche et filtres */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tous les événements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez notre sélection complète d'événements culturels, artistiques et sportifs au Sénégal
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {event.category}
                      </span>
                    </div>
                    {event.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          À la une
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.shortDescription || event.description}
                    </p>
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center text-gray-600 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{event.availableTickets} places</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-yellow-600">
                        {event.price.toLocaleString()} FCFA
                      </span>
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Acheter
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Aucun événement disponible pour le moment'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Organisez votre propre événement
          </h2>
          <p className="text-xl text-white mb-8">
            Rejoignez notre plateforme et vendez vos billets en ligne facilement
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;