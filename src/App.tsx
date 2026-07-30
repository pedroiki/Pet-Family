/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Pet, Post, Product, CartItem, ChatConversation, NearbyMember } from './types';
import { MOCK_PETS, INITIAL_USER_PROFILE, MOCK_POSTS, MOCK_PRODUCTS, MOCK_CHAT_CONVERSATIONS } from './data/mockData';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { FeedView } from './components/FeedView';
import { BoutiqueView } from './components/BoutiqueView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { NearbyMembersRadar } from './components/NearbyMembersRadar';
import { CartDrawer } from './components/CartDrawer';
import { PetScannerModal } from './components/PetScannerModal';
import { BreedScanResult } from './types';
import {
  loginWithGoogle,
  logoutUser,
  savePetToFirestore,
  fetchUserPets,
  ADMIN_EMAIL,
  auth,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('feed');

  // Core App State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>(MOCK_CHAT_CONVERSATIONS);

  // Error/Alert Modal State
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);

  // Cart Drawer & AI Scanner Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Apply Scan Results to Active Pet
  const handleApplyScanResultToActivePet = (result: BreedScanResult) => {
    const updatedPet: Pet = {
      ...activePet,
      breed: result.primaryBreed,
      species: result.species.toLowerCase().includes('gato') ? 'cat' : 'dog',
      weightKg: result.suggestedMetrics?.estimatedWeightKg || activePet.weightKg,
      avatarUrl: result.scannedImageBase64 || activePet.avatarUrl,
      metrics: {
        neckCm: result.suggestedMetrics?.neckCm || activePet.metrics.neckCm,
        chestCm: result.suggestedMetrics?.chestCm || activePet.metrics.chestCm,
        backCm: result.suggestedMetrics?.backCm || activePet.metrics.backCm,
      },
    };

    handleUpdatePet(updatedPet);
  };

  // Create New Pet from Scan Result
  const handleCreateNewPetFromScanResult = (result: BreedScanResult) => {
    const isCat = result.species.toLowerCase().includes('gato');
    const newPet: Pet = {
      id: `pet-scan-${Date.now()}`,
      name: `${result.primaryBreed.split(' ')[0]} ${isCat ? '🐱' : '🐶'}`,
      species: isCat ? 'cat' : 'dog',
      breed: result.primaryBreed,
      weightKg: result.suggestedMetrics?.estimatedWeightKg || 6.5,
      avatarUrl: result.scannedImageBase64 || (isCat
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'),
      bio: result.personality || 'Identificado pelo Scanner IA do Pet Family!',
      metrics: {
        neckCm: result.suggestedMetrics?.neckCm || 30,
        chestCm: result.suggestedMetrics?.chestCm || 45,
        backCm: result.suggestedMetrics?.backCm || 35,
      },
    };

    handleAddNewPet(newPet);
  };

  // Is Current User Admin (pedrobzg@gmail.com)
  const isAdmin = userProfile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Active Pet Derived from User Profile
  const activePet: Pet =
    userProfile.pets.find((p) => p.id === userProfile.activePetId) || userProfile.pets[0] || MOCK_PETS[0];

  // Monitor Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        try {
          const userPets = await fetchUserPets(fbUser.uid);
          setUserProfile((prev) => {
            const petsToUse = userPets.length > 0 ? userPets : prev.pets;
            return {
              ...prev,
              id: fbUser.uid,
              name: fbUser.displayName || prev.name,
              email: fbUser.email || prev.email,
              avatarUrl: fbUser.photoURL || prev.avatarUrl,
              pets: petsToUse,
              activePetId: petsToUse.find((p) => p.id === prev.activePetId) ? prev.activePetId : petsToUse[0]?.id || 'pet-1',
              isGoogleAuthenticated: true,
            };
          });
        } catch (err) {
          console.error('Erro ao sincronizar pets do utilizador:', err);
        }
      } else {
        // Reset to initial profile when signed out from Firebase
        setUserProfile(INITIAL_USER_PROFILE);
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Login Handler (Enforces 30-user limit)
  const handleGoogleSignIn = async () => {
    try {
      const { userDoc, pets } = await loginWithGoogle();
      const updatedPets = pets.length > 0 ? pets : userProfile.pets;
      setUserProfile({
        id: userDoc.uid,
        name: userDoc.displayName,
        email: userDoc.email,
        avatarUrl: userDoc.photoURL,
        pets: updatedPets,
        activePetId: updatedPets[0].id,
        isGoogleAuthenticated: true,
      });

      if (userDoc.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setActiveTab('admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAlertModal({
        title: 'Aviso de Limite de Utilizadores',
        message: err.message || 'Erro ao realizar login com Google.',
      });
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setUserProfile(INITIAL_USER_PROFILE);
      setActiveTab('feed');
    }
  };

  // Quick action to test/demonstrate pedrobzg@gmail.com admin view
  const handleSimulateAdminLogin = () => {
    const adminPets: Pet[] = [
      {
        id: 'pet-admin-1',
        name: 'Banzai',
        species: 'dog',
        breed: 'Border Collie',
        weightKg: 19.5,
        avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
        bio: 'Mascote oficial do Administrador @pedrobzg! 👑 #NoHumans',
        metrics: { neckCm: 36, chestCm: 58, backCm: 48 },
      },
    ];

    setUserProfile({
      id: 'admin-pedrobzg-uid',
      name: 'Pedro BZG (Admin)',
      email: ADMIN_EMAIL,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      pets: adminPets,
      activePetId: 'pet-admin-1',
      isGoogleAuthenticated: true,
    });

    setActiveTab('admin');
  };

  // Handlers
  const handleSelectPet = (petId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      activePetId: petId,
    }));
  };

  // Post Actions
  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            authorPetName: activePet.name,
            authorAvatar: activePet.avatarUrl,
            text,
            timeAgo: 'Agora mesmo',
          };
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [newComment, ...post.comments],
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (
    newPostData: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'comments' | 'timeAgo'>
  ) => {
    const createdPost: Post = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      timeAgo: 'Agora mesmo',
    };
    setPosts([createdPost, ...posts]);
  };

  // Cart Actions
  const handleAddToCart = (product: Product, selectedSize: string, petName: string) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.product.id === product.id && i.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [
        ...prevItems,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          product,
          selectedSize,
          quantity: 1,
          targetPetId: activePet.id,
          targetPetName: petName,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Message Actions
  const handleSendMessage = (chatId: string, text: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === chatId) {
          const userMsg = {
            id: `m-${Date.now()}`,
            chatId,
            senderName: `${userProfile.name} (Tutor de ${activePet.name})`,
            senderAvatar: userProfile.avatarUrl,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isFromUser: true,
          };

          const updatedMessages = [...conv.messages, userMsg];

          // Simulate automatic friendly tutor response after 1.5s
          setTimeout(() => {
            setConversations((latestConvs) =>
              latestConvs.map((c) => {
                if (c.id === chatId) {
                  const replyMsg = {
                    id: `m-reply-${Date.now()}`,
                    chatId,
                    senderName: c.tutorName,
                    senderAvatar: c.petAvatar,
                    text: `Olá! Recebi a tua mensagem sobre ${activePet.name}. Que ótimo ter-vos na comunidade Pet Family! 🐾`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isFromUser: false,
                  };
                  return {
                    ...c,
                    lastMessage: replyMsg.text,
                    lastMessageTime: replyMsg.timestamp,
                    messages: [...c.messages, replyMsg],
                  };
                }
                return c;
              })
            );
          }, 1500);

          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: userMsg.timestamp,
            messages: updatedMessages,
          };
        }
        return conv;
      })
    );
  };

  // Open Chat from Nearby Members Radar
  const handleOpenChatWithMember = (member: NearbyMember, initialMsg?: string) => {
    const existingChat = conversations.find(
      (c) => c.tutorName.includes(member.tutorName) || c.petName.includes(member.petName)
    );

    if (!existingChat) {
      const newChat: ChatConversation = {
        id: `chat-nearby-${Date.now()}`,
        tutorName: `${member.tutorName}`,
        petName: member.petName,
        petAvatar: member.petAvatar,
        species: member.species,
        lastMessage: initialMsg || 'Convite enviado!',
        lastMessageTime: 'Agora',
        unreadCount: 0,
        messages: initialMsg
          ? [
              {
                id: `msg-${Date.now()}`,
                chatId: `chat-nearby-${Date.now()}`,
                senderName: `${userProfile.name} (Tutor de ${activePet.name})`,
                senderAvatar: userProfile.avatarUrl,
                text: initialMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isFromUser: true,
              },
            ]
          : [],
      };
      setConversations([newChat, ...conversations]);
    } else if (initialMsg) {
      handleSendMessage(existingChat.id, initialMsg);
    }

    setActiveTab('messages');
  };

  // Pet Profile Actions
  const handleUpdatePet = (updatedPet: Pet) => {
    setUserProfile((prev) => ({
      ...prev,
      pets: prev.pets.map((p) => (p.id === updatedPet.id ? updatedPet : p)),
    }));

    // Sync to Firestore if authenticated
    if (userProfile.id) {
      savePetToFirestore(updatedPet, userProfile.id, userProfile.email).catch(console.error);
    }
  };

  const handleAddNewPet = (newPet: Pet) => {
    setUserProfile((prev) => ({
      ...prev,
      pets: [...prev.pets, newPet],
      activePetId: newPet.id,
    }));

    // Sync to Firestore if authenticated
    if (userProfile.id) {
      savePetToFirestore(newPet, userProfile.id, userProfile.email).catch(console.error);
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-sans flex flex-col selection:bg-emerald-200">
      
      {/* Top Navigation Header */}
      <Header
        userProfile={userProfile}
        activePet={activePet}
        onSelectPet={handleSelectPet}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        isAdmin={isAdmin}
        activeTab={activeTab}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4">
        {activeTab === 'feed' && (
          <FeedView
            posts={posts}
            activePet={activePet}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onCreatePost={handleCreatePost}
          />
        )}

        {activeTab === 'boutique' && (
          <BoutiqueView
            products={products}
            activePet={activePet}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'radar' && (
          <NearbyMembersRadar
            activePet={activePet}
            onOpenChatWithMember={handleOpenChatWithMember}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            conversations={conversations}
            activePet={activePet}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            activePet={activePet}
            onUpdatePet={handleUpdatePet}
            onAddNewPet={handleAddNewPet}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onSimulateAdminLogin={handleSimulateAdminLogin}
            isAdmin={isAdmin}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView currentAdminEmail={userProfile.email} />
        )}
      </main>

      {/* Limit / Notice Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => setAlertModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-lg text-slate-900">{alertModal.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{alertModal.message}</p>

            <div className="pt-2">
              <button
                onClick={() => setAlertModal(null)}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-2xl hover:bg-slate-800 transition-colors"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer & Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* AI Pet Breed & Metrics Scanner Modal */}
      <PetScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        activePetName={activePet?.name}
        onApplyToActivePet={handleApplyScanResultToActivePet}
        onCreateNewPet={handleCreateNewPetFromScanResult}
      />

      {/* Fixed Bottom Tab Bar Navigation */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        unreadMessagesCount={1}
        isAdmin={isAdmin}
      />

    </div>
  );
}

