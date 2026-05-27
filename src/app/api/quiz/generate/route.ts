import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: Request) {
  // Guardamos o nível aqui fora para uso no catch se a IA falhar
  let nivel = "facil"; 

  try {
    const { searchParams } = new URL(request.url);
    const difficultyParam = searchParams.get("difficulty") || "facil";

    // 1. Normaliza a dificuldade (Remove acentos, espaços e joga para minúsculo)
    nivel = difficultyParam
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
    
    // Usamos o modelo oficial 2.5-flash com resposta travada em JSON
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

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
    console.error("Erro interno no motor da IA (Acionando Fallback de Segurança):", error);

    // 🚨 SISTEMA DE BACKUP LOCAL: Se a Google cair ou der 503, o app não para!
    const fallbackQuestions = FALLBACK_QUESTIONS.filter((q) => q.dificuldade === nivel);
    
    // Embaralha as perguntas locais e entrega uma rodada válida
    const rodadaBackup = fallbackQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

    if (rodadaBackup.length > 0) {
      return NextResponse.json(rodadaBackup);
    }

    return NextResponse.json(
      { erro: "O motor de IA está congestionado e o backup falhou. Tente novamente." }, 
      { status: 503 }
    );
  }
}

// 📦 BANCO DE DADOS DE BACKUP INTEGRADO (Fica aqui caso a API falhe)
const FALLBACK_QUESTIONS = [
  // NÍVEL FÁCIL
  {
    id: "f1",
    dificuldade: "facil",
    pergunta: "O que acontece com o seu poder de compra quando a inflação aumenta de forma descontrolada?",
    alternativas: [
      "O poder de compra diminui, pois o dinheiro perde valor.",
      "O poder de compra aumenta de forma proporcional.",
      "Nada acontece, os preços continuam os mesmos.",
      "Os investimentos em poupança passam a render o dobro."
    ],
    respostaCorreta: 0,
    explicacao: "A inflação representa o aumento generalizado de preços. Quando ela sobe, a mesma quantidade de dinheiro compra menos coisas, reduzindo o poder de compra."
  },
  {
    id: "f2",
    dificuldade: "facil",
    pergunta: "Qual é o principal objetivo de se montar uma 'Reserva de Emergência'?",
    alternativas: [
      "Comprar ações de alto risco na Bolsa de Valores.",
      "Cobrir gastos imprevistos (saúde, demissão) sem contrair dívidas.",
      "Gastar todo o saldo em viagens e bens de luxo no fim do ano.",
      "Deixar o dinheiro travado por 10 anos para render juros."
    ],
    respostaCorreta: 1,
    explicacao: "A reserva de emergência serve para trazer segurança financeira diante de imprevistos do dia a dia, evitando empréstimos e juros altos."
  },
  
  // NÍVEL MÉDIO
  {
    id: "m1",
    dificuldade: "medio",
    pergunta: "Se a taxa Selic sofrer uma redução drástica pelo Banco Central, o que tende a acontecer com os investimentos em Renda Fixa tradicional?",
    alternativas: [
      "O rendimento deles tende a diminuir.",
      "Eles passam a render o triplo imediatamente.",
      "Eles migram automaticamente para a Bolsa.",
      "A inflação cai a zero no mesmo instante."
    ],
    respostaCorreta: 0,
    explicacao: "Como a taxa Selic é a taxa básica de juros da economia, o rendimento de ativos de Renda Fixa pós-fixados (como Tesouro Selic e CDBs 100% CDI) cai junto com ela."
  },
  {
    id: "m2",
    dificuldade: "medio",
    pergunta: "O que representa o indicador P/L (Preço sobre Lucro) na análise fundamentalista de uma ação?",
    alternativas: [
      "O patrimônio líquido total somado ao caixa da firma.",
      "O número de anos que levaria para recuperar o investimento através do lucro.",
      "O valor máximo que a ação pode atingir no dia.",
      "O percentual de dividendos distribuídos no último mês."
    ],
    respostaCorreta: 1,
    explicacao: "O P/L indica a relação entre o preço atual da ação e o lucro por ação. Grosso modo, dá uma estimativa de anos para o retorno do capital investido."
  },

  // NÍVEL DIFÍCIL
  {
    id: "d1",
    dificuldade: "dificil",
    pergunta: "No mercado de derivativos, qual é a principal característica de uma opção do tipo PUT?",
    alternativas: [
      "Dá ao titular o direito de COMPRAR um ativo por um preço fixado.",
      "Dá ao titular o direito de VENDER um ativo por um preço fixado.",
      "Obriga o investidor a manter o ativo em carteira perpetuamente.",
      "É um título de renda fixa emitido por bancos de investimento globais."
    ],
    respostaCorreta: 1,
    explicacao: "Uma opção de PUT é um contrato de opção de venda. Quem a compra adquire o direito (mas não a obrigação) de vender o ativo-objeto pelo preço de exercício estipulado."
  },
  {
    id: "d2",
    dificuldade: "dificil",
    pergunta: "O que caracteriza uma política monetária contracionista aplicada por uma autoridade monetária?",
    alternativas: [
      "Aumento da taxa de juros e restrição do crédito para conter a inflação.",
      "Redução de impostos federais para estimular o consumo em massa.",
      "Impressão desenfreada de papel-moeda para quitação de títulos públicos.",
      "Fixação artificial do preço do dólar comercial acima do mercado."
    ],
    respostaCorreta: 0,
    explicacao: "A política contracionista visa desacelerar a economia e conter a alta da inflação, subindo juros e tornando o dinheiro em circulação mais caro e escasso."
  }
];