import { Link, useLocation } from "wouter";
import { Home, FileText, PlusCircle, ShieldCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/packets", label: "Packets", icon: FileText },
    { href: "/packets/new", label: "New", icon: PlusCircle, highlight: true },
    { href: "/verify", label: "Verify", icon: ShieldCheck },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 safe-area-bottom">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          if (item.highlight) {
            return (
              <div key={item.href} className="flex justify-center -mt-6">
                <Link href={item.href} className="group flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] mt-1 text-primary font-semibold">{item.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-primary/20")} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
