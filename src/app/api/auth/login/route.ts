import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {                                
    const supabase = await createServerComponentClient();

    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { erro: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha, 
    });

    if (error || !data.user) {
      return NextResponse.json(
        { erro: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const nomeUsuario = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || "Usuário";

    const response = NextResponse.json({
      msg: "Login realizado com sucesso",
      usuario: { 
        id: data.user.id,        
        nome: nomeUsuario, 
        email: data.user.email 
      },
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { erro: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}