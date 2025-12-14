import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, Room } from '../types';
import { getBookings, getRooms, updateBookingStatus, addRoom } from '../services/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [view, setView] = useState<'overview' | 'bookings' | 'rooms'>('overview');
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState(100);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBookings(getBookings().reverse());
    setRooms(getRooms());
  };

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await updateBookingStatus(id, newStatus);
    refreshData();
  };
  
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRoom({
       id: `r_${Date.now()}`,
       name: newRoomName,
       type: 'Standard' as any,
       price: Number(newRoomPrice),
       capacity: 2,
       description: 'New room added by admin.',
       amenities: ['Wifi'],
       imageUrl: 'https://picsum.photos/800/600',
       rating: 0,
       reviews: 0
    });
    setIsAddingRoom(false);
    setNewRoomName('');
    refreshData();
  };

  const chartData = bookings.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.startDate);
    if (existing) {
      existing.bookings += 1;
    } else {
      acc.push({ name: curr.startDate, bookings: 1 });
    }
    return acc;
  }, [] as any[]).sort((a,b) => a.name.localeCompare(b.name)).slice(-7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-serif font-bold text-slate-900">Dashboard</h1>
           <p className="text-slate-500 text-sm">Manage inventory and view performance.</p>
        </div>
        <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 inline-flex">
          {['overview', 'bookings', 'rooms'].map((v) => (
             <button 
                key={v}
                onClick={() => setView(v as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${view === v ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {v}
              </button>
          ))}
        </div>
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Bookings</h3>
                    <p className="text-4xl font-serif font-bold text-slate-900 mt-2">{bookings.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <i className="fa-solid fa-calendar-check text-xl"></i>
                  </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Revenue (Est)</h3>
                    <p className="text-4xl font-serif font-bold text-emerald-600 mt-2">
                        ${bookings.filter(b => b.status !== BookingStatus.CANCELLED).reduce((acc, b) => acc + b.totalPrice, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <i className="fa-solid fa-dollar-sign text-xl"></i>
                  </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Rooms</h3>
                    <p className="text-4xl font-serif font-bold text-slate-900 mt-2">{rooms.length}</p>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                      <i className="fa-solid fa-bed text-xl"></i>
                  </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-serif">Recent Booking Activity</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Plus Jakarta Sans' }}
                />
                <Bar dataKey="bookings" fill="#1e1b4b" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{booking.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{booking.guestName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                       {rooms.find(r => r.id === booking.roomId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {booking.startDate} <span className="text-slate-300 mx-1">→</span> {booking.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border 
                        ${booking.status === BookingStatus.CONFIRMED ? 'bg-green-50 text-green-700 border-green-100' : 
                          booking.status === BookingStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status !== BookingStatus.CANCELLED && (
                        <button 
                          onClick={() => handleStatusChange(booking.id, BookingStatus.CANCELLED)}
                          className="text-red-500 hover:text-red-700 font-medium hover:underline decoration-red-200 underline-offset-4"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {view === 'rooms' && (
        <div>
           <div className="flex justify-end mb-6">
               <button 
                 onClick={() => setIsAddingRoom(true)}
                 className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-slate-800 text-sm font-medium transition-all"
               >
                 <i className="fa-solid fa-plus mr-2"></i> Add Room
               </button>
           </div>
           
           {isAddingRoom && (
               <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-8 shadow-sm">
                   <h3 className="font-bold text-lg mb-6 font-serif">Add New Room</h3>
                   <form onSubmit={handleAddRoom} className="flex gap-4 items-end">
                       <div className="flex-grow">
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room Name</label>
                           <input 
                             type="text" 
                             required
                             value={newRoomName} 
                             onChange={e => setNewRoomName(e.target.value)} 
                             className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors"
                             placeholder="e.g. Ocean View Suite"
                           />
                       </div>
                        <div className="w-32">
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price / Night</label>
                           <input 
                             type="number" 
                             required
                             value={newRoomPrice} 
                             onChange={e => setNewRoomPrice(Number(e.target.value))} 
                             className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white transition-colors"
                           />
                       </div>
                       <button type="submit" className="bg-emerald-600 text-white px-6 py-3.5 rounded-lg hover:bg-emerald-700 font-medium transition-colors">Save</button>
                       <button type="button" onClick={() => setIsAddingRoom(false)} className="text-slate-500 px-6 py-3.5 hover:text-slate-800 transition-colors">Cancel</button>
                   </form>
               </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                  <div key={room.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4">
                      <img src={room.imageUrl} className="w-24 h-24 object-cover rounded-xl" alt="" />
                      <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-slate-900 font-serif text-lg">{room.name}</h4>
                          <span className="inline-block text-xs font-bold text-slate-500 uppercase tracking-wide mt-1 mb-2">{room.type}</span>
                          <p className="text-brand-600 font-bold">${room.price} <span className="text-xs font-normal text-slate-400">/night</span></p>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};