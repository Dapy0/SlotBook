import { Header } from "@/components/layout/Header";
import { getCountries, getCountryByIp } from "@/services/geo";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const saved = cookieStore.get("_sb_country")?.value;

  const [countries, detected] = await Promise.all([
    getCountries(),
    saved ? Promise.resolve(saved) : getCountryByIp(),
  ]);
  const country =
    detected && countries.some((c) => c.country === detected) ? detected : "PL";

  return (
    <div className="flex h-dvh flex-col">
      <Header
        countries={countries}
        country={country}

        navBtns={[
          { variant: "ghost", linkHref: "/venues", value: "Venues" },
          { variant: "ghost", linkHref: "/categories", value: "Categories" },
        ]}
        rightBtns={[
          { variant: "ghost", linkHref: "/login", value: "Log in" },
          { variant: "default", linkHref: "/register", value: "Sign up" },
        ]}
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
