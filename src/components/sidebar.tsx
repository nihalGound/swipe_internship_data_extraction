"use client"

import { FileText, Package, Users, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: "invoices" | "products" | "customers"
  onTabChange: (tab: "invoices" | "products" | "customers") => void
  onUploadClick: () => void
}

export function Sidebar({ activeTab, onTabChange, onUploadClick }: SidebarProps) {
  const tabs = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
  ] as const

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Extraction Hub</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <Button onClick={onUploadClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2">
          <UploadCloud className="w-4 h-4" />
          Upload Files
        </Button>
      </div>
    </aside>
  )
}
