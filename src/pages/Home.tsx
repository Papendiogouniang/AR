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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiHelpers } from '../services/api';
import { Event, Slide } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  useEffect(() => {
    // Auto-slide carousel
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les événements
      const eventsParams = selectedCategory === 'all' ? {} : { category: selectedCategory };
      const eventsResponse = await apiHelpers.getEvents(eventsParams);
      
      if (eventsResponse.success) {
        const allEvents = eventsResponse.data.events || [];
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
    event.location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('fr-FR')} ${currency}`;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || Star;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
      {slides.length > 0 ? (
        <section className="relative h-[600px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide._id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : 
                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              }`}
              style={{ backgroundColor: slide.backgroundColor }}
            >
              <div className="relative h-full">
                {slide.image?.url && (
                  <img
                    src={slide.image.url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className={`max-w-2xl ${
                      slide.position === 'center' ? 'mx-auto text-center' :
                      slide.position === 'right' ? 'ml-auto text-right' : 'text-left'
                    }`}>
                      <h1 
                        className="text-4xl md:text-6xl font-bold mb-6"
                        style={{ color: slide.textColor }}
                      >
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p 
                          className="text-xl md:text-2xl mb-4 opacity-90"
                          style={{ color: slide.textColor }}
                        >
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.description && (
                        <p 
                          className="text-lg mb-8 opacity-80"
                          style={{ color: slide.textColor }}
                        >
                          {slide.description}
                        </p>
                      )}
                      {slide.buttonText && slide.buttonLink && (
                        <Link
                          to={slide.buttonLink}
                          className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
                        >
                          {slide.buttonText}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-yellow-500' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        // Hero par défaut si pas de slides
        <section className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="text-6xl mb-6">🎟️</div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bienvenue sur <span className="text-yellow-300">Kanzey.co</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                La première plateforme sénégalaise de billetterie événementielle. 
                Découvrez et participez aux meilleurs événements culturels du Sénégal.
              </p>
              <Link
                to="/events"
                className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Découvrir les événements
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

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
              {featuredEvents.slice(0, 6).map((event) => {
                const CategoryIcon = getCategoryIcon(event.category);
                return (
                  <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      {event.primaryImage ? (
                        <img
                          src={event.primaryImage}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                          <CategoryIcon className="w-16 h-16 text-white" />
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          À la une
                        </span>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm capitalize">
                          {event.category}
                        </span>
                      </div>

                      {event.availableTickets < 10 && event.availableTickets > 0 && (
                        <div className="absolute bottom-4 right-4">
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                            Plus que {event.availableTickets}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      {event.shortDescription && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {event.shortDescription}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-yellow-500" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-yellow-500" />
                          {event.location.name}, {event.location.city}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Users className="w-4 h-4 mr-2 text-yellow-500" />
                          {event.availableTickets > 0 
                            ? `${event.availableTickets} places disponibles`
                            : 'Complet'
                          }
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-yellow-600">
                          {formatPrice(event.price, event.currency)}
                        </span>
                        <Link to={`/events/${event._id}`}>
                          <Button 
                            variant={event.availableTickets > 0 ? "primary" : "outline"}
                            size="sm"
                          >
                            {event.availableTickets > 0 ? 'Acheter' : 'Voir détails'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              {filteredEvents.slice(0, 8).map((event) => {
                const CategoryIcon = getCategoryIcon(event.category);
                return (
                  <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      {event.primaryImage ? (
                        <img
                          src={event.primaryImage}
                          alt={event.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                          <CategoryIcon className="w-12 h-12 text-white" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3">
                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs capitalize">
                          {event.category}
                        </span>
                      </div>

                      {event.isFeatured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Une
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="w-3 h-3 mr-2 text-yellow-500" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-3 h-3 mr-2 text-yellow-500" />
                          {event.location.city}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Users className="w-3 h-3 mr-2 text-yellow-500" />
                          {event.availableTickets > 0 
                            ? `${event.availableTickets} places`
                            : 'Complet'
                          }
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-yellow-600">
                          {formatPrice(event.price, event.currency)}
                        </span>
                        <Link to={`/events/${event._id}`}>
                          <Button 
                            variant={event.availableTickets > 0 ? "primary" : "outline"}
                            size="sm"
                          >
                            {event.availableTickets > 0 ? 'Acheter' : 'Détails'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
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