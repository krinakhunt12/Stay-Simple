import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 bg-brand-900 text-white rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:bg-brand-700 transition-colors">
                 <i className="fa-solid fa-hotel text-xl"></i>
              </div>
              <span className={`font-serif font-bold text-2xl tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-slate-900 lg:text-white'}`}>
                StaySimple
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {['home', 'about', 'contact', 'my-bookings'].map((item) => {
                 if (item === 'my-bookings' && (!user || user.role === 'admin')) return null;
                 
                 let label = '';
                 switch(item) {
                    case 'home': label = 'Rooms'; break;
                    case 'about': label = 'About'; break;
                    case 'contact': label = 'Contact'; break;
                    case 'my-bookings': label = 'My Bookings'; break;
                    default: label = item;
                 }

                 return (
                   <button 
                    key={item}
                    onClick={() => onNavigate(item)} 
                    className={`text-sm font-medium tracking-wide transition-colors ${
                      currentPage === item 
                        ? 'text-brand-600 font-bold' 
                        : scrolled ? 'text-slate-600 hover:text-brand-600' : 'text-slate-800 lg:text-white/90 lg:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                 )
              })}
              
              {user && user.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')} 
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    currentPage === 'admin' 
                      ? 'text-brand-600 font-bold' 
                      : scrolled ? 'text-slate-600 hover:text-brand-600' : 'text-slate-800 lg:text-white/90 lg:hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium hidden sm:inline ${scrolled ? 'text-slate-700' : 'text-slate-800 lg:text-white'}`}>
                    {user.name}
                  </span>
                  <button 
                    onClick={onLogout}
                    className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-500 hover:text-red-600' : 'text-slate-800 lg:text-white/80 lg:hover:text-white'}`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onNavigate('login')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    scrolled 
                      ? 'bg-brand-900 text-white hover:bg-brand-700' 
                      : 'bg-white text-brand-900 hover:bg-brand-50'
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-brand-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <span className="font-serif font-bold text-2xl tracking-tight block mb-4">StaySimple</span>
                    <p className="text-brand-100 text-sm leading-relaxed">
                        Redefining luxury hospitality with seamless technology and personalized care.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-brand-100">Explore</h4>
                    <ul className="space-y-2 text-sm text-brand-100/70">
                        <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Rooms & Suites</button></li>
                        <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Dining</button></li>
                        <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Wellness</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-brand-100">Company</h4>
                    <ul className="space-y-2 text-sm text-brand-100/70">
                        <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button></li>
                        <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">Careers</button></li>
                        <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">Press</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-brand-100">Contact</h4>
                    <ul className="space-y-2 text-sm text-brand-100/70">
                        <li>123 Luxury Ave, NY</li>
                        <li>+1 (555) 123-4567</li>
                        <li>hello@staysimple.com</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-brand-100/50">
                <p>© {new Date().getFullYear()} StaySimple Hotels. MVP Demo.</p>
                <button 
                  onClick={() => onNavigate('admin-login')}
                  className="mt-4 md:mt-0 text-brand-100/30 hover:text-white/80 transition-colors text-xs uppercase tracking-widest"
                >
                  Admin Access
                </button>
            </div>
        </div>
      </footer>
    </div>
  );
};