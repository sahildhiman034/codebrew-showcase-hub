import React from "react"
import { AdminNavigation } from "@/components/admin/AdminNavigation"
import ClientsAdmin from "./ClientsAdmin"

export default function AdminClients() {
  return (
    <AdminNavigation>
      <ClientsAdmin />
    </AdminNavigation>
  )
}