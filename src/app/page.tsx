import { ssrFetch } from "@/lib/authFetch";
import HomeLanding from "@/components/HomeLanding";

export const dynamic = "force-dynamic";

interface HomeData {
  user: { email: string } | null;
}

export default async function HomePage() {
  const data = await ssrFetch<HomeData>("/api/home");
  const userEmail = data?.user?.email || null;

  return <HomeLanding initialUserEmail={userEmail} />;
}
