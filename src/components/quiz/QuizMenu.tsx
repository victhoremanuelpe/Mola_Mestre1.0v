"use client";

import { motion, Variants } from "framer-motion";
import { BookOpen, TrendingUp, Trophy, BrainCircuit } from "lucide-react";
import { QuizLevelCard } from "./QuizLevelCard";
import { Dificuldade } from "@/types/quiz";

interface QuizMenuProps {
  onStart: (nivel: Dificuldade) => void;
}

// Configuração da animação em cascata (Stagger) para os cards entrarem um por um
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function QuizMenu({ onStart }: QuizMenuProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl w-full space-y-8 text-center"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#014635] mb-3 flex justify-center items-center gap-3">
            <BrainCircuit className="w-12 h-12 text-[#014635]" /> Desafio Financeiro
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Teste os seus conhecimentos. Selecione a dificuldade:
          </p>
        </div>

        {/* Container transformado em motion.div para gerenciar a entrada dos filhos */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          <motion.div variants={itemVariants} className="h-full">
            <QuizLevelCard
              title="Fácil"
              icon={<BookOpen className="w-8 h-8 text-green-600" />}
              desc="Conceitos básicos e definições."
              color="border-green-100 hover:border-green-500 hover:bg-green-50/50"
              onClick={() => onStart("Fácil")}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <QuizLevelCard
              title="Médio"
              icon={<TrendingUp className="w-8 h-8 text-amber-500" />}
              desc="Análise de ativos e indicadores."
              color="border-amber-100 hover:border-amber-500 hover:bg-amber-50/50"
              onClick={() => onStart("Médio")}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <QuizLevelCard
              title="Difícil"
              icon={<Trophy className="w-8 h-8 text-red-500" />}
              desc="Derivativos e Macroeconomia."
              color="border-red-100 hover:border-red-500 hover:bg-red-50/50"
              onClick={() => onStart("Difícil")}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}