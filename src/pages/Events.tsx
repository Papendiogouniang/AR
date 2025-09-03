import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  SortAsc,
  Star,
  Music,
  Theater,
  Trophy,
  Mic,
  Palette,
  Grid,
  List
} from 'lucide-react';
import { apiHelpers } from '../services/api';
import { Event, EventFilters } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';

const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 12,
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    sortBy: 'date',
    sortOrder: 'asc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const categories = [
    { value: 'all', label: 'Toutes les catégories', icon: Star, color: 'bg-yellow-500' },
    { value: 'concert', label: 'Concerts', icon: Music, color: 'bg-purple-500' },
    { value: 'theatre', label: 'Théâtre', icon: Theater, color: 'bg-red-500' },
    { value: 'sport', label: 'Sport', icon: Trophy, color: 'bg-green-500' },
    { value: 'conference', label: 'Conférences', icon: Mic, color: 'bg-blue-500' },
    { value: 'festival', label: 'Festivals', icon: Palette, color: 'bg-pink-500' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'price', label: 'Prix' },
    { value: 'title', label: 'Titre' },
    { value: 'popularity', label: 'Popularité' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.category === 'all') {
        delete params.category;
      }

      const response = await apiHelpers.getEvents(params);
      if (response.success) {
        setEvents(response.data.events || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalEvents(response.data.pagination.totalEvents);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof EventFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: key !== 'page' ? 1 : value
    };
    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (newFilters.category && newFilters.category !== 'all') {
      newSearchParams.set('category', newFilters.category);
    }
    if (newFilters.search) {
      newSearchParams.set('search', newFilters.search);
    }
    setSearchParams(newSearchParams);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('fr-FR')} ${currency}`;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || Star;
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.color || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Découvrez nos événements
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorez une sélection d'événements culturels, artistiques et sportifs au Sénégal
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Trier par {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            {totalEvents} événement{totalEvents !== 1 ? 's' : ''} trouvé{totalEvents !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement des événements..." />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button 
              variant="primary"
              onClick={() => setFilters(prev => ({ ...prev, search: '', category: 'all', page: 1 }))}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {events.map((event) => {
                  const CategoryIcon = getCategoryIcon(event.category);
                  const eventDate = formatDate(event.date);
                  
                  return (
                    <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="relative">
                        {event.primaryImage ? (
                          <img
                            src={event.primaryImage}
                            alt={event.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className={`w-full h-48 ${getCategoryColor(event.category)} flex items-center justify-center`}>
                            <CategoryIcon className="w-16 h-16 text-white" />
                          </div>
                        )}
                        
                        <div className="absolute top-4 left-4">
                          <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm capitalize">
                            {event.category}
                          </span>
                        </div>

                        {event.isFeatured && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Une
                            </span>
                          </div>
                        )}

                        {/* Date Badge */}
                        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-2 shadow-md">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{eventDate.day}</div>
                            <div className="text-xs text-gray-600 uppercase">{eventDate.month}</div>
                          </div>
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
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
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
                            {eventDate.day} {eventDate.month} à {eventDate.time}
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

                        <div className="flex justify-between items-center">
                          <div className="text-xl font-bold text-yellow-600">
                            {formatPrice(event.price, event.currency)}
                          </div>
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
            ) : (
              <div className="space-y-6 mb-12">
                {events.map((event) => {
                  const CategoryIcon = getCategoryIcon(event.category);
                  const eventDate = formatDate(event.date);
                  
                  return (
                    <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                        {/* Image */}
                        <div className="lg:col-span-1">
                          <div className="relative">
                            {event.primaryImage ? (
                              <img
                                src={event.primaryImage}
                                alt={event.title}
                                className="w-full h-32 lg:h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <div className={`w-full h-32 lg:h-24 ${getCategoryColor(event.category)} rounded-lg flex items-center justify-center`}>
                                <CategoryIcon className="w-8 h-8 text-white" />
                              </div>
                            )}
                            
                            <div className="absolute top-2 left-2">
                              <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs capitalize">
                                {event.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {event.title}
                            </h3>
                            {event.isFeatured && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                À la une
                              </span>
                            )}
                          </div>
                          
                          {event.shortDescription && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {event.shortDescription}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-yellow-500" />
                              {eventDate.day} {eventDate.month} {eventDate.year}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-yellow-500" />
                              {event.location.city}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-yellow-500" />
                              {event.availableTickets} places
                            </div>
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="lg:col-span-1 flex flex-col justify-between">
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-yellow-600">
                              {formatPrice(event.price, event.currency)}
                            </div>
                            <div className="text-sm text-gray-500">par billet</div>
                          </div>
                          
                          <Link to={`/events/${event._id}`} className="block">
                            <Button 
                              variant={event.availableTickets > 0 ? "primary" : "outline"}
                              fullWidth
                            >
                              {event.availableTickets > 0 ? 'Acheter maintenant' : 'Voir détails'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => updateFilter('page', Math.max(1, filters.page! - 1))}
                  disabled={filters.page === 1}
                >
                  Précédent
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('page', page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      {totalPages > 6 && <span className="px-2 text-gray-500">...</span>}
                      <Button
                        variant={filters.page === totalPages ? "primary" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('page', totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => updateFilter('page', Math.min(totalPages, filters.page! + 1))}
                  disabled={filters.page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;