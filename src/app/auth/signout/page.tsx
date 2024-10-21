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
import { getServerAuthSession } from "~/server/auth";

export default async function Signout() {
  const csrfToken =
    cookies().get("__Host-next-auth.csrf-token")?.value.split("|")[0] ||
    cookies().get("next-auth.csrf-token")?.value.split("|")[0];
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-blue-100">
      <Card className="mx-auto w-full max-w-sm rounded-lg shadow-lg">
        <CardHeader className="space-y-1 rounded-t-lg bg-blue-500 p-4">
          <CardTitle className="text-2xl font-bold text-white">
            Cerrar sesión
          </CardTitle>
          <CardDescription className="text-gray-200">
            ¿Estás seguro de que quieres cerrar sesión?
          </CardDescription>
        </CardHeader>

        <form action="/api/auth/signout" method="POST" className="space-y-6">
          <CardContent className="">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          </CardContent>
          <CardFooter className="">
            <Button
              className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600"
              type="submit"
            >
              Cerrar sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
