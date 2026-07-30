import React, { useState, useEffect } from 'react';
import { UserWithPets, fetchAllUsersAndPetsForAdmin, MAX_USERS_LIMIT, ADMIN_EMAIL } from '../lib/firebase';
import { ShieldCheck, Users, Dog, Cat, RefreshCw, Search, Calendar, Mail, Ruler, AlertCircle, CheckCircle2, User, Sparkles } from 'lucide-react';

interface AdminDashboardViewProps {
  currentAdminEmail: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentAdminEmail }) => {
  const [users, setUsers] = useState<UserWithPets[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAllUsersAndPetsForAdmin();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao carregar a lista de utilizadores. Verifica as permissões de administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalUsers = users.length;
  const remainingSlots = Math.max(0, MAX_USERS_LIMIT - totalUsers);
  const totalPets = users.reduce((acc, u) => acc + u.pets.length, 0);
  const totalDogs = users.reduce(
    (acc, u) => acc + u.pets.filter((p) => p.species === 'dog').length,
    0
  );
  const totalCats = users.reduce(
    (acc, u) => acc + u.pets.filter((p) => p.species === 'cat').length,
    0
  );

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    const matchUser =
      u.displayName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    const matchPet = u.pets.some(
      (p) => p.name.toLowerCase().includes(search) || p.breed.toLowerCase().includes(search)
    );
    return matchUser || matchPet;
  });

  const percentageUsed = Math.min(100, Math.round((totalUsers / MAX_USERS_LIMIT) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-4 py-4 pb-24">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Painel Administrativo
              </span>
              <span className="text-xs text-slate-400 font-mono">pedrobzg@gmail.com</span>
            </div>
            <h1 className="text-2xl font-bold font-serif-title text-slate-100">
              Gestão de Utilizadores e Pets
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Painel de controlo exclusivo para monitorizar os registos na comunidade Pet Family (Máx. 30 utilizadores).
            </p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all border border-emerald-400/30 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* Capacity & Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Capacity Gauge */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Lotação de Utilizadores
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {totalUsers} / {MAX_USERS_LIMIT}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  percentageUsed >= 90
                    ? 'bg-rose-500'
                    : percentageUsed >= 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Vagas disponíveis:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {remainingSlots} vagas restantes
            </span>
          </div>
        </div>

        {/* Pets Stats */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Total de Pets
            </span>
            <div className="text-2xl font-bold text-slate-900 font-serif-title">{totalPets}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Registados no sistema</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Dogs vs Cats Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
            Espécies
          </span>
          <div className="flex justify-around items-center my-1">
            <div className="text-center">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Dog className="w-4 h-4 text-emerald-600" />
                <span>{totalDogs}</span>
              </div>
              <span className="text-[10px] text-slate-400">Cães</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Cat className="w-4 h-4 text-teal-600" />
                <span>{totalCats}</span>
              </div>
              <span className="text-[10px] text-slate-400">Gatos</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome de utilizador, email, ou nome de pet..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Users and Pets Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Lista de Utilizadores e Pets ({filteredUsers.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Apenas acessível a {ADMIN_EMAIL}
          </span>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              A carregar lista de utilizadores do banco de dados...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-2">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">Nenhum utilizador encontrado</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? 'Nenhum registo coincide com o termo de pesquisa.'
                : 'Ainda não existem utilizadores registados via Google Auth.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((userItem) => (
              <div
                key={userItem.uid}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 hover:border-emerald-300/80 transition-all"
              >
                {/* User Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={userItem.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt={userItem.displayName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400/40 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">
                          {userItem.displayName}
                        </h4>
                        {userItem.role === 'admin' && (
                          <span className="text-[10px] bg-slate-900 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {userItem.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(userItem.createdAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">
                      {userItem.pets.length} pet{userItem.pets.length !== 1 ? 's' : ''} registado{userItem.pets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Pets List owned by this user */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pets Associados
                  </span>

                  {userItem.pets.length === 0 ? (
                    <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-2xl italic">
                      Nenhum pet registado por este utilizador.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userItem.pets.map((pet) => (
                        <div
                          key={pet.id}
                          className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 flex items-start space-x-3"
                        >
                          <img
                            src={pet.avatarUrl}
                            alt={pet.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-slate-900 truncate">
                                {pet.name}
                              </h5>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                                {pet.species === 'dog' ? '🐶 Cão' : pet.species === 'cat' ? '🐱 Gato' : '🐾 Outro'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {pet.breed} • {pet.weightKg} kg
                            </p>

                            {/* Metrics Badge */}
                            <div className="mt-2 bg-white/90 p-2 rounded-xl border border-slate-200/80 text-[10px] text-slate-600 flex items-center justify-between font-mono">
                              <span className="flex items-center gap-1">
                                <Ruler className="w-3 h-3 text-emerald-600" />
                                <span>Medidas:</span>
                              </span>
                              <span>
                                P:{pet.metrics?.neckCm || 0}cm | PE:{pet.metrics?.chestCm || 0}cm | C:{pet.metrics?.backCm || 0}cm
                              </span>
                            </div>

                            {pet.bio && (
                              <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">
                                "{pet.bio}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
