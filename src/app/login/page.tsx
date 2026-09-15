import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return <LoginForm next={nextPath} usingDefaultPassword={!process.env.ADMIN_PASSWORD} />;
}
