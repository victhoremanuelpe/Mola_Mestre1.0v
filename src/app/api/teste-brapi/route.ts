import { NextResponse } from "next/server";
import { fetchStocks } from "@/app/services/topstock"; // Ajuste o caminho se necessário

export async function GET() {
  try {
    // PETR4 é um ticker gratuito/teste na Brapi (como mostra a sua imagem)
    const dados = await fetchStocks(["PETR4"]);
    
    if (dados.length === 0) {
      return NextResponse.json({ erro: "Nenhum dado retornado. Verifique o Token." }, { status: 400 });
    }

    return NextResponse.json({ sucesso: true, dados });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}