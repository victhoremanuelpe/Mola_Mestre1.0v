"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Newspaper, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import axios from "axios";
import { NewsModal } from "@/components/news/news-modal";
import { NewsItem } from "@/types/news";

// 1. Tipagem das Notícias para o Frontend
interface NewsItem {
  _id: number;
  tag: "MERCADO" | "AÇÕES" | "CRIPTO" | "FIIS" | "MACRO";
  title: string;
  excerpt: string;
  content: string;
  image: string;
  time: string;
  readTime: string;
  source: string;
  url: string; // Adicionado para suportar o link do G1
  sentiment?: "positive" | "negative" | "neutral";
}

const CATEGORIES = ["TODAS", "MERCADO", "AÇÕES", "CRIPTO", "FIIS", "MACRO"];

export default function NewsPage() {
  const [newsSelecionada, setNewsSelecionada] = useState<NewsItem | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]); // Corrigido: Estado adicionado com sucesso!
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");

  // 2. Buscar Notícias do nosso Feed RSS (G1 Economia)
  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await axios.get("/api/news");
        setNewsList(response.data);
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // 3. Sistema de Filtro Inteligente
  const filteredNews = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return newsList.filter((news) => {
      const matchesSearch =
        (news.title?.toLowerCase() || "").includes(query) ||
        (news.excerpt?.toLowerCase() || "").includes(query);

      const matchesCategory =
        selectedCategory === "TODAS" ||
        news.tag.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, newsList]);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#014635] flex items-center gap-3">
              <Newspaper className="w-8 h-8" /> Central de Notícias
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fatos e análises macroeconômicas do mercado em tempo real.
            </p>
          </div>

          {/* Barra de Busca */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notícias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#014635] focus:ring-1 focus:ring-[#014635] transition-all"
            />
          </div>
        </div>

        {/* Botões de Categoria */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-[#014635] text-white border-[#014635] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Notícias ou Estados de Loading / Vazio */}
        {loading ? (
          <div className="h-60 w-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#014635]" />
            <span className="text-sm font-medium">Sincronizando com o mercado financeiro...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="h-40 w-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 font-medium">
            Nenhuma notícia encontrada para os critérios selecionados.
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredNews.map((news) => (
                <motion.article
                  layout
                  key={news._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setNewsSelecionada(news)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group cursor-pointer select-none"
                >
                  {/* Imagem da Matéria */}
                  <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-gray-800 shadow-sm border border-white/50">
                      {news.tag}
                    </span>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5 flex flex-col flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {news.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#014635] transition-colors">
                      {news.title}
                    </h3>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                      {news.excerpt}
                    </p>

                    {/* O rodapé visual que indica o clique */}
                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#014635] group-hover:underline">
                      <span>Ler matéria completa</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 4. O Modal de exibição conectado com sucesso */}
      <NewsModal 
        news={newsSelecionada} 
        onClose={() => setNewsSelecionada(null)} 
      />
    </div>
  );
}