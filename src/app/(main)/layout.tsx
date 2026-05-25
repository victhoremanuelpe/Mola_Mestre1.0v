import { Sidebar } from "@/components/Sidebar";
import React from "react";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabaseServer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Inicializa o cliente do servidor Supabase
  const supabase = await createServerComponentClient();
  
  // 2. Verifica a sessão do usuário de forma ultra rápida antes de renderizar o HTML
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Se por algum motivo o usuário burlar o middleware ou a sessão expirar, ejeta para o login
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sua Sidebar fixa na lateral esquerda */}
      <Sidebar />
      
      {/* O painel de conteúdo rolável do Dashboard, Ativos, Metas, etc. */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}