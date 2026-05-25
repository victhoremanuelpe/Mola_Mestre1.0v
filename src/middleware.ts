import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. Cria uma resposta inicial que usaremos para injetar os cookies atualizados
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Inicializa o cliente do Supabase estritamente configurado para o Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies tanto na requisição quanto na resposta
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Recupera o usuário atual e atualiza a sessão (Refresh Token) automaticamente
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Se o usuário está logado e tenta ir para Login/Register -> Dashboard
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Regra da página raiz "/"
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Se NÃO está logado e tenta acessar qualquer página interna -> Login
  if (!user && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Retorna a resposta com os cookies atualizados caso o token tenha sido renovado
  return response;
}

// O matcher continua idêntico, ignorando arquivos estáticos e rotas de API internas
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};