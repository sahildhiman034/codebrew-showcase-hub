import React from "react"
import { AdminNavigation } from "@/components/admin/AdminNavigation"
import UsersAdmin from "./UsersAdmin"

export default function AdminUsers() {
  return (
    <AdminNavigation>
      <UsersAdmin />
    </AdminNavigation>
  )
}