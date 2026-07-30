import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for base64 camera image uploads
  app.use(express.json({ limit: '25mb' }));

  // API Route: Breed Identification via Gemini AI
  app.post('/api/identify-breed', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Nenhuma imagem foi fornecida.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Chave GEMINI_API_KEY não configurada no servidor.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Strip header data URI prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const promptText = `Você é um especialista em veterinária, genómica de animais e identificação de raças do Pet Family.
Analise detalhadamente a foto deste cão, gato ou pet fornecida.
Identifique se é cão, gato ou outra espécie, se é raça pura ou mistura (SDR / vira-lata com estimativa de porcentagens das raças que o compõem), as suas características físicas marcantes, temperamento típico, estimativa razoável de medidas corporais métricas em centímetros (Pescoço, Peito, Costas) e peso em kg para a Boutique Pet Family, e dicas úteis de cuidados.
Responda inteiramente em Português de Portugal.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              species: {
                type: Type.STRING,
                description: 'Cão, Gato ou Outro',
              },
              primaryBreed: {
                type: Type.STRING,
                description: 'Nome da raça principal ou identificação da mistura (ex: Border Collie ou Mistura de Golden Retriever com Poodle)',
              },
              confidencePercentage: {
                type: Type.NUMBER,
                description: 'Nível de confiança da análise de 0 a 100',
              },
              isMix: {
                type: Type.BOOLEAN,
                description: 'Verdadeiro se for uma mistura de raças / SDR',
              },
              breedBreakdown: {
                type: Type.ARRAY,
                description: 'Lista de raças identificadas na mistura com estimativa de %',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    breed: { type: Type.STRING },
                    percentage: { type: Type.NUMBER },
                  },
                },
              },
              physicalTraits: {
                type: Type.ARRAY,
                description: 'Lista de traços físicos distintivos visíveis na foto',
                items: { type: Type.STRING },
              },
              personality: {
                type: Type.STRING,
                description: 'Descrição do temperamento e personalidade provável do animal',
              },
              suggestedMetrics: {
                type: Type.OBJECT,
                description: 'Estimativa métrica recomendada para a Boutique Pet Family',
                properties: {
                  neckCm: { type: Type.NUMBER, description: 'Circunferência do pescoço em cm' },
                  chestCm: { type: Type.NUMBER, description: 'Circunferência do peito em cm' },
                  backCm: { type: Type.NUMBER, description: 'Comprimento das costas em cm' },
                  estimatedWeightKg: { type: Type.NUMBER, description: 'Peso estimado em kg' },
                },
              },
              careAndGrooming: {
                type: Type.ARRAY,
                description: 'Dicas de higiene, tosquia, alimentação ou exercício para esta raça',
                items: { type: Type.STRING },
              },
              funFact: {
                type: Type.STRING,
                description: 'Curiosidade divertida sobre esta raça ou características',
              },
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('A IA Gemini não retornou dados formatados.');
      }

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, result: parsedData });
    } catch (err: any) {
      console.error('Erro na análise de raça:', err);
      return res.status(500).json({
        error: err.message || 'Ocorreu um erro ao analisar a imagem com IA.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite development vs production setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Pet Family a correr em http://0.0.0.0:${PORT}`);
  });
}

startServer();
