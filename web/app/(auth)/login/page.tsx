import { redirect } from "next/navigation";
import { getSessionUser, roleHome } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(roleHome(user.role));
  return <LoginForm />;
}
