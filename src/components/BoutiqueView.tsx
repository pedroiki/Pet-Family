import React, { useState } from 'react';
import { Product, Pet, ProductCategory, Species } from '../types';
import { getRecommendedSize, FitResult } from '../utils/sizing';
import { Sparkles, Check, Info, ShoppingBag, SlidersHorizontal, Star, ShieldCheck, Heart, ChevronRight, X } from 'lucide-react';
import { ProductSkeleton } from './SkeletonLoaders';

interface BoutiqueViewProps {
  products: Product[];
  activePet: Pet;
  onAddToCart: (product: Product, sizeName: string, petName: string) => void;
  isLoading?: boolean;
}

export const BoutiqueView: React.FC<BoutiqueViewProps> = ({
  products,
  activePet,
  onAddToCart,
  isLoading = false,
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(true);
  
  // Selected Product Modal state
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [selectedSizeName, setSelectedSizeName] = useState<string>('');
  const [addedSuccessToast, setAddedSuccessToast] = useState<string | null>(null);

  // Filter products based on controls
  const filteredProducts = products.filter((product) => {
    // Species filter
    if (selectedSpecies !== 'all') {
      if (product.targetSpecies !== 'all' && product.targetSpecies !== selectedSpecies) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (product.category !== selectedCategory) return false;
    }

    // Metric compatibility filter
    if (onlyCompatible) {
      const fit = getRecommendedSize(activePet, product);
      if (!fit.isCompatible) return false;
    }

    return true;
  });

  const handleOpenProductModal = (product: Product) => {
    setActiveModalProduct(product);
    const fit = getRecommendedSize(activePet, product);
    if (fit.recommendedSize) {
      setSelectedSizeName(fit.recommendedSize.name);
    } else if (product.sizes.length > 0) {
      setSelectedSizeName(product.sizes[0].name);
    }
  };

  const handleAddToCartClick = (product: Product, sizeName: string) => {
    onAddToCart(product, sizeName, activePet.name);
    setAddedSuccessToast(`Adicionado ao carrinho para ${activePet.name} (${sizeName})!`);
    setTimeout(() => setAddedSuccessToast(null), 2500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto px-2 sm:px-4 pt-2">
      
      {/* Smart Metrics Header Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-rose-50 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={activePet.avatarUrl}
                alt={activePet.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] p-0.5 rounded-full">
                {activePet.species === 'dog' ? '🐶' : '🐱'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif-title font-bold text-slate-900 text-base">
                  Recomendação Inteligente para <span className="text-emerald-800">{activePet.name}</span>
                </h2>
                <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                  Métricas Ativas
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                  Pescoço: <strong className="text-slate-900">{activePet.metrics.neckCm} cm</strong>
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                  Peito: <strong className="text-emerald-700">{activePet.metrics.chestCm} cm</strong>
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                  Costas: <strong className="text-slate-900">{activePet.metrics.backCm} cm</strong>
                </span>
                <span className="text-slate-400 text-[11px]">({activePet.weightKg} kg)</span>
              </div>
            </div>
          </div>

          {/* Toggle compatibility filter */}
          <div className="flex items-center space-x-2 bg-white/90 p-2 rounded-xl border border-emerald-200/80 shrink-0 shadow-2xs">
            <input
              type="checkbox"
              id="compatibleOnlyToggle"
              checked={onlyCompatible}
              onChange={(e) => setOnlyCompatible(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="compatibleOnlyToggle" className="text-xs font-medium text-slate-800 cursor-pointer select-none">
              Apenas tamanhos ideais para <strong className="text-emerald-800">{activePet.name}</strong>
            </label>
          </div>
        </div>
      </div>

      {/* Filters Bar: Species & Categories */}
      <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
        
        {/* Species Filter Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Espécie:</span>
          </div>
          <div className="flex space-x-2 shrink-0">
            {[
              { id: 'all', label: 'Todos os Patudos 🐾' },
              { id: 'dog', label: 'Cães 🐶' },
              { id: 'cat', label: 'Gatos 🐱' },
            ].map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpecies(sp.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedSpecies === sp.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex space-x-2 overflow-x-auto pt-1 border-t border-slate-50">
          {[
            { id: 'all', label: 'Todas as Categorias' },
            { id: 'roupas', label: 'Roupas & Capas 🧥' },
            { id: 'acessorios', label: 'Acessórios & Coleiras 🎀' },
            { id: 'camas', label: 'Camas & Conforto 🛏️' },
            { id: 'brinquedos', label: 'Brinquedos 🎾' },
            { id: 'higiene', label: 'Higiene & Cuidados 🧼' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Toast notification */}
      {addedSuccessToast && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-top border border-emerald-500/40">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{addedSuccessToast}</span>
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-slate-100">
          <div className="text-3xl">🐾</div>
          <h3 className="font-serif-title font-bold text-slate-800 text-base">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não encontrámos produtos para este filtro ou com tamanhos 100% compatíveis com as medidas de {activePet.name}.
          </p>
          <button
            onClick={() => {
              setOnlyCompatible(false);
              setSelectedCategory('all');
              setSelectedSpecies('all');
            }}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 transition-colors"
          >
            Ver todos os produtos da Boutique
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const fit = getRecommendedSize(activePet, product);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative bg-slate-100 h-48 overflow-hidden cursor-pointer" onClick={() => handleOpenProductModal(product)}>
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        {product.badge}
                      </span>
                    )}

                    {/* Metric Recommendation Badge */}
                    {fit.recommendedSize && (
                      <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/90 backdrop-blur-md text-emerald-200 text-[10px] p-1.5 rounded-xl border border-emerald-500/40 flex items-center justify-between shadow-xs">
                        <span className="font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Tam. {fit.recommendedSize.name} para {activePet.name}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">{fit.matchScore}% Fit</span>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="uppercase tracking-wider font-semibold">{product.category}</span>
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => handleOpenProductModal(product)}
                      className="font-bold text-xs text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-2 leading-snug"
                    >
                      {product.title}
                    </h3>

                    {/* Sizing Fit Reason Text */}
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      {fit.reason}
                    </p>
                  </div>
                </div>

                {/* Price & Quick Add Button */}
                <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                  <div>
                    <div className="text-slate-900 font-bold text-sm font-serif">
                      €{product.price.toFixed(2)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-[10px] text-slate-400 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCartClick(product, fit.recommendedSize?.name || product.sizes[0]?.name || 'Unico')}
                    className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition-transform active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Product Modal & Metric Comparison Chart */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                Guia Métrico Pet Family
              </span>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative bg-slate-100 rounded-2xl h-56 overflow-hidden">
              <img
                src={activeModalProduct.imageUrl}
                alt={activeModalProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Title & Price */}
            <div>
              <h3 className="font-serif-title font-bold text-lg text-slate-900">
                {activeModalProduct.title}
              </h3>
              <div className="text-xl font-bold text-slate-900 font-serif mt-1">
                €{activeModalProduct.price.toFixed(2)}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeModalProduct.description}
              </p>
            </div>

            {/* Metric Sizing Table comparison against Active Pet */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Comparação de Tamanhos vs {activePet.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  Peito do pet: <strong>{activePet.metrics.chestCm}cm</strong>
                </span>
              </div>

              {/* Sizes Grid */}
              <div className="space-y-2">
                {activeModalProduct.sizes.map((sz) => {
                  const fit = activePet.metrics.chestCm >= sz.minChestCm && activePet.metrics.chestCm <= sz.maxChestCm;
                  const isSelected = selectedSizeName === sz.name;

                  return (
                    <div
                      key={sz.name}
                      onClick={() => setSelectedSizeName(sz.name)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 shadow-2xs'
                          : fit
                          ? 'border-emerald-200 bg-white hover:border-emerald-400'
                          : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sz.name}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">
                            Peito: {sz.minChestCm}-{sz.maxChestCm} cm | Pescoço: {sz.minNeckCm}-{sz.maxNeckCm} cm
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Comprimento Costas: {sz.minBackCm}-{sz.maxBackCm} cm
                          </div>
                        </div>
                      </div>

                      {fit && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ Compatível
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  handleAddToCartClick(activeModalProduct, selectedSizeName || 'M');
                  setActiveModalProduct(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar Tamanho {selectedSizeName || 'M'} ao Carrinho para {activePet.name}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
