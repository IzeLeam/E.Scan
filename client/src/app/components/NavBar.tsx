import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/list", icon: "/list.png", alt: "List Icon" },
  { href: "#", icon: "/historic.png", alt: "dev" },
  { href: "/historic", icon: "/historic.png", alt: "Historic Icon" },
];

export default function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-evenly items-center py-3.5 relative">
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