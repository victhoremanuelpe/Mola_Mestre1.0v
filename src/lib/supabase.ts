import { createBrowserClient } from '@supabase/ssr'

// Cliente limpo para rodar no Frontend (Client Components)
export const createClientComponentClient = () => 
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )