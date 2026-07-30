import React, { useState } from 'react';
import { ChatConversation, Pet } from '../types';
import { Send, ImageOff, Lock, Sparkles, User, MessageCircle } from 'lucide-react';
import { ChatSkeleton } from './SkeletonLoaders';

interface MessagesViewProps {
  conversations: ChatConversation[];
  activePet: Pet;
  onSendMessage: (chatId: string, text: string) => void;
  isLoading?: boolean;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  activePet,
  onSendMessage,
  isLoading = false,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(conversations[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');

  const selectedConversation = conversations.find((c) => c.id === selectedChatId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;
    onSendMessage(selectedConversation.id, messageInput.trim());
    setMessageInput('');
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto px-2 sm:px-4 pt-2">
      
      {/* MVP Text-Only Rule Warning Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
            <ImageOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-title font-bold text-xs text-amber-200">
                Chat Direto entre Tutores (MVP)
              </span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
                Texto Apenas
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Por razões de segurança e moderação no MVP, o envio de anexos de imagem nas mensagens privadas está temporariamente desativado.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Interface Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[480px]">
        
        {/* Left Column: Chat Conversations List */}
        <div className="border-r border-slate-100 bg-slate-50/50 p-3 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Conversas Ativas ({conversations.length})
          </div>

          {isLoading ? (
            <>
              <ChatSkeleton />
              <ChatSkeleton />
            </>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === selectedChatId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChatId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center space-x-3 border ${
                    isSelected
                      ? 'bg-white border-emerald-200 shadow-2xs font-medium'
                      : 'border-transparent hover:bg-slate-100/80 text-slate-600'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.petAvatar}
                      alt={conv.tutorName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {conv.tutorName}
                      </span>
                      <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Messages Thread Window */}
        {selectedConversation ? (
          <div className="md:col-span-2 flex flex-col justify-between h-full bg-white">
            
            {/* Thread Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedConversation.petAvatar}
                  alt={selectedConversation.tutorName}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-300"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {selectedConversation.tutorName}
                  </h4>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {selectedConversation.petName} • Tutor Ativo
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Chat Protegido</span>
              </div>
            </div>

            {/* Message History Bubble Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/30 max-h-[360px]">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end space-x-2 ${
                    msg.isFromUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!msg.isFromUser && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-6 h-6 rounded-full object-cover mb-1 border border-slate-200 shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                      msg.isFromUser
                        ? 'bg-emerald-700 text-white rounded-br-2xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-2xs'
                    }`}
                  >
                    {!msg.isFromUser && (
                      <div className="text-[10px] font-bold text-emerald-700">{msg.senderName}</div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-[9px] text-right font-mono ${
                        msg.isFromUser ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form with Disabled Image Button Notice */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                
                {/* Disabled Image Upload button to enforce MVP rule */}
                <button
                  type="button"
                  disabled
                  title="Anexo de imagens desativado no MVP"
                  className="p-2 text-slate-300 bg-slate-50 rounded-xl cursor-not-allowed relative group"
                >
                  <ImageOff className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Mensagem privada de tutor para tutor...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-2xs transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center p-8 text-slate-400 text-xs">
            Seleciona uma conversa para iniciar mensagens.
          </div>
        )}

      </div>

    </div>
  );
};
