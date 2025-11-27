
import { collection, addDoc, getDocs, serverTimestamp, Firestore, query, where, limit } from 'firebase/firestore';

const initialListings = [
  {
    userName: 'Rajesh Kumar',
    cropType: 'Tomatoes',
    qualityGrade: 'Premium',
    quantity: 150,
    pricePerKg: 32,
    notes: 'Freshly harvested organic tomatoes.',
    location: 'Nashik, Maharashtra',
    userProfileId: 'dummy_user_1',
    isSeed: true,
  },
  {
    userName: 'Priya Singh',
    cropType: 'Onions',
    qualityGrade: 'Market-Ready',
    quantity: 500,
    pricePerKg: 18,
    notes: 'Large, healthy onions.',
    location: 'Pune, Maharashtra',
    userProfileId: 'dummy_user_2',
    isSeed: true,
  },
  {
    userName: 'Amit Patel',
    cropType: 'Potatoes',
    qualityGrade: 'Market-Ready',
    quantity: 300,
    pricePerKg: 15,
    notes: '',
    location: 'Satara, Maharashtra',
    userProfileId: 'dummy_user_3',
    isSeed: true,
  },
    {
    userName: 'Sunita Devi',
    cropType: 'Wheat',
    qualityGrade: 'Premium',
    quantity: 1200,
    pricePerKg: 25,
    notes: 'High-quality grain, low moisture.',
    location: 'Nagpur, Maharashtra',
    userProfileId: 'dummy_user_4',
    isSeed: true,
  }
];

export const seedInitialData = async (db: Firestore) => {
  const listingsColRef = collection(db, 'harvestListings');
  
  // Check if seed data already exists to prevent re-seeding
  const q = query(listingsColRef, where("isSeed", "==", true), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return; // Seed data exists, no need to seed again
  }

  // Add each initial listing to the database
  for (const listing of initialListings) {
    try {
      await addDoc(listingsColRef, {
        ...listing,
        availableFrom: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
};

    