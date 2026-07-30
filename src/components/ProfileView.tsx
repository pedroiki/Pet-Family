import React, { useState, useEffect } from 'react';
import { Pet, UserProfile, Species } from '../types';
import { Ruler, Save, Plus, Check, ShieldCheck, Dog, Cat, Sparkles, LogIn, LogOut, Users, Scan, Camera } from 'lucide-react';
import { ADMIN_EMAIL, MAX_USERS_LIMIT } from '../lib/firebase';

interface ProfileViewProps {
  userProfile: UserProfile;
  activePet: Pet;
  onUpdatePet: (updatedPet: Pet) => void;
  onAddNewPet: (newPet: Pet) => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onSimulateAdminLogin: () => void;
  isAdmin: boolean;
  onOpenScanner?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  activePet,
  onUpdatePet,
  onAddNewPet,
  onGoogleSignIn,
  onGoogleSignOut,
  onSimulateAdminLogin,
  isAdmin,
  onOpenScanner,
}) => {
  // Form state for current editing pet
  const [name, setName] = useState(activePet?.name || '');
  const [species, setSpecies] = useState<Species>(activePet?.species || 'dog');
  const [breed, setBreed] = useState(activePet?.breed || '');
  const [weightKg, setWeightKg] = useState((activePet?.weightKg || 5).toString());
  const [avatarUrl, setAvatarUrl] = useState(activePet?.avatarUrl || '');
  const [bio, setBio] = useState(activePet?.bio || '');

  // Metric Guide Measurements
  const [neckCm, setNeckCm] = useState((activePet?.metrics?.neckCm || 30).toString());
  const [chestCm, setChestCm] = useState((activePet?.metrics?.chestCm || 45).toString());
  const [backCm, setBackCm] = useState((activePet?.metrics?.backCm || 35).toString());

  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Keep state updated when active pet changes externally
  useEffect(() => {
    if (activePet) {
      setName(activePet.name);
      setSpecies(activePet.species);
      setBreed(activePet.breed);
      setWeightKg(activePet.weightKg.toString());
      setAvatarUrl(activePet.avatarUrl);
      setBio(activePet.bio);
      setNeckCm(activePet.metrics.neckCm.toString());
      setChestCm(activePet.metrics.chestCm.toString());
      setBackCm(activePet.metrics.backCm.toString());
      setIsAddingNew(false);
    }
  }, [activePet]);

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPet: Pet = {
      id: isAddingNew ? `pet-${Date.now()}` : activePet?.id || `pet-${Date.now()}`,
      name: name.trim() || 'Meu Pet',
      species,
      breed: breed.trim() || 'Raça Indefinida',
      weightKg: parseFloat(weightKg) || 5.0,
      avatarUrl: avatarUrl.trim() || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      bio: bio.trim() || 'Adoro a comunidade Pet Family!',
      metrics: {
        neckCm: parseInt(neckCm) || 30,
        chestCm: parseInt(chestCm) || 45,
        backCm: parseInt(backCm) || 35,
      },
    };

    if (isAddingNew) {
      onAddNewPet(parsedPet);
      setSaveToast(`Novo pet ${parsedPet.name} adicionado com sucesso! 🎉`);
      setIsAddingNew(false);
    } else {
      onUpdatePet(parsedPet);
      setSaveToast(`Medidas e perfil de ${parsedPet.name} atualizados! ✨`);
    }

    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleStartAddNew = () => {
    setIsAddingNew(true);
    setName('');
    setSpecies('dog');
    setBreed('');
    setWeightKg('8.0');
    setAvatarUrl('https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400');
    setBio('');
    setNeckCm('28');
    setChestCm('42');
    setBackCm('32');
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto px-2 sm:px-4 pt-2">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 border border-emerald-400 animate-in slide-in-from-top">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* User Auth Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  {userProfile.name}
                </h3>
                {isAdmin ? (
                  <span className="text-[10px] bg-slate-900 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                    Tutor
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userProfile.isGoogleAuthenticated ? (
              <button
                onClick={onGoogleSignOut}
                className="flex items-center space-x-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 rounded-2xl font-bold transition-all border border-rose-200"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Terminar Sessão</span>
              </button>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center space-x-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-2xl shadow-sm transition-all border border-slate-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Admin Access Button */}
        {!isAdmin && (
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Administrador: <strong className="font-mono">{ADMIN_EMAIL}</strong></span>
            </div>
            <button
              onClick={onSimulateAdminLogin}
              className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
            >
              Ativar Login Admin ({ADMIN_EMAIL})
            </button>
          </div>
        )}

        {/* Notice of max 30 users */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Comunidade Pet Family: Registos limitados a no máximo <strong>{MAX_USERS_LIMIT} utilizadores</strong> com conta Google.
          </span>
        </div>
      </div>

      {/* AI Breed Scanner Callout Banner */}
      {onOpenScanner && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white rounded-2xl p-4 shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-sm text-emerald-200 flex items-center gap-1.5">
                <span>Scanner de Raça AI Gemini</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Novo
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Fotografa com a câmara ou carrega a foto do teu cão ou gato para identificar raças, misturas SDR e preencher medidas métricas automaticamente!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenScanner}
            className="w-full sm:w-auto shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Abrir Scanner IA</span>
          </button>
        </div>
      )}

      {/* Pet Selection Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="font-serif-title font-bold text-lg text-slate-900 flex items-center gap-2">
          <Dog className="w-5 h-5 text-emerald-600" />
          <span>{isAddingNew ? 'Registar Novo Pet' : `Perfil e Medidas: ${activePet?.name || 'Pet'}`}</span>
        </h2>

        {!isAddingNew && (
          <button
            onClick={handleStartAddNew}
            className="flex items-center space-x-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Outro Pet</span>
          </button>
        )}
      </div>

      {/* Main Pet Edit Form */}
      <form onSubmit={handleSavePet} className="space-y-4">
        
        {/* Basic Info Box */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Dados Gerais do Pet
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nome do Pet:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Thor"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Espécie:</label>
              <div className="flex gap-2">
                {[
                  { id: 'dog', label: 'Cão 🐶' },
                  { id: 'cat', label: 'Gato 🐱' },
                ].map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSpecies(sp.id as Species)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      species === sp.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Raça:</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ex: Golden Retriever, Persa, SRD"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Peso Aproximado (kg):</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">URL da Foto de Perfil:</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Biografia para o Feed #NoHumans:</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Apaixonado por corridas e biscoitos!"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Guia de Medidas Métrico */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
            <div className="flex items-center space-x-2">
              <Ruler className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif-title font-bold text-base text-emerald-200">
                Guia de Medidas Métricas (Pescoço, Peito, Costas)
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
              Chave da Boutique
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            As medidas métricas exatas permitem que a Boutique recomende automaticamente apenas casacos, coleiras e arneses com o ajuste perfeito para {name || 'o teu pet'}.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Como medir o teu patudo em 3 passos:
            </div>
            <ul className="text-slate-200 space-y-1 text-[11px] list-disc list-inside">
              <li><strong>Pescoço (Neck):</strong> Mede a circunferência na base do pescoço onde assenta a coleira.</li>
              <li><strong>Peito (Chest):</strong> Mede a circunferência na parte mais larga da caixa torácica, logo atrás das patas dianteiras.</li>
              <li><strong>Costas (Back):</strong> Mede o comprimento desde a base do pescoço até à raiz da cauda.</li>
            </ul>
          </div>

          {/* Metric Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-900">
            
            <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1">
              <label className="font-bold text-slate-800 block text-xs">Pescoço (cm):</label>
              <input
                type="number"
                required
                value={neckCm}
                onChange={(e) => setNeckCm(e.target.value)}
                className="w-full text-base font-bold text-slate-900 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block">Ex: 22 a 50 cm</span>
            </div>

            <div className="bg-white p-3 rounded-xl border-2 border-emerald-400 shadow-2xs space-y-1">
              <label className="font-bold text-emerald-900 block text-xs flex items-center justify-between">
                <span>Peito (cm) *Principal*</span>
              </label>
              <input
                type="number"
                required
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
                className="w-full text-base font-bold text-emerald-900 border border-emerald-300 bg-emerald-50/50 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-emerald-700 block font-medium">Medida crucial para casacos</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1">
              <label className="font-bold text-slate-800 block text-xs">Costas (cm):</label>
              <input
                type="number"
                required
                value={backCm}
                onChange={(e) => setBackCm(e.target.value)}
                className="w-full text-base font-bold text-slate-900 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block">Comprimento total</span>
            </div>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-3 pt-1">
          {isAddingNew && (
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="flex-1 text-xs font-semibold text-slate-600 bg-slate-100 py-3 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isAddingNew ? 'Registar Novo Pet' : 'Guardar Medidas & Perfil'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
