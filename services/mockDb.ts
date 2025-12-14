import { Booking, BookingStatus, Room, User, UserRole } from "../types";
import { INITIAL_ROOMS, MOCK_ADMIN_USER } from "../constants";

const DB_KEYS = {
  ROOMS: 'staysimple_rooms',
  BOOKINGS: 'staysimple_bookings',
  USERS: 'staysimple_users',
  USER: 'staysimple_user' // Simple session persistence
};

// Initialize DB if empty
const initDb = () => {
  if (!localStorage.getItem(DB_KEYS.ROOMS)) {
    localStorage.setItem(DB_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
  }
  if (!localStorage.getItem(DB_KEYS.BOOKINGS)) {
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    // Init with Admin user
    const adminUser = { ...MOCK_ADMIN_USER, password: 'admin123' };
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([adminUser]));
  }
};

initDb();

// --- Helpers ---

export const getRooms = (): Room[] => {
  const data = localStorage.getItem(DB_KEYS.ROOMS);
  return data ? JSON.parse(data) : [];
};

export const getBookings = (): Booking[] => {
  const data = localStorage.getItem(DB_KEYS.BOOKINGS);
  return data ? JSON.parse(data) : [];
};

const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings));
};

const saveRooms = (rooms: Room[]) => {
  localStorage.setItem(DB_KEYS.ROOMS, JSON.stringify(rooms));
};

// --- Logic ---

export const checkAvailability = (roomId: string, start: string, end: string): boolean => {
  const bookings = getBookings();
  const startDate = new Date(start);
  const endDate = new Date(end);

  return !bookings.some(b => {
    if (b.roomId !== roomId || b.status === BookingStatus.CANCELLED) return false;
    
    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);

    // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
    return startDate < bEnd && endDate > bStart;
  });
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!checkAvailability(bookingData.roomId, bookingData.startDate, bookingData.endDate)) {
    throw new Error("Room is no longer available for these dates.");
  }

  const newBooking: Booking = {
    ...bookingData,
    id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: BookingStatus.CONFIRMED, // In MVP we assume payment success immediately confirms
    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  bookings.push(newBooking);
  saveBookings(bookings);
  
  return newBooking;
};

export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].status = status;
    saveBookings(bookings);
  }
};

export const addRoom = async (room: Room): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const rooms = getRooms();
    rooms.push(room);
    saveRooms(rooms);
};

// --- Auth Simulation ---

const getUsers = (): any[] => {
    const u = localStorage.getItem(DB_KEYS.USERS);
    return u ? JSON.parse(u) : [];
}

const saveUsers = (users: any[]) => {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
}

export const login = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
      throw new Error("Invalid email or password");
  }

  // Remove password from session object
  const { password: _, ...sessionUser } = user;
  localStorage.setItem(DB_KEYS.USER, JSON.stringify(sessionUser));
  return sessionUser as User;
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("User with this email already exists");
    }

    const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        password, // In real app, hash this!
        role: UserRole.CUSTOMER
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...sessionUser } = newUser;
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(sessionUser));
    return sessionUser as User;
};

export const logout = () => {
  localStorage.removeItem(DB_KEYS.USER);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(DB_KEYS.USER);
  return u ? JSON.parse(u) : null;
};