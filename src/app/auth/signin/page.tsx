import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getServerAuthSession } from "~/server/auth";

export default async function Signin({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const csrfToken =
    cookies().get("__Host-next-auth.csrf-token")?.value.split("|")[0] ||
    cookies().get("next-auth.csrf-token")?.value.split("|")[0];
  const session = await getServerAuthSession();

  if (session) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-sm rounded-lg shadow-lg">
        <CardHeader className="rounded-t-lg bg-blue-500 p-4 text-white">
          <CardTitle className="text-xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription className="text-sm text-gray-300">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>

        <form action="/api/auth/callback/credentials" method="POST">
          <CardContent className="space-y-4 p-4">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Usuario
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="p-4">
            <Button
              className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600"
              type="submit"
            >
              Iniciar Sesión
            </Button>
            {searchParams?.error && (
              <p className="mt-5 rounded-md bg-red-200 text-center text-sm font-semibold leading-6 text-red-600">
                Credenciales incorrectas
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
