"use client";

import React, { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react"; // Ícone de carregamento

import { QuizMenu } from "@/components/quiz/QuizMenu";
import { QuizGame } from "@/components/quiz/QuizGame";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Dificuldade, QuizQuestion } from "@/types/quiz";

export default function QuizFinanceiroPage() {
  const [dificuldade, setDificuldade] = useState<Dificuldade | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "result">(
    "menu"
  );
  const [perguntasDaRodada, setPerguntasDaRodada] = useState<QuizQuestion[]>(
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Novo estado de carregamento

  const iniciarQuiz = async (nivel: Dificuldade) => {
    setIsLoading(true);
    try {
      // Chama a nossa rota que se comunica com a IA passando a dificuldade escolhida
      const response = await axios.get(`/api/quiz/generate?difficulty=${nivel}`);
      const perguntasGeradas = response.data;

      // Armazena as perguntas vindas diretamente do cérebro da IA
      setPerguntasDaRodada(perguntasGeradas);
      setDificuldade(nivel);
      setGameState("playing");
      setAcertos(0);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Erro ao buscar perguntas da IA, verifique sua GEMINI_API_KEY", error);
      alert("Não foi possível gerar as perguntas com IA neste momento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcerto = () => {
    setAcertos((prev) => prev + 1);
  };

  const proximaPergunta = () => {
    if (currentIndex + 1 < perguntasDaRodada.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setGameState("result");
    }
  };

  const reiniciar = () => {
    setDificuldade(null);
    setGameState("menu");
  };

  // Tela de transição inteligente enquanto a IA formata a prova
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] items-center justify-center bg-gray-50/50 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <div className="text-center">
          <h3 className="font-semibold text-gray-700 text-lg">Mestre das Molas IA</h3>
          <p className="text-gray-500 text-sm">Gerando perguntas inéditas de nível {dificuldade || ""}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-100px)] overflow-hidden">
      {gameState === "menu" && <QuizMenu onStart={iniciarQuiz} />}

      {gameState === "playing" && perguntasDaRodada.length > 0 && (
        <QuizGame
          pergunta={perguntasDaRodada[currentIndex]}
          indiceAtual={currentIndex}
          totalPerguntas={perguntasDaRodada.length}
          dificuldade={dificuldade}
          onAcerto={handleAcerto}
          onProxima={proximaPergunta}
        />
      )}

      {gameState === "result" && (
        <QuizResult
          acertos={acertos}
          totalPerguntas={perguntasDaRodada.length}
          dificuldade={dificuldade}
          onReiniciar={reiniciar}
        />
      )}
    </div>
  );
}