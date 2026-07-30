import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Scan,
  Sparkles,
  RefreshCw,
  X,
  Check,
  Dog,
  Cat,
  Ruler,
  AlertCircle,
  Award,
  Zap,
  Info,
  ChevronRight,
  FlipHorizontal,
  Plus,
} from 'lucide-react';
import { BreedScanResult, Pet } from '../types';

interface PetScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToActivePet?: (scanResult: BreedScanResult) => void;
  onCreateNewPetFromScan?: (scanResult: BreedScanResult) => void;
}

export const PetScannerModal: React.FC<PetScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyToActivePet,
  onCreateNewPetFromScan,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState('Iniciando visão computacional...');
  const [scanResult, setScanResult] = useState<BreedScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop video stream when closing or switching mode
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream
  const startCamera = async () => {
    stopCameraStream();
    setCameraPermissionError(false);
    setErrorMsg(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Erro ao aceder à câmara:', err);
      setCameraPermissionError(true);
      setActiveMode('upload');
    }
  };

  useEffect(() => {
    if (isOpen && activeMode === 'camera' && !capturedImage && !scanResult) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeMode, facingMode, capturedImage, scanResult]);

  if (!isOpen) return null;

  // Toggle camera direction (front / rear)
  const toggleCameraDirection = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from webcam / phone camera
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL('image/jpeg', 0.85);

    setCapturedImage(base64Data);
    stopCameraStream();
    processImageWithGemini(base64Data, 'image/jpeg');
  };

  // Handle file input selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecione um ficheiro de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64Data = evt.target?.result as string;
      setCapturedImage(base64Data);
      processImageWithGemini(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Call server backend API /api/identify-breed
  const processImageWithGemini = async (imageBase64: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    // Simulated progress steps for great UX during AI thinking
    const steps = [
      'Identificando contornos corporais do patudo...',
      'Analisando estrutura do focinho e orelhas...',
      'A comparar padrões de pelagem com base de dados genómica...',
      'A calcular probabilidades de raça pura ou SDR / Mistura...',
      'A gerar estimativas métricas para a Boutique Pet Family...',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
      setScanProgressText(steps[currentStep]);
    }, 800);

    try {
      const response = await fetch('/api/identify-breed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mimeType,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível analisar a raça da foto.');
      }

      setScanResult({
        ...data.result,
        scannedImageBase64: imageBase64,
      });
    } catch (err: any) {
      clearInterval(interval);
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Erro ao conectar à IA de identificação de raça.');
    } finally {
      setIsScanning(false);
    }
  };

  // Reset and scan again
  const handleResetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    setErrorMsg(null);
    setIsScanning(false);
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-base text-white flex items-center gap-2">
                <span>Scanner de Raça AI</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Gemini 3.6
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Identificação instantânea de cães e gatos com análise de mistura SDR e medidas métricas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Mode Tabs (Camera vs Upload) */}
          {!scanResult && !isScanning && (
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(null);
                  setActiveMode('camera');
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeMode === 'camera'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Câmara / Webcam</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setCapturedImage(null);
                  setActiveMode('upload');
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeMode === 'upload'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Carregar Foto da Galeria</span>
              </button>
            </div>
          )}

          {/* Camera View Area */}
          {!scanResult && !isScanning && activeMode === 'camera' && (
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 aspect-4/3 flex items-center justify-center group">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Target Scanner Overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/30 m-6 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                </div>

                {/* Animated Scanner Laser Line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse my-auto" />

                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                </div>
              </div>

              {/* Floating Camera Flip Button */}
              <button
                type="button"
                onClick={toggleCameraDirection}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full border border-slate-700 backdrop-blur-md shadow-md transition-transform active:scale-95"
                title="Mudar para câmara frontal/traseira"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              {/* Capture Button Bar */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center items-center">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 border-2 border-emerald-200"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Escanear Pet Agora</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload View Area */}
          {!scanResult && !isScanning && activeMode === 'upload' && (
            <div className="bg-slate-950 rounded-2xl p-6 border-2 border-dashed border-slate-800 text-center space-y-4 hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-slate-800">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">Carrega uma foto do teu Cão ou Gato</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Para melhores resultados, certifica-te que a cara e o corpo do animal estão bem iluminados e focados.
                </p>
              </div>

              <label className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer transition-all shadow-md">
                <Upload className="w-4 h-4" />
                <span>Escolher Ficheiro da Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {cameraPermissionError && (
                <div className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    A câmara não está disponível ou a permissão foi negada. Podes continuar normalmente carregando uma foto do teu telemóvel ou computador.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Scanning / Loading HUD */}
          {isScanning && (
            <div className="bg-slate-950 rounded-2xl p-8 border border-slate-800 text-center space-y-5">
              <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl">
                {capturedImage ? (
                  <img src={capturedImage} alt="Pet" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Dog className="w-10 h-10 text-emerald-400 animate-bounce" />
                  </div>
                )}
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>IA Gemini 3.6 a Processar Genoma Visual...</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{scanProgressText}</p>
              </div>

              <div className="w-48 mx-auto bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-400 h-full w-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Erro na Análise de Raça</span>
              </div>
              <p>{errorMsg}</p>
              <button
                onClick={handleResetScan}
                className="bg-rose-900 hover:bg-rose-800 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* AI Scan Result Overview */}
          {scanResult && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Result Header Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-2xl p-4 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row gap-4">
                {scanResult.scannedImageBase64 && (
                  <img
                    src={scanResult.scannedImageBase64}
                    alt={scanResult.primaryBreed}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0 mx-auto sm:mx-0"
                  />
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      {scanResult.species === 'Gato' ? <Cat className="w-3 h-3" /> : <Dog className="w-3 h-3" />}
                      {scanResult.species}
                    </span>

                    {scanResult.isMix ? (
                      <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        Mistura de Raças / SDR 🧬
                      </span>
                    ) : (
                      <span className="text-[11px] bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                        Raça Pura / Predominante 👑
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 ml-auto">
                      Confiança IA: <strong className="text-emerald-400">{scanResult.confidencePercentage}%</strong>
                    </span>
                  </div>

                  <h3 className="font-serif-title text-xl font-bold text-white">
                    {scanResult.primaryBreed}
                  </h3>

                  {scanResult.personality && (
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{scanResult.personality}"
                    </p>
                  )}
                </div>
              </div>

              {/* Mix Breed Breakdown (Percentages) */}
              {scanResult.breedBreakdown && scanResult.breedBreakdown.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Composição Estimada de Raças (DNA AI)</span>
                  </h4>

                  <div className="space-y-2.5">
                    {scanResult.breedBreakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">{item.breed}</span>
                          <span className="font-bold text-emerald-400">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Traits */}
              {scanResult.physicalTraits && scanResult.physicalTraits.length > 0 && (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Traços Físicos Observados
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.physicalTraits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-900 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-xl"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutique Recommended Metrics */}
              {scanResult.suggestedMetrics && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-xs text-emerald-200 uppercase tracking-wider">
                        Medidas Sugeridas para a Boutique Pet Family
                      </h4>
                    </div>
                    <span className="text-[10px] bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block">Pescoço</span>
                      <strong className="text-base text-emerald-300">
                        {scanResult.suggestedMetrics.neckCm} cm
                      </strong>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-400 font-bold block">Peito *Ref*</span>
                      <strong className="text-base text-emerald-300">
                        {scanResult.suggestedMetrics.chestCm} cm
                      </strong>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block">Costas</span>
                      <strong className="text-base text-emerald-300">
                        {scanResult.suggestedMetrics.backCm} cm
                      </strong>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] text-slate-400 block">Peso Est.</span>
                      <strong className="text-base text-emerald-300">
                        {scanResult.suggestedMetrics.estimatedWeightKg} kg
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Care & Grooming Tips */}
              {scanResult.careAndGrooming && scanResult.careAndGrooming.length > 0 && (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Dicas de Cuidados & Higiene</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {scanResult.careAndGrooming.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fun Fact */}
              {scanResult.funFact && (
                <div className="bg-indigo-950/40 border border-indigo-800/60 p-3 rounded-2xl text-xs text-indigo-200 flex items-start gap-2.5">
                  <Award className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-300 block font-bold mb-0.5">Sabias que?</strong>
                    <p className="text-slate-300">{scanResult.funFact}</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          {scanResult ? (
            <>
              <button
                type="button"
                onClick={handleResetScan}
                className="w-full sm:w-auto text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Escanear Outro</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onCreateNewPetFromScan && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNewPetFromScan(scanResult);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registar Novo Pet</span>
                  </button>
                )}

                {onApplyToActivePet && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToActivePet(scanResult);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aplicar ao meu Pet Ativo</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full text-right text-[11px] text-slate-500">
              Usa a câmara em tempo real ou faz o upload da foto para obter a análise de raça por IA Gemini.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
