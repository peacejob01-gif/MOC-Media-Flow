import React from 'react';
import { LayoutDashboard, FileText, Database, Settings, PenTool } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'ingestion', label: 'Ingestion (Stage 1)', icon: PenTool },
    { id: 'kanban', label: 'Workflow (Stage 2-3)', icon: LayoutDashboard },
    { id: 'reporting', label: 'Reporting (Stage 4)', icon: FileText },
  ];

  return (
    <div className="w-64 bg-moc-blue text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-10">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold tracking-wider">MOC Media</h1>
        <p className="text-xs text-blue-200 mt-1">Management System</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-moc-blue shadow-md font-medium' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-800 text-xs text-blue-300">
        <p>MOC System v1.0</p>
        <p>React + Gemini AI</p>
      </div>
    </div>
  );
};