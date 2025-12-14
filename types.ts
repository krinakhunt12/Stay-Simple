export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum RoomType {
  STANDARD = 'Standard',
  DELUXE = 'Deluxe',
  SUITE = 'Suite'
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  rating: number;
  reviews: number;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface BookingAddon {
  id: string;
  name: string;
  price: number;
  type: 'per_night' | 'one_time';
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  guestName: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string;   // ISO Date YYYY-MM-DD
  addons: BookingAddon[];
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflictingBooking?: Booking;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}