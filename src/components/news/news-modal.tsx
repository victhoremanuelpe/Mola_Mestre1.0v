"use client";

import { Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { NewsItem } from "@/types/news";

interface NewsModalProps {
  news: NewsItem | null;
  onClose: () => void;
}

export function NewsModal({ news, onClose }: NewsModalProps) {
  return (
    <Dialog open={!!news} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden outline-none border-none [&>button]:cursor-pointer">
        {news && (
          <>
            {/* Cabeçalho do Modal */}
            <div className="bg-[#014635] p-6 text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
              <div className="relative z-10">
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                    {news.tag}
                  </Badge>
                  <Badge
                    className={`border-none ${
                      news.sentiment === "positive"
                        ? "bg-emerald-500"
                        : news.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {news.sentiment === "positive"
                      ? "OTIMISTA"
                      : news.sentiment === "negative"
                      ? "PESSIMISTA"
                      : "NEUTRO"}
                  </Badge>
                </div>
                <DialogTitle className="text-xl md:text-2xl font-bold leading-tight">
                  {news.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2 text-emerald-100 text-sm">
                  <Clock className="w-4 h-4" /> {news.time} • {news.readTime || "3 min"} de leitura
                </div>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
              <DialogDescription className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {news.content || news.excerpt}
                {"\n\n(Você pode ler a cobertura completa e atualizações desta matéria clicando no botão abaixo)."}
              </DialogDescription>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 italic">
                  Isenção de responsabilidade: As informações contidas nesta
                  notícia são de caráter meramente informativo e não constituem
                  recomendação de investimento.
                </p>
              </div>
            </div>

            {/* Rodapé com Ações */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0 z-10">
              {/* Link externo para o G1 Economia */}
              {news.url ? (
                <a 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-[#014635] hover:bg-[#00332a] text-white flex items-center gap-2 cursor-pointer text-xs md:text-sm">
                    Ler no G1 Economia
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              ) : (
                <div />
              )}

              <Button variant="outline" onClick={onClose} className="cursor-pointer text-xs md:text-sm">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}