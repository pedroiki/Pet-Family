import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Pet, UserProfile } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export const ADMIN_EMAIL = 'pedrobzg@gmail.com';
export const MAX_USERS_LIMIT = 30;

export interface DBUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface UserWithPets extends DBUser {
  pets: Pet[];
}

/**
 * Perform Google Login and enforce the maximum 30 users limit
 */
export async function loginWithGoogle(): Promise<{ userDoc: DBUser; pets: Pet[] }> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  if (!fbUser.email) {
    throw new Error('Conta Google sem email associado.');
  }

  const userRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userRef);

  let userDocData: DBUser;

  if (userSnap.exists()) {
    userDocData = userSnap.data() as DBUser;
  } else {
    // Check total users registered
    const usersColSnap = await getDocs(collection(db, 'users'));
    const currentUsersCount = usersColSnap.size;

    if (currentUsersCount >= MAX_USERS_LIMIT) {
      await signOut(auth);
      throw new Error(
        `Limite atingido! A comunidade Pet Family está limitada a um máximo de ${MAX_USERS_LIMIT} utilizadores (atualmente com ${currentUsersCount}).`
      );
    }

    const isAdmin = fbUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    userDocData = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || 'Tutor',
      photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    await setDoc(userRef, userDocData);

    // Create default pet for newly registered user
    const defaultPetId = `pet-${fbUser.uid}-${Date.now()}`;
    const defaultPet: Pet = {
      id: defaultPetId,
      name: 'Thor',
      species: 'dog',
      breed: 'Golden Retriever',
      weightKg: 28,
      avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      bio: 'Sou o mais novo patudo da comunidade Pet Family! 🐾',
      metrics: {
        neckCm: 38,
        chestCm: 60,
        backCm: 50,
      },
    };

    await savePetToFirestore(defaultPet, fbUser.uid, fbUser.email);
  }

  const pets = await fetchUserPets(fbUser.uid);
  return { userDoc: userDocData, pets };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Fetch all pets belonging to a specific user
 */
export async function fetchUserPets(userId: string): Promise<Pet[]> {
  try {
    const q = query(collection(db, 'pets'), where('userId', '==', userId));
    const querySnap = await getDocs(q);
    const pets: Pet[] = [];
    querySnap.forEach((d) => {
      const data = d.data();
      pets.push({
        id: d.id,
        name: data.name || 'Meu Pet',
        species: data.species || 'dog',
        breed: data.breed || 'SRD',
        weightKg: data.weightKg || 5,
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
        bio: data.bio || '',
        metrics: data.metrics || { neckCm: 30, chestCm: 45, backCm: 35 },
      });
    });
    return pets;
  } catch (error) {
    console.error('Error fetching user pets:', error);
    return [];
  }
}

/**
 * Save or update a pet document in Firestore
 */
export async function savePetToFirestore(pet: Pet, userId: string, userEmail: string): Promise<void> {
  const petRef = doc(db, 'pets', pet.id);
  await setDoc(petRef, {
    id: pet.id,
    userId,
    userEmail,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    weightKg: pet.weightKg,
    avatarUrl: pet.avatarUrl,
    bio: pet.bio,
    metrics: pet.metrics,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Get count of registered users in the database
 */
export async function getUsersCount(): Promise<number> {
  try {
    const usersColSnap = await getDocs(collection(db, 'users'));
    return usersColSnap.size;
  } catch (e) {
    console.error('Error getting user count:', e);
    return 0;
  }
}

/**
 * Admin function: fetch all registered users and their pets
 */
export async function fetchAllUsersAndPetsForAdmin(): Promise<UserWithPets[]> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const petsSnap = await getDocs(collection(db, 'pets'));

    const allPets: (Pet & { userId: string })[] = [];
    petsSnap.forEach((d) => {
      const data = d.data();
      allPets.push({
        id: d.id,
        userId: data.userId,
        name: data.name || 'Sem nome',
        species: data.species || 'dog',
        breed: data.breed || 'SRD',
        weightKg: data.weightKg || 0,
        avatarUrl: data.avatarUrl || '',
        bio: data.bio || '',
        metrics: data.metrics || { neckCm: 0, chestCm: 0, backCm: 0 },
      });
    });

    const result: UserWithPets[] = [];
    usersSnap.forEach((u) => {
      const uData = u.data() as DBUser;
      const userPets = allPets.filter((p) => p.userId === uData.uid);
      result.push({
        ...uData,
        pets: userPets,
      });
    });

    // Sort by creation date descending
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return [];
  }
}
