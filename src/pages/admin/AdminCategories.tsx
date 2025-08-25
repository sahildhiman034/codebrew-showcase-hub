import React from "react"
import { AdminNavigation } from "@/components/admin/AdminNavigation"
import CategoriesAdmin from "./CategoriesAdmin"

export default function AdminCategories() {
  return (
    <AdminNavigation>
      <CategoriesAdmin />
    </AdminNavigation>
  )
}