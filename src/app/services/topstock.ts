import axios from "axios";
import { Stock } from "@/types/actives";

export async function fetchStocks(symbols: string[]): Promise<Stock[]> {
  const token = process.env.NEXT_PUBLIC_BRAPI_TOKEN;

  if (!token) {
    console.warn("Aviso: NEXT_PUBLIC_BRAPI_TOKEN não configurado.");
    return [];
  }

  if (!symbols || symbols.length === 0) return [];

  // Formata os símbolos tirando espaços e deixando em maiúsculo (Ex: "PETR4,VALE3")
  const formattedSymbols = symbols.map(s => s.trim().toUpperCase()).join(",");

  // URL configurada de acordo com as opções marcadas na imagem do painel da Brapi
  const url = `https://brapi.dev/api/quote/${formattedSymbols}?fundamental=true&dividends=true&token=${token}`;

  try {
    const { data } = await axios.get(url);
    return data.results || [];
  } catch (error: any) {
    console.error("Erro ao buscar ações na brApi:", error?.response?.data || error.message);
    return [];
  }
}