import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficultyParam = searchParams.get("difficulty") || "facil";

    // 1. Normaliza a dificuldade (Remove acentos, espaços e joga para minúsculo)
    // Transforma "Fácil" em "facil", "Médio" em "medio", "Difícil" em "dificil"
    const nivel = difficultyParam
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Erro: GEMINI_API_KEY não encontrada no .env.local");
      return NextResponse.json({ erro: "Chave da IA não configurada." }, { status: 500 });
    }

    // 2. Inicializa o SDK oficial do Google Gemini
    const ai = new GoogleGenerativeAI(apiKey);
    
    // Usamos o modelo oficial 1.5-flash com resposta travada em JSON
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    // Prompt adaptado perfeitamente para as variáveis em português do seu Mestre das Molas
    const prompt = `
      Você é o motor de IA do Mestre das Molas, um SaaS de educação financeira.
      Gere um array contendo exatamente 10 perguntas inéditas sobre economia, investimentos ou finanças pessoais.
      
      Dificuldade estrita das perguntas: ${nivel.toUpperCase()}.
      
      Você DEVE responder EXATAMENTE no formato JSON abaixo, sem usar blocos de código markdown (como \`\`\`json), sem textos antes ou depois da estrutura. Apenas o array de objetos puro:

      [
        {
          "id": "1",
          "dificuldade": "${nivel}",
          "pergunta": "Texto da pergunta aqui?",
          "alternativas": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
          "respostaCorreta": 0,
          "explicacao": "Explicação curta do porquê esta alternativa está correta."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    if (!aiText) {
      throw new Error("O modelo da IA retornou um corpo de texto vazio.");
    }

    const quizQuestions = JSON.parse(aiText);
    return NextResponse.json(quizQuestions);

  } catch (error: any) {
    console.error("Erro interno no motor da IA:", error);
    return NextResponse.json(
      { erro: "Erro ao gerar perguntas.", detalhes: error.message }, 
      { status: 500 }
    );
  }
}