import { redirect } from "next/navigation";
import { getSessionUser, roleHome } from "@/lib/session";
import SignupForm from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const user = await getSessionUser();
  if (user) redirect(roleHome(user.role));

  const params = await searchParams;
  const roleParam = String(params.role ?? "").toLowerCase();
  const initialRole = roleParam === "employer" ? "EMPLOYER" : "WORKER";

  return <SignupForm initialRole={initialRole} />;
}
