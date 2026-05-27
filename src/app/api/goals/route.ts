import { NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabaseServer";

async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Não autorizado");
  return user;
}

// 1. LISTAR METAS (GET)
export async function GET(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    const user = await getAuthenticatedUser(supabase);

    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const frontendGoals = goals?.map((goal) => ({
      id: goal.id,
      title: goal.title,
      targetAmount: goal.target_amount,   
      currentAmount: goal.current_amount, 
      deadline: goal.deadline,
      priority: goal.priority,
      created_at: goal.created_at
    }));

    return NextResponse.json(frontendGoals);
  } catch (error: any) {
    if (error.message === "Não autorizado") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Erro ao buscar metas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    const user = await getAuthenticatedUser(supabase);
    
    const body = await request.json();
    const { title, targetAmount, currentAmount, deadline, priority } = body;

    if (priority) {
      const { error: updateError } = await supabase
        .from("goals")
        .update({ priority: false })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    }

    const { data: newGoal, error } = await supabase
      .from("goals")
      .insert([
        {
          user_id: user.id,
          title,
          target_amount: targetAmount,
          current_amount: currentAmount || 0,
          deadline: deadline || null,
          priority: !!priority,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error: any) {
    if (error.message === "Não autorizado") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Erro ao criar meta" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    const user = await getAuthenticatedUser(supabase);
    
    const body = await request.json();
    const { id, addAmount } = body;

    if (!id || !addAmount) {
      return NextResponse.json({ erro: "ID e valor de aporte são necessários" }, { status: 400 });
    }

    const { data: goal, error: fetchError } = await supabase
      .from("goals")
      .select("current_amount")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !goal) {
      return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });
    }

    const newCurrentAmount = Number(goal.current_amount || 0) + Number(addAmount);

    const { data: updatedGoal, error: updateError } = await supabase
      .from("goals")
      .update({ current_amount: newCurrentAmount })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedGoal);
  } catch (error: any) {
    if (error.message === "Não autorizado") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Erro ao atualizar meta" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    const user = await getAuthenticatedUser(supabase);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ erro: "ID necessário" }, { status: 400 });
    }

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ msg: "Meta excluída" });
  } catch (error: any) {
    if (error.message === "Não autorizado") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Erro ao excluir meta" }, { status: 500 });
  }
}