import { Home, Users, FileText, Settings, LogOut, ClipboardList } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: string;
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, userRole, userName, onLogout }: SidebarProps) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: Home, roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "pipeline", label: "Pipeline", icon: ClipboardList, roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "customers", label: "Klanten", icon: Users, roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "documents", label: "Documenten", icon: FileText, roles: ["BEHEERDER", "MEDEWERKER", "KLANT"] },
    { id: "tasks", label: "Taken", icon: ClipboardList, roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "settings", label: "Instellingen", icon: Settings, roles: ["BEHEERDER", "MEDEWERKER", "KLANT"] },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(userRole));

  return (
    <aside
      className="w-60 h-full border-r flex flex-col justify-between bg-background"
      style={{ borderColor: "var(--border)" }}
    >
      <div>
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-lg font-semibold">{userName}</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition 
                ${active ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t p-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted transition"
        >
          <LogOut className="w-4 h-4" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
