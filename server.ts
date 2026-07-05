import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

// Configuração do Multer para uploads em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // Limite de 25MB
  },
});

// Inicialização da Gemini API (Server-side)
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn("⚠️ ATENÇÃO: A variável de ambiente GEMINI_API_KEY não foi configurada.");
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Inicialização do Supabase Client (para buscar as configurações do negócio e chat_messages)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://wjyrinydwrazuzjczhbw.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeXJpbnlkd3JhenV6amN6aGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTA3MTAsImV4cCI6MjA3OTA2NjcxMH0.lx5gKNPJLBfBouwH99MFFYHtjvxDZeohwoJr9JlSblg";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Habilita parsing de JSON e urlencoded para campos normais do formulário
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rota de Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor IARA ativo!" });
});

/**
 * Rota POST /api/chat
 * Recebe texto ou áudio gravado e processa a resposta usando a base de conhecimento do usuário.
 */
app.post("/api/chat", upload.single("audio"), async (req, res) => {
  try {
    const { message, userId, conversationId, email } = req.body;
    let transcribedText = message || "";

    if (!userId) {
      return res.status(400).json({ error: "O parâmetro userId é obrigatório." });
    }

    if (!geminiApiKey) {
      return res.status(500).json({ error: "Gemini API Key não está configurada no servidor." });
    }

    // 1) Se veio arquivo de áudio, realiza a transcrição usando a Gemini API
    if (req.file) {
      console.log(`[Chat] Processando arquivo de áudio recebido. Tamanho: ${req.file.size} bytes`);
      try {
        const audioPart = {
          inlineData: {
            data: req.file.buffer.toString("base64"),
            mimeType: req.file.mimetype || "audio/webm",
          },
        };

        const transcriptionResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            audioPart,
            "Transcreva o áudio acima exatamente como falado, de forma literal em português brasileiro. Retorne APENAS o texto transcrito literal, sem cabeçalhos, comentários, explicações ou correções."
          ],
        });

        transcribedText = (transcriptionResponse.text || "").trim();
        console.log(`[Chat] Áudio transcrito com sucesso: "${transcribedText}"`);

        if (!transcribedText) {
          return res.status(400).json({ error: "Não foi possível compreender o áudio. Por favor, fale mais alto ou tente enviar texto." });
        }
      } catch (audioErr: any) {
        console.error("[Chat] Erro ao transcrever áudio com Gemini:", audioErr);
        return res.status(500).json({ error: "Falha ao processar o áudio com a inteligência artificial. Tente enviar por texto." });
      }
    }

    if (!transcribedText || transcribedText.trim() === "") {
      return res.status(400).json({ error: "Mensagem ou áudio vazio." });
    }

    // 2) Busca as regras e dados do negócio (Treinamento da IA) do banco do Supabase
    const { data: gymConfig, error: configErr } = await supabase
      .from("gym_configs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (configErr) {
      console.error("[Chat] Erro ao carregar configurações do Supabase:", configErr);
    }

    // Estrutura a base de conhecimento do negócio
    const gymName = gymConfig?.gym_name || "IARA Gym";
    const openingHours = gymConfig?.opening_hours || "Não informado";
    const pricingInfo = gymConfig?.pricing_info || "Não informado";
    const faqText = gymConfig?.faq_text || "Não informado";
    const observations = gymConfig?.observations || "Não informado";
    const pixKey = gymConfig?.pix_key || "Não informado";
    const address = gymConfig?.address || "Não informado";
    const phone = gymConfig?.phone || "Não informado";

    const systemInstruction = `Você é a IARA, a inteligência artificial de atendimento para o negócio de fitness e bem-estar chamado "${gymName}".
Sua principal função é atender aos clientes ou alunos de forma amigável, acolhedora, prestativa e objetiva, utilizando as seguintes informações reais do negócio como sua base de conhecimento inquestionável:

- Nome do Negócio: ${gymName}
- Telefone / WhatsApp de contato: ${phone}
- Endereço Principal: ${address}
- Chave Pix para Pagamentos: ${pixKey}
- Horários de Funcionamento:
${openingHours}

- Informações sobre Preços, Planos e Mensalidades:
${pricingInfo}

- FAQ / Regras de Uso / Perguntas Frequentes:
${faqText}

- Observações Adicionais / Outros Detalhes:
${observations}

Diretrizes de resposta muito importantes:
1. Responda em português brasileiro.
2. Seja simpática, solícita e use uma linguagem natural e profissional. Use emojis de forma moderada se achar apropriado para criar empatia.
3. Use APENAS as informações listadas na base de conhecimento acima para responder perguntas sobre o negócio. Se o usuário perguntar algo que não está nessa base de conhecimento, responda educadamente que você não tem essa informação exata no momento, mas sugira que ele entre em contato diretamente com a equipe humana pelo telefone/WhatsApp ${phone}.
4. NUNCA invente preços, horários, regras, promoções ou endereços que não estejam explicitamente listados acima.
5. Se o cliente solicitar a chave Pix, forneça a chave Pix "${pixKey}".
6. Mantenha as respostas de tamanho razoável, ideais para leitura no WhatsApp ou em chats rápidos.`;

    // 3) Busca o histórico da conversa na tabela chat_messages para dar contexto/memória
    let contents: any[] = [];
    if (conversationId) {
      const { data: historyMessages, error: historyErr } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(12);

      if (historyErr) {
        console.error("[Chat] Erro ao buscar histórico do chat:", historyErr);
      } else if (historyMessages && historyMessages.length > 0) {
        for (const msg of historyMessages) {
          // Garante os papéis aceitos pela Gemini API: 'user' ou 'model'
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Adiciona a nova mensagem do usuário
    contents.push({
      role: "user",
      parts: [{ text: transcribedText }],
    });

    // 4) Envia tudo para o Gemini processar a resposta final
    console.log(`[Chat] Solicitando resposta da IARA para o texto: "${transcribedText}"`);
    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = (chatResponse.text || "Desculpe, não consegui formular uma resposta no momento.").trim();

    return res.json({
      success: true,
      reply: reply,
      userTextTranscribed: req.file ? transcribedText : undefined,
    });
  } catch (error: any) {
    console.error("[Chat] Erro geral na rota de chat:", error);
    return res.status(500).json({ error: error.message || "Ocorreu um erro interno ao processar a conversa." });
  }
});

