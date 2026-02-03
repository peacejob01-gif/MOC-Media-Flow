import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Ingestion } from './components/Ingestion'; // ลบ .tsx ออกเพื่อให้เหมือนกับไฟล์อื่น
import { Kanban } from './components/Kanban';
import { Reporting } from './components/Reporting';
import { MediaItem } from './types';
// Import xlsx for export
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'moc_media_items';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('kanban');
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migratedItems = parsed.map((item: any) => ({
          ...item,
          suggestedMediaType: Array.isArray(item.suggestedMediaType) 
            ? item.suggestedMediaType 
            : [item.suggestedMediaType || 'Unknown']
        }));
        setItems(migratedItems);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const handleAddItem = (newItem: MediaItem) => {
    setItems(prev => [newItem, ...prev]);
    setCurrentView('kanban');
  };

  const handleUpdateItem = (updatedItem: MediaItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case 'ingestion':
        return <Ingestion onAddItem={handleAddItem} />;
      case 'kanban':
        return <Kanban items={items} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />;
      case 'reporting':
        return <Reporting items={items} />;
      default:
        return <Kanban items={items} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-blue-900">
                    {currentView === 'ingestion' && 'News Ingestion'}
                    {currentView === 'kanban' && 'Production Workflow'}
                    {currentView === 'reporting' && 'Archive & Reports'}
                </h1>
                <p className="text-slate-500 mt-1">Ministry of Commerce Media Management</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-slate-400 font-mono">
                    {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}
                </p>
            </div>
        </header>
        
        {renderView()}
      </main>
    </div>
  );
};

export default App;
