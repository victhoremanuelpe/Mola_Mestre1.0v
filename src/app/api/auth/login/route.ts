import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    // 1. Inicializa o cliente do Supabase configurado para o servidor
    const supabase = await createServerComponentClient();

    // 2. Recebe os dados vindos do frontend
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { erro: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // 3. Faz a autenticação diretamente no Supabase
    // O Supabase já valida o e-mail, descriptografa a senha com bcrypt internamente e verifica a conta
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha, // Mapeia 'senha' do front para 'password' do Supabase
    });

    // 4. Se houver erro nas credenciais (usuário não existe ou senha errada)
    if (error || !data.user) {
      return NextResponse.json(
        { erro: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    // Opcional: Pegar o nome do usuário armazenado nos metadados ou no profile
    const nomeUsuario = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || "Usuário";

    // 5. Monta a resposta exatamente como o seu frontend já espera receber
    const response = NextResponse.json({
      msg: "Login realizado com sucesso",
      usuario: { 
        id: data.user.id,        // ID do Supabase Auth (UUID)
        nome: nomeUsuario, 
        email: data.user.email 
      },
    });

    // NOTA: Você NÃO precisa mais fazer 'response.cookies.set("auth_token", ...)'.
    // A função 'createServerComponentClient' cuidou disso automaticamente através do middleware/cookies 
    // salvando os tokens do Supabase (access_token e refresh_token) de forma transparente.

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { erro: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}