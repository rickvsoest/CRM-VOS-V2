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
    { id: "dashboard",  label: "Dashboard",     icon: Home,          roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "pipeline",   label: "Pipeline",      icon: ClipboardList, roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "customers",  label: "Klanten",       icon: Users,         roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "documents",  label: "Documenten",    icon: FileText,      roles: ["BEHEERDER", "MEDEWERKER", "KLANT"] },
    { id: "tasks",      label: "Taken",         icon: ClipboardList, roles: ["BEHEERDER", "MEDEWERKER"] },
    { id: "settings",   label: "Instellingen",  icon: Settings,      roles: ["BEHEERDER", "MEDEWERKER", "KLANT"] },
  ];
  const visibleLinks = links.filter((l) => l.roles.includes(userRole));

  const initials = userName?.trim()?.[0]?.toUpperCase() ?? "U";

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r flex flex-col"
           style={{ borderColor: "var(--border)" }}>
      {/* Logo / brand */}
      <div className="h-16 px-4 flex items-center">
        <div className="leading-tight">
          <div className="font-serif text-lg">Van Soest</div>
          <div className="text-[10px] tracking-wider text-neutral-500 -mt-0.5">Office Support</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleLinks.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              className={[
                "mx-2 my-1 w-[calc(100%-1rem)]",                 // lichte horizontale marge
                "flex items-center gap-3 px-3 py-2 rounded-2xl",  // pill
                "transition-colors",
                active
                  ? "bg-[var(--accent,#3b82f6)] text-white shadow-sm"
                  : "text-neutral-800 hover:bg-neutral-100"
              ].join(" ")}
              title={label}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={1.75}
                // iconkleur volgt tekstkleur; iets subtieler als inactief
                style={{ opacity: active ? 1 : 0.9 }}
              />
              <span className={active ? "font-medium" : "font-normal"}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User-card + uitloggen */}
      <div className="p-3">
        <div className="rounded-2xl bg-neutral-50 px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--accent,#3b82f6)] text-white grid place-content-center text-sm font-semibold">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-[13px] text-neutral-900">{userName || "Gebruiker"}</div>
              <div className="text-[10px] tracking-wide text-neutral-500">{userRole || "ROL"}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md hover:bg-neutral-200/70 text-neutral-700 transition-colors"
            title="Uitloggen"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
