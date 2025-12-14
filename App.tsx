import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RoomList } from './components/RoomList';
import { BookingModal } from './components/BookingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ConciergeChat } from './components/ConciergeChat';
import { login, signup, logout, getCurrentUser, getRooms, getBookings } from './services/mockDb';
import { User, Room } from './types';

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // Auth Form State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    setRooms(getRooms());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const u = await login(email, password);
      // For User Login page: redirect admins to dashboard if they accidentally login here, 
      // or we could block them. Let's redirect for convenience but keep the UI user-focused.
      setUser(u);
      setPage(u.role === 'admin' ? 'admin' : 'home');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const u = await login(email, password);
      if (u.role !== 'admin') {
        throw new Error("Access Denied: You do not have administrator privileges.");
      }
      setUser(u);
      setPage('admin');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      if (!name.trim()) {
          setAuthError("Name is required");
          return;
      }
      try {
          const u = await signup(name, email, password);
          setUser(u);
          setPage('home');
          setName('');
          setEmail('');
          setPassword('');
      } catch (err: any) {
          setAuthError(err.message || 'Signup failed');
      }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage('home');
  };

  const renderContent = () => {
    if (page === 'admin-login') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700">
             <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-brand-600 text-white rounded-xl flex items-center justify-center text-3xl shadow-lg mb-6">
                   <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                  Admin Portal
                </h2>
                <p className="mt-2 text-slate-400 text-sm">
                  Restricted access for hotel management only.
                </p>
                 <div className="mt-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-xs text-slate-300">
                    <span className="font-bold text-brand-400">Demo Credentials:</span> admin@staysimple.com / admin123
                  </div>
             </div>
             
             <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                         <i className="fa-solid fa-envelope"></i>
                      </div>
                      <input
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg leading-5 bg-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm"
                        placeholder="admin@staysimple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                         <i className="fa-solid fa-lock"></i>
                      </div>
                      <input
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg leading-5 bg-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {authError}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-lg transition-all"
                  >
                    Enter Dashboard
                  </button>
                </div>
             </form>

             <div className="text-center pt-4 border-t border-slate-700">
               <button onClick={() => setPage('home')} className="text-sm text-slate-400 hover:text-white transition-colors">
                 <i className="fa-solid fa-arrow-left mr-2"></i> Return to Home
               </button>
             </div>
          </div>
        </div>
      );
    }

    if (page === 'login') {
      return (
        <div className="flex min-h-screen bg-white">
          {/* Left Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white">
            <div className="max-w-md w-full space-y-10">
              <div className="text-center lg:text-left">
                <div className="inline-block p-3 rounded-full bg-slate-50 text-slate-900 mb-6">
                   <i className={`fa-solid ${isLoginMode ? 'fa-right-to-bracket' : 'fa-user-plus'} text-2xl`}></i>
                </div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
                  {isLoginMode ? 'Guest Sign In' : 'Join StaySimple'}
                </h2>
                <p className="mt-3 text-slate-500 text-lg">
                  {isLoginMode 
                    ? 'Access your bookings and exclusive offers.' 
                    : 'Create an account to start booking your perfect stay.'}
                </p>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button 
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => { setIsLoginMode(true); setAuthError(''); }}
                  >
                      Sign In
                  </button>
                  <button 
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => { setIsLoginMode(false); setAuthError(''); }}
                  >
                      Sign Up
                  </button>
              </div>

              <form className="space-y-6" onSubmit={isLoginMode ? handleLogin : handleSignup}>
                <div className="space-y-5">
                  {!isLoginMode && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          required={!isLoginMode}
                          className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {authError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> {authError}</div>}

                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-lg hover:shadow-xl hover:translate-y-px"
                >
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
          {/* Right Side - Image */}
          <div className="hidden lg:block lg:w-1/2 relative">
             <img 
               src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80" 
               className="absolute inset-0 w-full h-full object-cover"
               alt="Hotel Lobby"
             />
             <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
             <div className="absolute bottom-12 left-12 right-12 text-white">
                <blockquote className="font-serif text-3xl italic leading-relaxed">
                   "Hospitality is simply an opportunity to show love and care."
                </blockquote>
                <p className="mt-4 font-bold uppercase tracking-widest text-sm text-slate-200">StaySimple Experiences</p>
             </div>
          </div>
        </div>
      );
    }

    if (page === 'admin') {
      if (!user || user.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-12 text-center text-red-500 font-bold text-xl">
           <div>
             <i className="fa-solid fa-ban text-4xl mb-4 text-red-400"></i>
             <p>Access Denied</p>
             <button onClick={() => setPage('home')} className="mt-4 text-sm text-slate-500 underline">Go Home</button>
           </div>
        </div>;
      }
      return <AdminDashboard />;
    }

    if (page === 'my-bookings') {
        if (!user) return null;
        const myBookings = getBookings().filter(b => b.userId === user.id);
        return (
            <div className="max-w-4xl mx-auto py-24 px-4 min-h-screen">
                <h2 className="text-3xl font-serif font-bold mb-8 text-slate-900 border-b pb-4">My Reservations</h2>
                {myBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <i className="fa-solid fa-suitcase-rolling text-4xl text-slate-300 mb-4"></i>
                        <p className="text-slate-500">You haven't booked any trips yet.</p>
                        <button onClick={() => setPage('home')} className="mt-4 text-brand-600 font-bold hover:underline">Browse Rooms</button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {myBookings.map(b => (
                            <div key={b.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow">
                                <div className="flex gap-6 items-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                       <i className="fa-solid fa-bed text-2xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-serif font-bold text-xl text-slate-900">
                                            {rooms.find(r => r.id === b.roomId)?.name || 'Room'}
                                        </h4>
                                        <div className="flex items-center gap-4 text-slate-500 mt-1">
                                            <span className="flex items-center gap-2"><i className="fa-regular fa-calendar"></i> {b.startDate}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="flex items-center gap-2"><i className="fa-regular fa-calendar-check"></i> {b.endDate}</span>
                                        </div>
                                        {b.addons && b.addons.length > 0 && (
                                            <div className="mt-2 text-sm text-slate-500">
                                                <span className="font-bold">Extras:</span> {b.addons.map(a => a.name).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right mt-4 md:mt-0">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>
                                        {b.status}
                                    </span>
                                    <p className="font-serif font-bold text-2xl mt-3 text-slate-900">${b.totalPrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (page === 'about') {
        return (
            <div className="bg-white">
                <div className="relative h-[60vh] overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80" 
                        alt="Luxury Hotel Hall" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white shadow-lg">Our Story</h1>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-8">
                    <span className="text-brand-600 font-bold uppercase tracking-widest text-xs">Since 1995</span>
                    <h2 className="text-4xl font-serif font-bold text-slate-900">Redefining Hospitality</h2>
                    <p className="text-lg text-slate-600 leading-relaxed font-light">
                        StaySimple began with a simple philosophy: luxury shouldn't be complicated. Nestled in the heart of the city, we provide an oasis of calm for travelers seeking more than just a place to sleep. Our commitment to sustainability, personalized service, and architectural beauty has made us a destination in our own right.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                        <div className="p-6 bg-slate-50 rounded-2xl">
                            <p className="text-4xl font-serif font-bold text-brand-900 mb-2">25+</p>
                            <p className="text-sm text-slate-500 uppercase tracking-wide">Years of Excellence</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl">
                            <p className="text-4xl font-serif font-bold text-brand-900 mb-2">150+</p>
                            <p className="text-sm text-slate-500 uppercase tracking-wide">Awards Won</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl">
                            <p className="text-4xl font-serif font-bold text-brand-900 mb-2">10k+</p>
                            <p className="text-sm text-slate-500 uppercase tracking-wide">Happy Guests</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (page === 'contact') {
        return (
            <div className="bg-white">
                <div className="relative h-[60vh] overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80" 
                        alt="Contact Us" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white shadow-lg">Get in Touch</h1>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto py-24 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Contact Information</h3>
                                <p className="text-slate-600 mb-8">We are here to assist you with any inquiries or special requests.</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-700">
                                        <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </div>
                                        <span>123 Luxury Ave, New York, NY 10001</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-700">
                                        <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                                            <i className="fa-solid fa-phone"></i>
                                        </div>
                                        <span>+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-700">
                                        <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                                            <i className="fa-solid fa-envelope"></i>
                                        </div>
                                        <span>concierge@staysimple.com</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2">Opening Hours</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Front Desk</span>
                                        <span className="font-bold">24/7</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Spa & Wellness</span>
                                        <span className="font-bold">8:00 AM - 9:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Restaurant</span>
                                        <span className="font-bold">7:00 AM - 11:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Send us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                                        <input type="text" className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-brand-500 focus:border-brand-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                                        <input type="text" className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-brand-500 focus:border-brand-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                                    <input type="email" className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-brand-500 focus:border-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                                    <textarea rows={4} className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-brand-500 focus:border-brand-500"></textarea>
                                </div>
                                <button type="button" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Home
    return (
      <div className="bg-slate-50">
        {/* Hero Section */}
        <div className="relative h-[90vh] overflow-hidden">
            <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
                  className="w-full h-full object-cover animate-ken-burns"
                  style={{ animationDuration: '20s' }}
                  alt="Resort Pool"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-900/90"></div>
            </div>
            
            <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-white/90 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-lg">
                        The Ultimate Escape
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-white leading-tight shadow-sm drop-shadow-2xl">
                        Sanctuary for the <br/><span className="italic text-brand-200">Modern Soul</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
                        Discover a world where refined luxury meets effortless comfort. Your journey to relaxation begins here.
                    </p>
                    <div className="pt-8 flex justify-center gap-4">
                        <button 
                          onClick={() => {
                              document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-brand-50 transition-all transform hover:-translate-y-1 shadow-2xl"
                        >
                            Reserve Your Stay
                        </button>
                        <button 
                             onClick={() => {
                              document.getElementById('amenities-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                            className="bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                            Explore
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Room List Section */}
        <div id="rooms-section" className="pb-24 pt-12">
            <div className="max-w-7xl mx-auto px-4 mb-16 pt-8 text-center">
                <span className="text-brand-600 font-bold uppercase tracking-widest text-xs">Accommodations</span>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mt-3">Curated Spaces</h2>
                <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Each room is designed with your comfort in mind, featuring bespoke furniture and stunning views.</p>
            </div>
            <RoomList rooms={rooms} onSelectRoom={setSelectedRoom} />
        </div>

        {/* Amenities Section */}
        <div id="amenities-section" className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-4">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                     <div>
                        <span className="text-brand-600 font-bold uppercase tracking-widest text-xs">Experience</span>
                        <h2 className="text-4xl font-serif font-bold text-slate-900 mt-3 mb-6">World Class Amenities</h2>
                        <p className="text-slate-500 leading-relaxed mb-8">
                            From our award-winning spa to our rooftop infinity pool, every detail at StaySimple is crafted to provide an unforgettable experience. Indulge in culinary delights at our Michelin-starred restaurant or unwind in our private gardens.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                                    <i className="fa-solid fa-spa text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Luxury Spa</h4>
                                    <p className="text-sm text-slate-500 mt-1">Rejuvenate with organic treatments.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                                    <i className="fa-solid fa-water-ladder text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Infinity Pool</h4>
                                    <p className="text-sm text-slate-500 mt-1">Panoramic city views.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                                    <i className="fa-solid fa-utensils text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Fine Dining</h4>
                                    <p className="text-sm text-slate-500 mt-1">Local ingredients, world flavors.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                                    <i className="fa-solid fa-wifi text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">High-Speed Wifi</h4>
                                    <p className="text-sm text-slate-500 mt-1">Stay connected everywhere.</p>
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="relative">
                         <div className="absolute -inset-4 bg-brand-100/50 rounded-full filter blur-3xl opacity-50"></div>
                         <img 
                            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                            className="relative rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                            alt="Spa treatment"
                         />
                     </div>
                 </div>
            </div>
        </div>

        {/* Testimonials */}
        <div className="bg-slate-900 py-24 text-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <i className="fa-solid fa-quote-left text-4xl text-brand-500 mb-8 opacity-50"></i>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-12 leading-tight">"The most relaxing vacation we've<br/> ever had. Simply perfection."</h2>
                <div className="flex justify-center items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-12 h-12 rounded-full border-2 border-brand-500" alt="Reviewer" />
                    <div className="text-left">
                        <p className="font-bold text-lg">Sarah Jenkins</p>
                        <p className="text-slate-400 text-sm">Stayed in Deluxe Ocean Suite</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <Layout user={user} onLogout={handleLogout} onNavigate={setPage} currentPage={page}>
      {renderContent()}
      
      {selectedRoom && (
        <BookingModal 
          room={selectedRoom} 
          user={user}
          onClose={() => setSelectedRoom(null)} 
          onSuccess={() => {
              // Refresh handled by mockDb updates
          }}
          onNavigateLogin={() => {
              setSelectedRoom(null);
              setPage('login');
          }}
        />
      )}

      {/* AI Concierge Widget */}
      <ConciergeChat />
    </Layout>
  );
}

export default App;