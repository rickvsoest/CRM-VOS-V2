import { useState, useMemo } from "react";
import { Bell, Trash2, Check } from "lucide-react";

export type NotificationType = "NEW_CUSTOMER" | "TASK_DUE" | "DOC_UPLOADED" | "INFO";

export type Notification = {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  createdAt?: string;
  read?: boolean;
};

type Props = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onNotificationClick?: (n: Notification) => void;
};

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
}: Props) {
  const [open, setOpen] = useState(false);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-md border hover:bg-muted transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaties openen"
        title="Notificaties"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[360px] max-h-[60vh] overflow-auto rounded-lg border shadow-lg bg-background z-50"
          role="dialog"
          aria-label="Notificaties"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-medium">Notificaties</div>
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllAsRead}
                className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-muted"
                title="Markeer alles als gelezen"
              >
                <Check className="w-4 h-4" />
                Alles gelezen
              </button>
            </div>
          </div>

          <ul className="divide-y">
            {notifications.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">Geen notificaties.</li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className="p-3 hover:bg-muted/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onNotificationClick?.(n)}
                  >
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                    {n.createdAt && (
                      <div className="mt-1 text-[11px] opacity-60">{n.createdAt}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <button
                        className="text-xs px-2 py-1 rounded border hover:bg-muted"
                        onClick={() => onMarkAsRead(n.id)}
                        title="Markeer als gelezen"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="text-xs px-2 py-1 rounded border hover:bg-muted"
                      onClick={() => onDelete(n.id)}
                      title="Verwijder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
