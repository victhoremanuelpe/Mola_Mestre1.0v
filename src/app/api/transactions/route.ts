import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Não autorizado");
  return user;
}

export async function GET() {
  try {
    const supabase = await createServerComponentClient();
    const user = await getAuthenticatedUser(supabase);

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false });

    if (error) throw error;

    return NextResponse.json(transactions);
  } catch (error: any) {
    if (error.message === "Não autorizado") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json(
      { erro: "Erro ao buscar transações" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    const user = await getAuthenticatedUser(supabase);
    
    const body = await request.json();
    const { ticker, tipo, quantidade, preco, data } = body;

    if (!ticker || !tipo || !quantidade || !preco) {
      return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
    }

    const qtdNumber = Number(quantidade);

    if (tipo === "VENDA") {
      const { data: historicoAtivo, error: fetchError } = await supabase
        .from("transactions")
        .select("tipo, quantidade")
        .eq("user_id", user.id)
        .eq("ticker", ticker);

      if (fetchError) throw fetchError;

      const saldoAtual = (historicoAtivo || []).reduce((acc, tx) => {
        if (tx.tipo === "COMPRA") return acc + Number(tx.quantidade);
        if (tx.tipo === "VENDA") return acc - Number(tx.quantidade);
        return acc;
      }, 0);

      if (qtdNumber > saldoAtual) {
        return NextResponse.json(
          {
            erro: `Saldo insuficiente. Você possui ${saldoAtual} ações de ${ticker}, mas tentou vender ${qtdNumber}.`,
          },
          { status: 400 }
        );
      }
    }

    const { data: newTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          ticker,
          tipo,
          quantidade: qtdNumber,
          preco: Number(preco),
          data: data || new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(
      { msg: "Lançamento adicionado!", transaction: newTransaction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro na transação:", error);
    if (error.message === "Não autorizado") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json(
      { erro: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}