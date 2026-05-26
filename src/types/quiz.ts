export type Dificuldade = "Fácil" | "Médio" | "Difícil" | "facil" | "medio" | "dificil";

export interface QuizQuestion {
  id?: string | number;     
  _id?: string | number;
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
  dificuldade: Dificuldade;
  explicacao: string;
}

export type GameState = "menu" | "playing" | "result";