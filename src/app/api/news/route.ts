import { NextResponse } from "next/server";
import { ALL_NEWS } from "@/data/news-data"; // Verifique se o caminho está certinho

export async function GET() {
  return NextResponse.json(ALL_NEWS);
}