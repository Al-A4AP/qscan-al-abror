import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, QrCode, ClipboardList, LogOut, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const NAV_ITEMS = [
  { label: "Beranda", icon: LayoutDashboard, href: "/" },
  { label: "Scan", icon: QrCode, href: "/scanner" },
  { label: "Data", icon: ClipboardList, href: "/registry" },
];

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border flex justify-around items-center px-2 py-3 safe-area-bottom">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors group",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              isActive ? "bg-primary/10" : "group-hover:bg-muted"
            )}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
      
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center space-y-1 transition-colors group text-muted-foreground hover:text-primary"
      >
        <div className="p-2 rounded-xl transition-all group-hover:bg-muted">
          {theme === 'dark' ? <Sun size={24} strokeWidth={2} /> : <Moon size={24} strokeWidth={2} />}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Tema</span>
      </button>

      <button
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        className="flex flex-col items-center justify-center space-y-1 transition-colors group text-red-500/80 hover:text-red-600"
      >
        <div className="p-2 rounded-xl transition-all group-hover:bg-red-500/10">
          <LogOut size={24} strokeWidth={2} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Keluar</span>
      </button>
    </nav>
  );
}
