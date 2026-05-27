import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createServerComponentClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    const response = NextResponse.json(
      { msg: "Logout realizado com sucesso." },
      { status: 200 }
    );

    response.cookies.set("auth_token", "", { expires: new Date(0), path: "/" });

    return response;
  } catch (error) {
    console.error("Erro no logout:", error);
    return NextResponse.json(
      { erro: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}