import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export async function GET() {
  try {
    const feed = await parser.parseURL("https://g1.globo.com/rss/g1/economia/");
    
    const newsList = feed.items.map((item, index) => {
      const imgRegex = /<img[^>]+src="([^">]+)"/;
      const match = item.content?.match(imgRegex);
      const fallbackImage = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
      
      return {
        _id: index + 1,
        title: item.title || "Sem título",
        excerpt: item.contentSnippet?.slice(0, 150) || "Clique para ler os detalhes da matéria completa.",
        content: item.contentSnippet || "Conteúdo indisponível no momento.",
        image: match ? match[1] : fallbackImage,
        time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Agora",
        readTime: "3 min",
        source: "G1 Economia",
        url: item.link || "https://g1.globo.com/economia/",
        tag: "MACRO", 
        sentiment: "neutral" 
      };
    });

    return NextResponse.json(newsList);
  } catch (error: any) {
    console.error("Erro ao buscar feed RSS de notícias:", error);
    return NextResponse.json(
      { error: "Falha ao sincronizar notícias com o servidor." },
      { status: 500 }
    );
  }
}