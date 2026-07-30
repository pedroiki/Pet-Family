export type Species = 'dog' | 'cat' | 'other';

export interface PetMetrics {
  neckCm: number;  // Pescoço (cm)
  chestCm: number; // Peito (cm)
  backCm: number;  // Costas (cm)
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  weightKg: number;
  avatarUrl: string;
  bio: string;
  gender?: 'm' | 'f';
  metrics: PetMetrics;
}

export interface PostComment {
  id: string;
  authorPetName: string;
  authorAvatar: string;
  text: string;
  timeAgo: string;
}

export interface Post {
  id: string;
  petId: string;
  petName: string;
  petAvatar: string;
  petSpecies: Species;
  imageUrl: string;
  caption: string;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: PostComment[];
  timeAgo: string;
  tags: string[];
  verifiedAnimalOnly: boolean;
}

export interface ProductSize {
  name: 'XS' | 'S' | 'M' | 'L' | 'XL';
  minNeckCm: number;
  maxNeckCm: number;
  minChestCm: number;
  maxChestCm: number;
  minBackCm: number;
  maxBackCm: number;
  stock: number;
}

export type ProductCategory = 'roupas' | 'acessorios' | 'brinquedos' | 'camas' | 'higiene';

export interface MemberLocation {
  lat: number;
  lng: number;
  city: string;
  isSharing: boolean;
  updatedAt: string;
}

export interface NearbyMember {
  id: string;
  tutorName: string;
  petName: string;
  petAvatar: string;
  species: Species;
  breed: string;
  distanceKm: number;
  lat: number;
  lng: number;
  city: string;
  isOnline: boolean;
  statusText: string;
  favoritePark?: string;
  bio?: string;
}

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  targetSpecies: 'dog' | 'cat' | 'all';
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  sizes: ProductSize[];
  description: string;
  badge?: string;
  material?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  quantity: number;
  targetPetId?: string;
  targetPetName?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
}

export interface ChatConversation {
  id: string;
  tutorName: string;
  petName: string;
  petAvatar: string;
  species: Species;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  pets: Pet[];
  activePetId: string;
  isGoogleAuthenticated: boolean;
}

export interface BreedScanResult {
  species: 'Cão' | 'Gato' | 'Outro' | string;
  primaryBreed: string;
  confidencePercentage: number;
  isMix: boolean;
  breedBreakdown?: { breed: string; percentage: number }[];
  physicalTraits?: string[];
  personality?: string;
  suggestedMetrics?: {
    neckCm: number;
    chestCm: number;
    backCm: number;
    estimatedWeightKg: number;
  };
  careAndGrooming?: string[];
  funFact?: string;
  scannedImageBase64?: string;
}

