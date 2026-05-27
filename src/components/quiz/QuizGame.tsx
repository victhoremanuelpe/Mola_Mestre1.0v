"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Dificuldade, QuizQuestion } from "@/types/quiz";

interface QuizGameProps {
  pergunta: QuizQuestion;
  indiceAtual: number;
  totalPerguntas: number;
  dificuldade: Dificuldade | null;
  onAcerto: () => void;
  onProxima: () => void;
}

export function QuizGame({
  pergunta,
  indiceAtual,
  totalPerguntas,
  dificuldade,
  onAcerto,
  onProxima,
}: QuizGameProps) {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [mostraCorreta, setMostraCorreta] = useState(false);

  const progresso = ((indiceAtual + 1) / totalPerguntas) * 100;

  const responder = (indexOpcao: number) => {
    if (mostraCorreta) return;

    setSelecionada(indexOpcao);
    setMostraCorreta(true);

    if (indexOpcao === pergunta.respostaCorreta) {
      onAcerto();
    }
  };

  const handleProxima = () => {
    setSelecionada(null);
    setMostraCorreta(false);
    onProxima();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-6 my-4">
        {/* Topo do Card: Nível e Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dificuldade?.toLowerCase().includes("facil")
                    ? "bg-green-500"
                    : dificuldade?.toLowerCase().includes("medio")
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              Nível {dificuldade}
            </span>
            <span>
              {indiceAtual + 1} / {totalPerguntas}
            </span>
          </div>
          <Progress value={progresso} className="h-2 bg-gray-200" />
        </div>

        {/* Card Principal da Pergunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pergunta._id || indiceAtual}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-lg bg-white overflow-hidden h-auto">
              <CardContent className="p-5 md:p-8 space-y-5 md:space-y-6">

                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-relaxed break-words hyphens-auto">
                  {pergunta.pergunta}
                </h2>

                {/* Alternativas */}
                <div className="space-y-3">
                  {pergunta.alternativas.map((opcao, i) => {
                    let styleClass =
                      "border-gray-200 hover:border-[#014635] hover:bg-gray-50";
                    let icon = null;

                    if (mostraCorreta) {
                      if (i === pergunta.respostaCorreta) {
                        styleClass =
                          "bg-green-50 border-green-500 text-green-800 font-medium";
                        icon = (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        );
                      } else if (i === selecionada) {
                        styleClass = "bg-red-50 border-red-500 text-red-800";
                        icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                      } else {
                        styleClass = "opacity-50 border-gray-100";
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={mostraCorreta}
                        onClick={() => responder(i)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center gap-4 cursor-pointer ${styleClass}`}
                      >
                        <span className="text-sm md:text-base leading-snug break-words">{opcao}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {/* Bloco de Explicação Gerado pela IA */}
                <AnimatePresence>
                  {mostraCorreta && pergunta.explicacao && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs md:text-sm font-bold text-amber-900 uppercase tracking-wide">
                            Explicação do Mestre:
                          </h4>
                          <p className="text-xs md:text-sm text-amber-800 leading-relaxed break-words">
                            {pergunta.explicacao}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Botão de Avançar */}
        <div className="h-12 flex justify-end">
          {mostraCorreta && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full sm:w-auto"
            >
              <Button
                onClick={handleProxima}
                className="w-full sm:w-auto bg-[#014635] hover:bg-[#00332a] text-white px-8 py-5 md:py-6 rounded-xl text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {indiceAtual + 1 === totalPerguntas
                  ? "Ver Resultado"
                  : "Próxima Pergunta"}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}