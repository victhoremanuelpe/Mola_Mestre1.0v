import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { ALL_NEWS } from "@/data/news-data"; 
const parser = new Parser();

export async function GET() {
  try {
    const feed = await parser.parseURL("https://g1.globo.com/rss/g1/economia/");
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json(ALL_NEWS);
    }

    const formattedNews = feed.items.slice(0, 12).map((item: any, index: number) => {
      const titleUpper = item.title?.toUpperCase() || "";
      
      let tag = "MACRO";
      if (titleUpper.includes("DÓLAR") || titleUpper.includes("CAMBIO") || titleUpper.includes("MOEDA")) tag = "MERCADO";
      if (titleUpper.includes("BOLSA") || titleUpper.includes("AÇÃO") || titleUpper.includes("IBOVESPA")) tag = "AÇÕES";
      if (titleUpper.includes("BITCOIN") || titleUpper.includes("CRIPTO")) tag = "CRIPTO";
      if (titleUpper.includes("IMÓVEL") || titleUpper.includes("ALUGUEL")) tag = "FIIS";

      const cleanSummary = item.contentSnippet 
        ? item.contentSnippet.replace(/<[^>]*>/g, "").trim()
        : "Clique para ler os detalhes da matéria completa.";

      let imageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800";
      if (item.content && item.content.includes("src=")) {
        const match = item.content.match(/src="([^"]+)"/);
        if (match && match[1]) imageUrl = match[1];
      }

      return {
        _id: index + 1,
        tag: tag,
        title: item.title,
        excerpt: cleanSummary,
        content: cleanSummary,
        image: imageUrl,
        url: item.link || "https://g1.globo.com/economia/",
        time: item.pubDate 
          ? new Date(item.pubDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          : "Agora",
        readTime: "3 min",
        sentiment: "neutral",
        source: "G1 Economia"
      };
    });

    return NextResponse.json(formattedNews);

  } catch (error) {
    console.error("Erro ao buscar RSS do G1, usando backup local:", error);
    return NextResponse.json(ALL_NEWS);
  }
}