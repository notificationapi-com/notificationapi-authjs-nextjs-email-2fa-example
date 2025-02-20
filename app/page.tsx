import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1>Hello World</h1>

      <div className="mt-4">
        {session ? (
          <div>
            <p>Welcome, {session.user?.name || session.user?.email}</p>
            <Link
              href="/api/auth/signout"
              className="text-blue-500 hover:text-blue-700"
            >
              Sign Out
            </Link>
          </div>
        ) : (
          <Link
            href="/api/auth/signin"
            className="text-blue-500 hover:text-blue-700"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
