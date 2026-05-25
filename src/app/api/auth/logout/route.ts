import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    // 1. Inicializa o cliente do servidor Supabase
    const supabase = await createServerComponentClient();

    // 2. Encerra a sessão no servidor e invalida o token
    // O Supabase remove automaticamente os cookies 'sb-...' relacionados à autenticação
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // 3. Cria a resposta padrão para o seu Frontend
    const response = NextResponse.json(
      { msg: "Logout realizado com sucesso." },
      { status: 200 }
    );

    // 4. Limpeza preventiva do cookie antigo (OPCIONAL)
    // Se você ainda tiver usuários antigos com o cookie "auth_token" do MongoDB gravado no navegador, 
    // deixar a linha abaixo garante que esse resquício antigo seja limpo definitivamente.
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