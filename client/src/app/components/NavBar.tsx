import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/list", icon: "/list.png", alt: "List Icon" },
  { href: "/historic", icon: "/historic.png", alt: "Historic Icon" },
];

export default function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-xl z-50">
      <div className="flex justify-between mx-7 items-center px-6 py-3.5 relative">
        {NAV_ITEMS.map((item, index) => (
          <Link key={index} href={item.href}>
            <Image
              src={item.icon}
              alt={item.alt}
              width={512}
              height={512}
              className="w-7 h-7"
            />
          </Link>
        ))}
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
      </div>
    </nav>
  );
}