/**
 * Rota POST /api/train-audio
 * Recebe uma gravação de voz explicativa do dono do negócio e retorna um texto altamente estruturado e organizado
 * com as regras que foram ditas no áudio para o usuário revisar e salvar no Cérebro da IA.
 */
app.post("/api/train-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo de áudio foi enviado." });
    }

    if (!geminiApiKey) {
      return res.status(500).json({ error: "Gemini API Key não está configurada no servidor." });
    }

    console.log(`[Treino] Processando gravação de treino de áudio. Tamanho: ${req.file.size} bytes`);

    const audioPart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype || "audio/webm",
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        audioPart,
        `Você é um assistente de IA especialista em extrair e organizar informações de negócios em português brasileiro.
Analise o áudio explicativo acima, que contém uma gravação do dono ou administrador de uma empresa detalhando as regras, preços, planos, horários, localização, ou funcionamento geral do negócio.

Sua tarefa:
1. Escute com atenção e transcreva os pontos explicados.
2. Formate e organize as informações extraídas em um texto claro, profissional e perfeitamente estruturado usando tópicos em português (Markdown).
3. Agrupe as informações em categorias úteis como:
   - 🕒 **Horários de Funcionamento**
   - 💰 **Preços e Planos**
   - 📝 **Regras e FAQ**
   - 📌 **Diferenciais / Observações do Negócio**
4. Retorne APENAS o texto estruturado e organizado em formato Markdown, pronto para ser copiado ou adicionado às observações de treinamento da IA. Não adicione saudações de introdução ou conclusão. Vá direto às informações organizadas.`
      ],
    });

    const structuredText = (response.text || "").trim();

    return res.json({
      success: true,
      structuredText: structuredText,
    });
  } catch (error: any) {
    console.error("[Treino] Erro na rota de treino por áudio:", error);
    return res.status(500).json({ error: error.message || "Erro ao processar áudio de treinamento." });
  }
});

// Middleware do Vite para desenvolvimento e estáticos em produção
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Erro ao inicializar o servidor Express com Vite:", err);
});
