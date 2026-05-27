import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { acertos, totalPerguntas, dificuldade } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chave não configurada." }, { status: 500 });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const porcentagem = (acertos / totalPerguntas) * 100;

const prompt = `
  Você é o analista de desempenho do Mestre das Molas, um SaaS de educação financeira.
  O usuário acabou de responder um Quiz de nível ${dificuldade.toUpperCase()}.
  Placar: ${acertos} acertos de ${totalPerguntas} perguntas.

  Gere uma análise de desempenho extremamente curta, direta e motivadora.
  
  🚨 REGRAS CRÍTICAS DE TEXTO:
  - O campo "message" deve conter no MÁXIMO 140 caracteres. Vá direto ao ponto.
  - Nunca use quebras de linha (\\n).

  🚨 REGRAS CRÍTICAS DE LINKS EXTERNOS (PROPÓSITO REAL):
  - Você está LIVRE para escolher de 2 a 3 links REAIS da internet que ajudem o usuário no propósito de estudo dele (ex: guias da B3, InfoMoney, Valor Econômico, Suno, portais de notícias ou simuladores oficiais).
  - É EXPRESSAMENTE PROIBIDO inventar URLs ou caminhos fictícios dentro do domínio do nosso aplicativo (mestrelasmolas.com).
  - Certifique-se de que a URL gerada exista de verdade e aponte para um portal financeiro autêntico.
  - O campo "title" deve ser curto e amigável (ex: "Guia de Ações da B3").

  Responda estritamente neste formato JSON:
  {
    "message": "Sua análise curta aqui com até 140 caracteres.",
    "links": [
      { "title": "Título Curto do Link", "url": "https://url-real-e-existente.com" }
    ]
  }
`;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();
    
    return NextResponse.json(JSON.parse(aiText));
  } catch (error) {
    console.error("Erro ao gerar feedback da IA:", error);

    return NextResponse.json({ message: null, links: [] });
  }
}