export const CAMPUS_HALLS = [
  { id: 'salami', name: 'Salami Hall', short: 'Salami Hall' },
  { id: 'motion', name: 'Motion Ground', short: 'Motion Ground' },
  { id: 'main-gate', name: 'Main Gate', short: 'Main Gate' },
  { id: 'female', name: 'Female Hostels', short: 'Female Hostels' },
  { id: 'teaching', name: 'Teaching Hospital', short: 'Teaching Hospital' },
  { id: 'pg', name: 'PG Hostel', short: 'PG Hostel' },
  { id: 'engineering', name: 'Engineering Complex', short: 'Engineering Complex' },
];

export const CAMPUS_CATEGORIES = [
  { id: 'all', name: 'All', slug: '' },
  { id: 'tech', name: 'Tech & Gadgets', slug: 'electronics' },
  { id: 'textbooks', name: 'Textbooks & Notes', slug: 'books' },
  { id: 'fashion', name: 'Fashion', slug: 'fashion' },
  { id: 'food', name: 'Food & Snacks', slug: 'food' },
  { id: 'hostel', name: 'Hostel Essentials', slug: 'home' },
  { id: 'services', name: 'Services', slug: 'services' },
];

const STORAGE_KEY = 'abuad_dropoff_hall';

export function getSavedHall() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return CAMPUS_HALLS.find((h) => h.id === id) || CAMPUS_HALLS[0];
  } catch {
    return CAMPUS_HALLS[0];
  }
}

export function saveHall(hall) {
  try {
    localStorage.setItem(STORAGE_KEY, hall.id);
  } catch {
    /* ignore */
  }
}
