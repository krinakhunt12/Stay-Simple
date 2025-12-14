import React, { useState } from 'react';
import { Room, User, BookingAddon } from '../types';
import { checkAvailability, createBooking } from '../services/mockDb';
import { ADDONS } from '../constants';

interface BookingModalProps {
  room: Room;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ room, user, onClose, onSuccess, onNavigateLogin }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'dates' | 'addons' | 'payment' | 'processing' | 'success'>('dates');

  // Basic validation helpers
  const today = new Date().toISOString().split('T')[0];

  const getDays = () => {
      if (!startDate || !endDate) return 0;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateAddonsTotal = () => {
      const days = getDays();
      return selectedAddons.reduce((acc, addonId) => {
          const addon = ADDONS.find(a => a.id === addonId);
          if (!addon) return acc;
          return acc + (addon.type === 'per_night' ? addon.price * days : addon.price);
      }, 0);
  };

  const calculateTotal = () => {
    const days = getDays();
    const roomTotal = days * room.price;
    return roomTotal + calculateAddonsTotal();
  };

  const handleCheckDates = () => {
    setError('');
    if (!startDate || !endDate) {
      setError('Please select both dates.');
      return;
    }
    if (startDate >= endDate) {
      setError('Check-out must be after check-in.');
      return;
    }
    
    const isAvailable = checkAvailability(room.id, startDate, endDate);
    if (!isAvailable) {
      setError('These dates are not available. Please try another range.');
      return;
    }

    setStep('addons');
  };

  const handleAddonsNext = () => {
    if (!user) {
        onNavigateLogin();
        return;
    }
    setStep('payment');
  }

  const toggleAddon = (id: string) => {
      if (selectedAddons.includes(id)) {
          setSelectedAddons(selectedAddons.filter(a => a !== id));
      } else {
          setSelectedAddons([...selectedAddons, id]);
      }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      const finalAddons: BookingAddon[] = selectedAddons
        .map(id => ADDONS.find(a => a.id === id)!)
        .filter(Boolean);

      await createBooking({
        roomId: room.id,
        userId: user!.id,
        guestName: user!.name,
        startDate,
        endDate,
        addons: finalAddons,
        totalPrice: calculateTotal()
      });
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
      setStep('payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
          
          <div className="flex flex-col md:flex-row h-full md:h-[600px]">
            {/* Sidebar Summary */}
            <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col h-full">
                <div className="mb-6">
                    <img src={room.imageUrl} className="w-full h-40 object-cover rounded-lg shadow-sm mb-4" alt={room.name}/>
                    <h3 className="text-xl font-serif font-bold text-slate-900">{room.name}</h3>
                    <p className="text-sm text-slate-500">{room.type}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <i className="fa-solid fa-star text-amber-400 text-xs"></i>
                        <span className="text-xs font-bold text-slate-700">{room.rating}</span>
                    </div>
                </div>

                <div className="flex-grow space-y-3">
                    {startDate && endDate && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Dates</span>
                                <span className="font-medium text-slate-900 text-right">{startDate}<br/>{endDate}</span>
                            </div>
                            <div className="border-t border-slate-200 my-2"></div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{getDays()} Nights</span>
                                <span className="font-medium text-slate-900">${getDays() * room.price}</span>
                            </div>
                            {selectedAddons.map(id => {
                                const addon = ADDONS.find(a => a.id === id);
                                if(!addon) return null;
                                const cost = addon.type === 'per_night' ? addon.price * getDays() : addon.price;
                                return (
                                    <div key={id} className="flex justify-between text-sm">
                                        <span className="text-slate-500 truncate pr-2">{addon.name}</span>
                                        <span className="font-medium text-slate-900">${cost}</span>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-slate-500 uppercase">Total</span>
                        <span className="text-3xl font-serif font-bold text-brand-700">${calculateTotal()}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 p-8 flex flex-col h-full relative overflow-y-auto">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                    <i className="fa-solid fa-times"></i>
                </button>

                {/* Progress */}
                <div className="flex items-center mb-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span className={step === 'dates' ? 'text-brand-600' : ''}>1. Dates</span>
                    <span className="mx-2">/</span>
                    <span className={step === 'addons' ? 'text-brand-600' : ''}>2. Add-ons</span>
                    <span className="mx-2">/</span>
                    <span className={step === 'payment' ? 'text-brand-600' : ''}>3. Pay</span>
                </div>

                <div className="flex-grow">
                    {step === 'dates' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-serif font-bold text-slate-900">Select your dates</h2>
                        <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-in</label>
                            <input 
                            type="date" 
                            min={today}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3 text-slate-700 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-out</label>
                            <input 
                            type="date" 
                            min={startDate || today}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3 text-slate-700 bg-slate-50"
                            />
                        </div>
                        </div>

                        {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg flex items-center gap-2">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>}

                        <div className="pt-4">
                            <button 
                                onClick={handleCheckDates}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-colors"
                            >
                                Check Availability
                            </button>
                        </div>
                    </div>
                    )}

                    {step === 'addons' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Enhance your stay</h2>
                            <div className="space-y-3">
                                {ADDONS.map(addon => (
                                    <div 
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedAddons.includes(addon.id) ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedAddons.includes(addon.id) ? 'bg-brand-500 border-brand-500' : 'border-slate-300'}`}>
                                                {selectedAddons.includes(addon.id) && <i className="fa-solid fa-check text-white text-xs"></i>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{addon.name}</p>
                                                <p className="text-xs text-slate-500">{addon.type === 'per_night' ? 'Per Night' : 'One-time fee'}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">+${addon.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep('dates')} className="w-1/3 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
                                <button onClick={handleAddonsNext} className="w-2/3 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-colors">Continue</button>
                            </div>
                        </div>
                    )}

                    {step === 'payment' && (
                    <form onSubmit={handlePayment} className="space-y-6 animate-fade-in-up">
                         <h2 className="text-2xl font-serif font-bold text-slate-900">Secure Payment</h2>
                        
                        <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Guest</p>
                                <p className="font-bold text-slate-900">{user?.name}</p>
                            </div>
                        </div>

                        <div className="border border-slate-200 p-5 rounded-xl relative shadow-sm">
                        <div className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Credit Card
                        </div>
                        <div className="space-y-4 mt-2">
                            <input type="text" placeholder="Card number" className="w-full border border-slate-200 p-3 rounded-lg bg-slate-50 text-slate-400" defaultValue="4242 4242 4242 4242" disabled />
                            <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="MM / YY" className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-slate-400" defaultValue="12 / 25" disabled />
                            <input type="text" placeholder="CVC" className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-slate-400" defaultValue="123" disabled />
                            </div>
                        </div>
                        </div>
                         
                         <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setStep('addons')} className="w-1/3 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
                                <button type="submit" className="w-2/3 bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30">Complete Booking</button>
                        </div>
                    </form>
                    )}

                    {step === 'processing' && (
                    <div className="text-center py-20 animate-fade-in-up">
                        <div className="relative inline-block">
                            <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                        </div>
                        <p className="text-slate-600 font-medium animate-pulse">Processing your reservation...</p>
                    </div>
                    )}

                    {step === 'success' && (
                    <div className="text-center py-12 animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_ease-in-out]">
                        <i className="fa-solid fa-check text-3xl text-green-600"></i>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">You're all set!</h3>
                        <p className="text-slate-500">A confirmation email has been sent to your inbox.</p>
                    </div>
                    )}
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};