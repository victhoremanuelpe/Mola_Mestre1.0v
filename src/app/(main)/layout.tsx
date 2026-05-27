import { Sidebar } from "@/components/Sidebar";
import React from "react";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabaseServer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const supabase = await createServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();

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