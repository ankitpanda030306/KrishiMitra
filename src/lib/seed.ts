
import { collection, addDoc, getDocs, serverTimestamp, Firestore } from 'firebase/firestore';

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
  }
];

export const seedInitialData = async (db: Firestore) => {
  const listingsColRef = collection(db, 'harvestListings');
  
  // Check if there's already data to prevent re-seeding
  const snapshot = await getDocs(listingsColRef);
  if (!snapshot.empty) {
    return; // Data exists, no need to seed
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
