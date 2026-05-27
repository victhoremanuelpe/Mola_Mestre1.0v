import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";
import { registerSchema } from "@/lib/schemas/register";

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient();

    const body = await request.json();

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      return NextResponse.json({ erro: errorMessage }, { status: 400 });
    }

    const { nome, email, senha } = validation.data;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          full_name: nome,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.status === 422) {
        return NextResponse.json(
          { erro: "Este e-mail já está em uso." },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { erro: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { msg: "Usuário cadastrado com sucesso!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { erro: "Ocorreu um erro no servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}