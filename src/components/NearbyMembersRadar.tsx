import React, { useState, useEffect } from 'react';
import { NearbyMember, Pet } from '../types';
import { MOCK_NEARBY_MEMBERS } from '../data/mockData';
import { Navigation, MapPin, Radio, ShieldAlert, Send, MessageCircle, Sparkles, RefreshCw, CheckCircle2, UserCheck, Heart } from 'lucide-react';

interface NearbyMembersRadarProps {
  activePet: Pet;
  onOpenChatWithMember?: (member: NearbyMember, customMessage?: string) => void;
}

// Haversine distance formula in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const NearbyMembersRadar: React.FC<NearbyMembersRadarProps> = ({
  activePet,
  onOpenChatWithMember,
}) => {
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Radius filter in km (Default 25km as requested)
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(25);
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>('all');
  
  // Member invite modal or toast state
  const [sentInviteMemberId, setSentInviteMemberId] = useState<string | null>(null);
  const [selectedBlipMember, setSelectedBlipMember] = useState<NearbyMember | null>(null);

  // Default mock user center: Lisboa Baixa / Chiado (38.7100, -9.1390)
  const defaultCenter = { lat: 38.7100, lng: -9.1390, city: 'Lisboa Central' };

  // Request actual browser GPS location
  const handleToggleGps = () => {
    if (isGpsActive) {
      setIsGpsActive(false);
      setUserCoords(null);
      setGpsError(null);
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('O seu navegador não suporta geolocalização GPS.');
      setIsLocating(false);
      // Fallback to Lisbon mock coords so user can test UI
      setUserCoords(defaultCenter);
      setIsGpsActive(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: 'A Tua Localização GPS Atual 🎯',
        });
        setIsGpsActive(true);
        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS Error:', error);
        setGpsError('Acesso ao GPS não concedido ou indisponível. A simular coordenadas em Lisboa para demonstração.');
        setIsLocating(false);
        // Fallback so user can test the radar seamlessly
        setUserCoords(defaultCenter);
        setIsGpsActive(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Recalculate members distance based on current user coordinates
  const currentCenter = userCoords || defaultCenter;

  const membersWithCalculatedDistance = MOCK_NEARBY_MEMBERS.map((member) => {
    if (userCoords) {
      const realDist = calculateHaversineDistance(
        currentCenter.lat,
        currentCenter.lng,
        member.lat,
        member.lng
      );
      return { ...member, distanceKm: realDist };
    }
    return member;
  });

  // Filter members by distance radius and species
  const filteredMembers = membersWithCalculatedDistance.filter((m) => {
    if (m.distanceKm > maxRadiusKm) return false;
    if (speciesFilter !== 'all' && m.species !== speciesFilter) return false;
    return true;
  });

  // Count very close members (< 5km) for proximity alert
  const veryCloseMembers = filteredMembers.filter((m) => m.distanceKm <= 5);

  const handleSendWalkInvite = (member: NearbyMember) => {
    setSentInviteMemberId(member.id);
    const message = `🐾 Convite de Passeio: Olá ${member.tutorName}! Vi no Radar Pet Family que estás com o(a) ${member.petName} a apenas ${member.distanceKm} km. Gostarias de fazer um passeio juntos?`;
    
    if (onOpenChatWithMember) {
      onOpenChatWithMember(member, message);
    }
    
    setTimeout(() => setSentInviteMemberId(null), 3000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto px-2 sm:px-4 pt-2">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        {/* Radar background decoration */}
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full border border-emerald-500/20 pointer-events-none animate-ping opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-xl font-bold font-serif-title tracking-tight text-white flex items-center gap-2">
                Radar de Membros Próximos
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Raio 25km GPS
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Localiza outros tutores da comunidade <strong className="text-emerald-400">#NoHumans</strong> na tua zona para passeios, encontros nos parques e alertas de proximidade!
            </p>
          </div>

          {/* GPS Activation Toggle Switch */}
          <button
            onClick={handleToggleGps}
            disabled={isLocating}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shrink-0 cursor-pointer ${
              isGpsActive
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>A obter GPS...</span>
              </>
            ) : isGpsActive ? (
              <>
                <Navigation className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>GPS Ativo ({userCoords?.city.slice(0, 15)}...)</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Ativar Localização GPS</span>
              </>
            )}
          </button>
        </div>

        {/* GPS Error alert note */}
        {gpsError && (
          <div className="mt-3 text-xs bg-amber-500/20 border border-amber-500/40 text-amber-200 px-3 py-2 rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Proximity Alert Banner if GPS active */}
      {isGpsActive && veryCloseMembers.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-slate-950/10 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                🐾 Alerta de Proximidade Ativo!
              </p>
              <p className="text-xs text-slate-950/90 font-medium">
                Existem <strong>{veryCloseMembers.length} membros</strong> com o pet a menos de 5 km de ti no teu raio atual!
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold bg-slate-950 text-emerald-400 px-3 py-1.5 rounded-xl shrink-0 shadow-2xs">
            {veryCloseMembers[0].petName} ({veryCloseMembers[0].distanceKm} km)
          </span>
        </div>
      )}

      {/* Interactive Visual Radar Sweep Screen */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-lg text-white relative overflow-hidden">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Radar ao Vivo ({filteredMembers.length} Encontrados num raio de {maxRadiusKm} km)
            </span>
          </div>

          {/* Radius Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold px-2">Raio:</span>
            {[5, 15, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setMaxRadiusKm(r)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  maxRadiusKm === r
                    ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        {/* The Graphic Radar Circle Container */}
        <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] mx-auto my-2 rounded-full border border-emerald-500/30 bg-slate-900/60 flex items-center justify-center overflow-hidden shadow-inner">
          
          {/* Concentric rings */}
          <div className="absolute inset-4 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-16 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-28 rounded-full border border-emerald-500/20" />
          
          {/* Crosshair lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-emerald-500/20" />
            <div className="h-full w-[1px] bg-emerald-500/20 absolute" />
          </div>

          {/* Animated Sweeping Radar Scanner Line */}
          <div 
            className="absolute w-1/2 h-1/2 top-0 left-0 origin-bottom-right pointer-events-none rounded-tl-full bg-gradient-to-br from-emerald-500/30 to-transparent animate-spin"
            style={{ animationDuration: '4s' }}
          />

          {/* Center User Dot */}
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400 p-0.5 bg-slate-950 shadow-lg relative">
              <img
                src={activePet.avatarUrl}
                alt={activePet.name}
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1 rounded-full">
                TU
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-slate-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
              {activePet.name}
            </span>
          </div>

          {/* Render Member Blips on the Radar Map */}
          {filteredMembers.map((member, idx) => {
            // Convert distance and angle to 2D x,y offsets relative to radar center
            const angle = (idx * (360 / Math.max(filteredMembers.length, 1)) + 45) * (Math.PI / 180);
            const radiusRatio = Math.min(member.distanceKm / (maxRadiusKm || 25), 0.82); // max 82% radius
            const distPx = radiusRatio * 150; // max radius radius px
            
            const x = Math.cos(angle) * distPx;
            const y = Math.sin(angle) * distPx;

            return (
              <button
                key={member.id}
                onClick={() => setSelectedBlipMember(member)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className={`absolute z-30 transition-all duration-300 group cursor-pointer ${
                  selectedBlipMember?.id === member.id ? 'scale-125 z-40' : 'hover:scale-110'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 p-0.5 shadow-md transition-all ${
                    member.distanceKm <= 5
                      ? 'border-emerald-400 bg-emerald-950 animate-bounce'
                      : 'border-teal-300 bg-slate-900'
                  }`}>
                    <img
                      src={member.petAvatar}
                      alt={member.petName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  
                  <span className="text-[9px] font-semibold text-slate-200 bg-slate-950/90 px-1.5 py-0.5 rounded-md border border-slate-800 shadow-2xs mt-0.5 whitespace-nowrap">
                    {member.petName} ({member.distanceKm}km)
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Blip Card Preview inside Radar Box */}
        {selectedBlipMember && (
          <div className="mt-4 bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center space-x-3">
              <img
                src={selectedBlipMember.petAvatar}
                alt={selectedBlipMember.petName}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-white">
                    {selectedBlipMember.petName} ({selectedBlipMember.breed})
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {selectedBlipMember.distanceKm} km de ti
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tutor(a): <strong>{selectedBlipMember.tutorName}</strong> • {selectedBlipMember.city}
                </p>
                <p className="text-[11px] text-emerald-400 italic mt-0.5">
                  "{selectedBlipMember.statusText}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => handleSendWalkInvite(selectedBlipMember)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Convidar Passeio</span>
              </button>
              <button
                onClick={() => setSelectedBlipMember(null)}
                className="text-[10px] text-slate-400 hover:text-white text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs by Species */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Membros Encontrados:</span>
          <span className="text-xs bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
            {filteredMembers.length}
          </span>
        </div>

        <div className="flex space-x-1.5">
          {[
            { id: 'all', label: 'Todos 🐾' },
            { id: 'dog', label: 'Cães 🐶' },
            { id: 'cat', label: 'Gatos 🐱' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSpeciesFilter(item.id as any)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                speciesFilter === item.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Nearby Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Member Top Bar */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={member.petAvatar}
                      alt={member.petName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-2xs"
                    />
                    {member.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-slate-900 text-base font-serif-title">
                        {member.petName}
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                        {member.species === 'dog' ? '🐶 Cão' : '🐱 Gato'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {member.breed} • Tutor(a) <strong className="text-slate-800">{member.tutorName}</strong>
                    </p>
                  </div>
                </div>

                {/* Distance Badge */}
                <div className="text-right">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl flex items-center space-x-1 ${
                    member.distanceKm <= 5
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{member.distanceKm} km</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{member.city}</p>
                </div>
              </div>

              {/* Status & Favorite Park */}
              <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-700 space-y-1">
                <p className="font-medium text-slate-800 flex items-center space-x-1.5">
                  <span className="text-emerald-600">💬</span>
                  <span className="italic">"{member.statusText}"</span>
                </p>
                {member.favoritePark && (
                  <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>Parque favorito: <strong className="text-slate-700">{member.favoritePark}</strong></span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleSendWalkInvite(member)}
                className={`flex-1 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all shadow-2xs cursor-pointer ${
                  sentInviteMemberId === member.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'
                }`}
              >
                {sentInviteMemberId === member.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Convite Enviado!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Convidar Passeio 🐾</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenChatWithMember && onOpenChatWithMember(member)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
