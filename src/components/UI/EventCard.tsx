import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { Event } from '../../types';
import Button from './Button';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('fr-FR')} ${currency}`;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      concert: '🎵',
      theatre: '🎭',
      sport: '⚽',
      conference: '🎤',
      festival: '🎪',
      exposition: '🖼️',
      spectacle: '🎨'
    };
    return emojis[category] || '🎯';
  };

  const eventDate = formatDate(event.date);
  const isEventPassed = new Date(event.date) < new Date();
  const isSoldOut = event.availableTickets === 0;

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 ${
      featured ? 'ring-2 ring-yellow-400' : ''
    }`}>
      <div className="relative">
        {event.primaryImage ? (
          <img
            src={event.primaryImage}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
            <div className="text-4xl">{getCategoryEmoji(event.category)}</div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm capitalize">
            {getCategoryEmoji(event.category)} {event.category}
          </span>
          {event.isFeatured && (
            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Une
            </span>
          )}
        </div>

        {/* Status Badges */}
        {(isEventPassed || isSoldOut) && (
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isEventPassed 
                ? 'bg-gray-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isEventPassed ? 'Terminé' : 'Complet'}
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

        {/* Availability Warning */}
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
          <div className="text-2xl font-bold text-yellow-600">
            {formatPrice(event.price, event.currency)}
          </div>
          <Link to={`/events/${event._id}`}>
            <Button 
              variant={event.availableTickets > 0 ? "primary" : "outline"}
              disabled={isEventPassed}
            >
              {isEventPassed ? 'Terminé' : 
               event.availableTickets > 0 ? 'Acheter' : 'Voir détails'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;