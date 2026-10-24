import Link from "next/link";
import { Screen } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen title="PFC" back="/">
      <div className="px-6 py-16 text-center">
        <p className="font-serif text-3xl text-navy">That page is not on the map.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
          Back home
        </Link>
      </div>
    </Screen>
  );
}
