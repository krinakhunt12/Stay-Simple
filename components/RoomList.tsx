import React, { useState, useMemo } from 'react';
import { Room, RoomType } from '../types';

interface RoomListProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, onSelectRoom }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCapacity, setFilterCapacity] = useState<string>('all');

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const typeMatch = filterType === 'all' || room.type === filterType;
      const capacityMatch = filterCapacity === 'all' || room.capacity >= Number(filterCapacity);
      return typeMatch && capacityMatch;
    });
  }, [rooms, filterType, filterCapacity]);

  return (
    <div className="relative z-20 -mt-24 px-4 max-w-7xl mx-auto">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room Type</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-3"
              >
                <option value="all">All Rooms</option>
                <option value={RoomType.STANDARD}>{RoomType.STANDARD}</option>
                <option value={RoomType.DELUXE}>{RoomType.DELUXE}</option>
                <option value={RoomType.SUITE}>{RoomType.SUITE}</option>
              </select>
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guests</label>
              <select 
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
                className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-3"
              >
                <option value="all">Any Capacity</option>
                <option value="1">1+ Guest</option>
                <option value="2">2+ Guests</option>
                <option value="4">4+ Guests</option>
              </select>
           </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-sm text-slate-500 font-medium">{filteredRooms.length} rooms available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col h-full border border-slate-100/50">
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10"></div>
              <img 
                src={room.imageUrl} 
                alt={room.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                 <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 uppercase tracking-widest shadow-sm">
                   {room.type}
                 </span>
              </div>
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs">
                 <i className="fa-solid fa-star text-amber-400"></i>
                 <span className="font-bold">{room.rating}</span>
                 <span className="text-white/70">({room.reviews})</span>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{room.name}</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900">${room.price}</span>
                  <span className="text-xs text-slate-400 block font-medium">/ night</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">{room.description}</p>
              
              <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-6">
                  {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 text-xs px-3 py-1.5 rounded-full border border-slate-100 font-medium">
                      {amenity}
                      </span>
                  ))}
                  {room.amenities.length > 3 && (
                      <span className="text-xs text-slate-400 py-1.5 px-2">+{room.amenities.length - 3}</span>
                  )}
                  </div>
                  <button 
                  onClick={() => onSelectRoom(room)}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                  <span>Book Now</span>
                  <i className="fa-solid fa-arrow-right text-sm opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                  </button>
              </div>
            </div>
          </div>
        ))}
        {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <i className="fa-solid fa-filter-circle-xmark text-4xl text-slate-300 mb-4"></i>
                <h3 className="text-lg font-bold text-slate-700">No rooms match your filters</h3>
                <p className="text-slate-500">Try adjusting your search criteria.</p>
                <button 
                    onClick={() => { setFilterType('all'); setFilterCapacity('all'); }}
                    className="mt-4 text-brand-600 font-bold hover:underline"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>
    </div>
  );
};