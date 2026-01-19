"use client";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

type AdminUser = {
  id?: number | string;
  email?: string;
  username?: string;
  display_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  deleted_at?: string | null;
  date_joined?: string;
  last_login?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getStatusLabel = (user: AdminUser) => {
  if (user.deleted_at) return "deleted";
  if (user.is_active) return "active";
  return "inactive";
};

const hasValidId = (value: AdminUser["id"]) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") {
    if (value.trim() === "" || value.toLowerCase() === "undefined") return false;
    return true;
  }
  return false;
};

export default function AdminUsersTable({
  items,
  onDisable,
  onEnable,
  onDelete,
}: {
  items: AdminUser[];
  onDisable: (id: number | string) => void;
  onEnable: (id: number | string) => void;
  onDelete: (id: number | string) => void;
}) {
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.date_joined ? new Date(a.date_joined).getTime() : 0;
    const timeB = b.date_joined ? new Date(b.date_joined).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ts-text-main">Users</h2>
        <span className="text-xs text-ts-text-muted">
          {items.length} records
        </span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No users found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
              <tr>
                <th className="py-2 text-left font-medium">User</th>
                <th className="py-2 text-left font-medium">Email</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-left font-medium">Role</th>
                <th className="py-2 text-left font-medium">Joined</th>
                <th className="py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-border">
              {orderedItems.map((user, index) => (
                <tr key={user.id ?? index}>
                  <td className="py-3 pr-4">
                    {user.display_name || user.username || "—"}
                  </td>
                  <td className="py-3 pr-4">{user.email || "—"}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge value={getStatusLabel(user)} />
                  </td>
                  <td className="py-3 pr-4">
                    {user.is_superuser
                      ? "superuser"
                      : user.is_staff
                      ? "staff"
                      : "user"}
                  </td>
                  <td className="py-3 pr-4">{formatDate(user.date_joined)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (hasValidId(user.id)) onEnable(user.id);
                        }}
                        disabled={
                          !hasValidId(user.id) ||
                          user.is_active ||
                          !!user.deleted_at
                        }
                        className="bg-ts-success text-white hover:opacity-90"
                      >
                        Enable
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (hasValidId(user.id)) onDisable(user.id);
                        }}
                        disabled={
                          !hasValidId(user.id) ||
                          !user.is_active ||
                          !!user.deleted_at
                        }
                        className="bg-ts-warning text-black hover:opacity-90"
                      >
                        Disable
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (hasValidId(user.id)) onDelete(user.id);
                        }}
                        disabled={!hasValidId(user.id) || !!user.deleted_at}
                        className="bg-ts-danger text-white hover:opacity-90"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
