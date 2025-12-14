import { Room, RoomType } from "./types";

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Cozy Standard',
    type: RoomType.STANDARD,
    price: 99,
    capacity: 2,
    description: 'A comfortable room perfect for solo travelers or couples. Features a queen bed and garden view.',
    amenities: ['Wifi', 'TV', 'Coffee Maker'],
    imageUrl: 'https://picsum.photos/800/600?random=1',
    rating: 4.5,
    reviews: 124
  },
  {
    id: 'r2',
    name: 'Standard Twin',
    type: RoomType.STANDARD,
    price: 109,
    capacity: 2,
    description: 'Two twin beds with modern decor and essential amenities.',
    amenities: ['Wifi', 'TV', 'Desk'],
    imageUrl: 'https://picsum.photos/800/600?random=2',
    rating: 4.3,
    reviews: 89
  },
  {
    id: 'r3',
    name: 'Deluxe Ocean',
    type: RoomType.DELUXE,
    price: 189,
    capacity: 2,
    description: 'Spacious room with a balcony overlooking the ocean. Includes a king-size bed.',
    amenities: ['Wifi', 'Ocean View', 'Minibar', 'Bathrobe'],
    imageUrl: 'https://picsum.photos/800/600?random=3',
    rating: 4.8,
    reviews: 215
  },
  {
    id: 'r4',
    name: 'Family Suite',
    type: RoomType.SUITE,
    price: 299,
    capacity: 4,
    description: 'Large suite with separate living area, kitchenette, and sleeping arrangements for four.',
    amenities: ['Wifi', 'Kitchenette', 'Living Area', '2 Bathrooms'],
    imageUrl: 'https://picsum.photos/800/600?random=4',
    rating: 4.7,
    reviews: 156
  },
  {
    id: 'r5',
    name: 'Penthouse Suite',
    type: RoomType.SUITE,
    price: 450,
    capacity: 2,
    description: 'Top floor luxury with private terrace and premium service.',
    amenities: ['Wifi', 'Private Terrace', 'Jacuzzi', 'Room Service'],
    imageUrl: 'https://picsum.photos/800/600?random=5',
    rating: 5.0,
    reviews: 42
  }
];

export const MOCK_ADMIN_USER = {
  id: 'admin1',
  name: 'Hotel Manager',
  email: 'admin@staysimple.com',
  role: 'admin'
};

export const ADDONS = [
  { id: 'breakfast', name: 'Daily Breakfast Buffet', price: 25, type: 'per_night' },
  { id: 'shuttle', name: 'Airport Shuttle', price: 50, type: 'one_time' },
  { id: 'champagne', name: 'Bottle of Champagne', price: 85, type: 'one_time' },
  { id: 'late_checkout', name: 'Late Checkout (2PM)', price: 40, type: 'one_time' },
] as const;