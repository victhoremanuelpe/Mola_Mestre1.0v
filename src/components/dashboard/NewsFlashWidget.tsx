"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Newspaper, Clock, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";

import { NewsItem } from "../../types/news"; 

export function NewsFlashWidget() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca as notícias reais da nossa rota de API RSS
  useEffect(() => {
    async function fetchTopNews() {
      try {
        setLoading(true);
        const response = await axios.get("/api/news");
        // Pegamos apenas as 3 primeiras notícias mais recentes para o Widget do painel
        setNews((response.data as NewsItem[]).slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar notícias no widget:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopNews();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col h-full justify-between">
      <div className="space-y-4">
        {/* Cabeçalho do Widget */}
        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
          <div className="flex items-center gap-2 text-[#014635]">
            <Newspaper className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-wide uppercase">Últimas do Mercado</h3>
          </div>
          <span className="bg-emerald-50 text-[#014635] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Ao Vivo
          </span>
        </div>

        {/* Estado de Carregamento */}
        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#014635]" />
            <span className="text-xs">Sincronizando feeds...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-gray-400">
            Nenhuma notícia recente disponível.
          </div>
        ) : (
          /* Lista de Notícias Reais */
          <div className="space-y-3">
            {news.map((item) => (
              <div 
                key={item._id}
                onClick={() => router.push("/news")}
                className="group p-2.5 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
                  <span className="uppercase text-[#014635] font-bold text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.tag}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#014635] transition-colors leading-snug">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão de Redirecionamento para a Central Completa */}
      <button
        onClick={() => router.push("/news")}
        className="mt-4 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-[#014635]/5 text-xs font-bold text-[#014635] transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        Ver Central de Notícias
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}