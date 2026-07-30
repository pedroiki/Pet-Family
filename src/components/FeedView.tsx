import React, { useState } from 'react';
import { Post, Pet } from '../types';
import { Heart, MessageCircle, Share2, Sparkles, AlertCircle, Plus, ShieldCheck, X, Upload } from 'lucide-react';
import { PostSkeleton } from './SkeletonLoaders';

interface FeedViewProps {
  posts: Post[];
  activePet: Pet;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onCreatePost: (newPost: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'comments' | 'timeAgo'>) => void;
  isLoading?: boolean;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  activePet,
  onLikePost,
  onAddComment,
  onCreatePost,
  isLoading = false,
}) => {
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  
  // New Post Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [simulateHumanError, setSimulateHumanError] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [moderationSuccess, setModerationSuccess] = useState<string | null>(null);

  const sampleImages = [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1000',
  ];

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handlePublishPost = () => {
    if (!caption.trim()) {
      setModerationError('Por favor insere uma legenda para a tua publicação.');
      return;
    }

    const finalImage = imageUrl.trim() || sampleImages[Math.floor(Math.random() * sampleImages.length)];

    setModerating(true);
    setModerationError(null);
    setModerationSuccess(null);

    // Simulate #NoHumans AI Moderation Scan
    setTimeout(() => {
      setModerating(false);
      if (simulateHumanError) {
        setModerationError(
          '🚨 Moderação #NoHumans: Detetada presença ou rosto humano na imagem! A comunidade Pet Family é estritamente exclusiva para animais. Por favor altera a foto.'
        );
      } else {
        setModerationSuccess('✅ IA Pet Family: 100% Animal Detetado! Publicação aprovada com louvor.');
        setTimeout(() => {
          onCreatePost({
            petId: activePet.id,
            petName: activePet.name,
            petAvatar: activePet.avatarUrl,
            petSpecies: activePet.species,
            imageUrl: finalImage,
            caption: caption.trim(),
            tags: ['#NoHumans', `#${activePet.species === 'dog' ? 'DogLife' : 'CatLife'}`, '#PetFamilyApp'],
            verifiedAnimalOnly: true,
          });
          setIsModalOpen(false);
          setCaption('');
          setImageUrl('');
          setSimulateHumanError(false);
          setModerationSuccess(null);
        }, 800);
      }
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-2 sm:px-4 pt-2">
      
      {/* Moderation Warning Notice (#NoHumans Rules) */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start space-x-3 relative z-10">
          <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-serif-title font-bold text-base text-emerald-200">
                Feed Exclusivo #NoHumans
              </span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Regra de Ouro
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              &quot;Apenas animais brilham aqui!&quot; Todas as publicações passam por verificação inteligente para garantir um espaço 100% dedicado aos patudos.
            </p>
          </div>
        </div>
      </div>

      {/* Floating / Top Create Post CTA */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs">
        <div className="flex items-center space-x-3">
          <img
            src={activePet.avatarUrl}
            alt={activePet.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 shadow-2xs"
          />
          <div>
            <div className="text-xs text-slate-400">Publicar como</div>
            <div className="text-xs font-bold text-slate-800">{activePet.name} ({activePet.breed})</div>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Partilhar Foto Pet</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : (
        /* Posts Feed List */
        posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all hover:border-slate-200"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-50">
              <div className="flex items-center space-x-3">
                <img
                  src={post.petAvatar}
                  alt={post.petName}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-200 shadow-2xs"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-slate-900">{post.petName}</span>
                    <span className="text-xs text-slate-400">• {post.timeAgo}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>#NoHumans Verificado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Image */}
            <div className="relative group bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full max-h-[480px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-xs">
                🐾 100% Pet
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center space-x-1.5 text-xs font-semibold transition-all ${
                      post.isLiked ? 'text-rose-500 scale-105' : 'text-slate-600 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{post.likesCount} patadinhas</span>
                  </button>

                  <button
                    onClick={() => setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentsCount} comentários</span>
                  </button>
                </div>

                <button 
                  onClick={() => alert("Link da publicação copiado para partilhar com a comunidade pet!")}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                  title="Partilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Caption */}
              <div className="text-xs text-slate-800 leading-relaxed">
                <span className="font-bold mr-1.5 text-slate-900">{post.petName}:</span>
                {post.caption}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Comments Accordion */}
              {openCommentPostId === post.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {post.comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Sê o primeiro pet a comentar!</p>
                    ) : (
                      post.comments.map((comment) => (
                        <div key={comment.id} className="text-xs bg-slate-50 p-2 rounded-xl flex items-start space-x-2">
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorPetName}
                            className="w-6 h-6 rounded-full object-cover mt-0.5 border border-slate-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{comment.authorPetName}</span>
                              <span className="text-[10px] text-slate-400">{comment.timeAgo}</span>
                            </div>
                            <p className="text-slate-700 text-[11px] mt-0.5">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder={`Comentar como ${activePet.name}...`}
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!commentInputs[post.id]?.trim()}
                      className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-xl disabled:opacity-40 hover:bg-emerald-700 transition-all"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              )}

            </div>
          </article>
        ))
      )}

      {/* Create New Post Modal with #NoHumans AI Moderation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif-title font-bold text-lg text-slate-900 flex items-center gap-2">
                  <span>Nova Foto para Feed #NoHumans</span>
                </h3>
                <p className="text-xs text-slate-500">Publicando em nome de <strong className="text-emerald-700">{activePet.name}</strong></p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Moderation Warning inside Modal */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Moderação Automática de Animais:</strong> A imagem será verificada para rejeitar fotos humanas.
              </div>
            </div>

            {/* Image Preview & Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">URL da Imagem Pet ou Escolhe Exemplo:</label>
              <input
                type="url"
                placeholder="https://exemplo.com/foto-cao.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />

              <div className="flex items-center space-x-2 pt-1 overflow-x-auto pb-1">
                <span className="text-[11px] text-slate-400 shrink-0">Exemplos:</span>
                {sampleImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImageUrl(img)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      imageUrl === img ? 'border-emerald-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Exemplo ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Legenda da Publicação:</label>
              <textarea
                rows={3}
                placeholder={`O que é que o ${activePet.name} aprontou hoje?`}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>

            {/* Toggle Test for Moderation Rejection */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Simular deteção de humano (Testar Rejeição de Moderação)</span>
              </div>
              <input
                type="checkbox"
                checked={simulateHumanError}
                onChange={(e) => setSimulateHumanError(e.target.checked)}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Moderation Error or Success Messages */}
            {moderationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{moderationError}</div>
              </div>
            )}

            {moderationSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium">
                {moderationSuccess}
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 text-xs font-semibold text-slate-600 bg-slate-100 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handlePublishPost}
                disabled={moderating}
                className="flex-1 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {moderating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analisando #NoHumans...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Validar & Publicar</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
