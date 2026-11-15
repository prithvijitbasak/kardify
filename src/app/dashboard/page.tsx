import { redirect } from "next/navigation";
import { ssrFetch } from "@/lib/authFetch";
import { List } from "@/types";
import DashboardBoard from "@/components/DashboardBoard";

export const dynamic = "force-dynamic";

interface DashboardData {
  user: { email: string };
  lists: List[];
}

export default async function DashboardPage() {
  const data = await ssrFetch<DashboardData>("/api/dashboard", {
    requireAuth: true,
  });

  if (!data?.user) {
    redirect("/");
  }

  return (
    <DashboardBoard
      initialLists={data.lists || []}
      userEmail={data.user.email}
    />
  );
}
