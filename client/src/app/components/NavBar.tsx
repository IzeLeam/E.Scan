// components/BottomNavbar.tsx
import Image from "next/image";
import Link from "next/link";

export default function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-xl z-50">
    <div className="flex justify-between items-center px-6 py-3.5 relative">
        <Link href="/scanner" className="">
            <Image
            src="/progress.png"
            alt="Progress Icon"
            width={512}
            height={512}
            className="w-7 h-7"
            />
        </Link>
        <Link href="/list" className="">
            <Image
            src="/list.png"
            alt="List Icon"
            width={512}
            height={512}
            className="w-7 h-7"
            />
        </Link>

        <div className=""/>
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4 bg-white rounded-full p-2 shadow-md">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
          </Link>
        </div>

        {/* Right Links */}
        <Link href="/historic" className="">
            <Image
                src="/historic.png"
                alt="Settings Icon"
                width={512}
                height={512}
                className="w-7 h-7"
            />
        </Link>
        <Link href="/settings" className="">
            <Image
                src="/account.png"
                alt="Account Icon"
                width={512}
                height={512}
                className="w-7 h-7"
            />
        </Link>
      </div>
    </nav>
  );
}
