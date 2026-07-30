import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('Pedro & Maria Silva');
  const [address, setAddress] = useState('Avenida da Liberdade 120, 3º Dto');
  const [city, setCity] = useState('Lisboa');
  const [postalCode, setPostalCode] = useState('1250-146');
  const [phone, setPhone] = useState('912 345 678');
  const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'multibanco' | 'card'>('mbway');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 30.0;
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 3.90;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedTracking = 'PT-PET-' + Math.floor(100000 + Math.random() * 900000);
    setTrackingNumber(generatedTracking);
    setOrderComplete(true);
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      
      {/* Drawer Box */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h3 className="font-serif-title font-bold text-slate-900 text-base">
              Carrinho da Boutique
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} itens
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Bar (Portugal Rule > 30€) */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Portes Grátis em Portugal
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                '🎉 Parabéns! Portes Grátis Atingidos'
              ) : (
                `Faltam €${remainingForFreeShipping.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Válido para envios continentais e ilhas em compras superiores a 30.00€.
          </p>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🛍️</div>
              <h4 className="font-serif-title font-bold text-slate-800 text-sm">O carrinho está vazio</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explora a nossa Boutique Inteligente e adiciona roupas, acessórios e brinquedos ideais para o teu pet!
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {item.product.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span className="bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-md">
                      Tamanho {item.selectedSize}
                    </span>
                    {item.targetPetName && (
                      <span className="text-slate-400">para {item.targetPetName}</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-serif">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                    title="Remover item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-1.5 bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1 text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Produtos:</span>
                <span className="font-semibold text-slate-800">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envio (Portugal Continental):</span>
                <span className="font-semibold text-slate-800">
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700">GRÁTIS</strong>
                  ) : (
                    `€${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Final:</span>
                <span className="text-emerald-800 font-serif">€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Avançar para Checkout Portugal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-8 border border-slate-100">
            
            {orderComplete ? (
              /* Receipt Order Success */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-serif-title font-bold text-xl text-slate-900">
                  Encomenda Confirmada! 🐾
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  A tua encomenda da Pet Family já está a ser preparada com todo o carinho para envio.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Código de Rastreio (CTT/Nacex):</span>
                    <span className="font-mono font-bold text-slate-900">{trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destino:</span>
                    <span className="font-semibold text-slate-800">{city}, Portugal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor Total Pago:</span>
                    <span className="font-bold text-emerald-700 font-serif">€{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setOrderComplete(false);
                    setIsCheckoutOpen(false);
                    onClose();
                  }}
                  className="w-full bg-slate-900 text-white font-semibold text-xs py-3 rounded-2xl hover:bg-slate-800 transition-colors"
                >
                  Voltar à Pet Family
                </button>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-serif-title font-bold text-base text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Checkout Seguro (Portugal)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Address Form */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nome do Tutor / Responsável:</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Morada de Entrega:</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Código Postal:</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Cidade / Concelho:</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Telemóvel para Notificações CTT:</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="font-semibold text-xs text-slate-700 block">Método de Pagamento:</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'mbway', label: 'MB WAY 📱' },
                      { id: 'multibanco', label: 'Multibanco 💳' },
                      { id: 'card', label: 'Cartão 🔒' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                          paymentMethod === pm.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Confirm */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Total a Pagar</div>
                    <div className="text-base font-bold text-slate-900 font-serif">€{total.toFixed(2)}</div>
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    Confirmar Encomenda
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
