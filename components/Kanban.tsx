import React, { useState } from 'react';
import { MediaItem, Status } from '../types';
import { MoreHorizontal, MessageSquare, ExternalLink, X, CheckCircle, Clock, AlertTriangle, Trash2, Check } from 'lucide-react';

interface KanbanProps {
  items: MediaItem[];
  onUpdateItem: (item: MediaItem) => void;
  onDeleteItem: (id: string) => void;
}

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'Backlog', label: 'Backlog', color: 'border-slate-300' },
  { id: 'In Production', label: 'In Production', color: 'border-blue-400' },
  { id: 'Reviewing', label: 'Reviewing', color: 'border-yellow-400' },
  { id: 'Approved', label: 'Approved', color: 'border-green-400' },
];

const MEDIA_TYPES = ['Infographic', 'Banner', 'Photo Album', 'Video'];

export const Kanban: React.FC<KanbanProps> = ({ items, onUpdateItem, onDeleteItem }) => {
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    headline: string;
    source: 'modal' | 'card';
  }>({ isOpen: false, id: '', headline: '', source: 'card' });

  const getPriorityColor = (p: number) => {
    if (p >= 8) return 'bg-red-100 text-red-700 border-red-200';
    if (p >= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const initiateDelete = (e: React.MouseEvent, id: string, headline: string, source: 'modal' | 'card') => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmation({
        isOpen: true,
        id,
        headline,
        source
    });
  };

  const confirmDelete = () => {
    onDeleteItem(deleteConfirmation.id);
    if (deleteConfirmation.source === 'modal') {
        setEditingItem(null);
    }
    setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const toggleMediaType = (type: string) => {
    if (!editingItem) return;
    
    const current = editingItem.suggestedMediaType || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
      
    setEditingItem({ ...editingItem, suggestedMediaType: updated });
  };

  return (
    <div className="h-full overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max h-full">
        {COLUMNS.map((col) => {
          const colItems = items.filter(i => i.status === col.id);
          return (
            <div key={col.id} className="w-80 flex flex-col h-full rounded-xl bg-slate-50 border border-slate-200">
              <div className={`p-4 border-b-4 ${col.color} bg-white rounded-t-xl sticky top-0 z-10 shadow-sm`}>
                <h3 className="font-bold text-slate-700 flex justify-between items-center">
                  {col.label}
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {colItems.length}
                  </span>
                </h3>
              </div>
              
              <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {colItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group relative"
                    onClick={() => setEditingItem(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                            P{item.priority}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.pillar}</span>
                      </div>
                      
                      {/* Quick Delete for Backlog items */}
                      {item.status === 'Backlog' && (
                        <button
                            onClick={(e) => initiateDelete(e, item.id, item.headline, 'card')}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete from Backlog"
                        >
                            <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 leading-snug">
                      {item.headline}
                    </h4>

                    {/* Media Type Tags on Card */}
                    {item.suggestedMediaType && item.suggestedMediaType.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {item.suggestedMediaType.slice(0, 2).map((type, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                    {type}
                                </span>
                            ))}
                            {item.suggestedMediaType.length > 2 && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                    +{item.suggestedMediaType.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-moc-blue text-white text-xs flex items-center justify-center font-bold">
                            {item.assignee.charAt(0).toUpperCase()}
                         </div>
                         <span className="text-xs text-slate-500 truncate max-w-[80px]">{item.assignee}</span>
                      </div>
                      <MoreHorizontal size={16} className="text-slate-400 group-hover:text-moc-blue" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-slate-800">Card Details</h3>
                    <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-1">Headline</label>
                        <input 
                            type="text" 
                            className="w-full text-lg font-bold text-slate-800 border-b border-slate-200 pb-1 focus:border-moc-blue outline-none"
                            value={editingItem.headline}
                            onChange={(e) => setEditingItem({...editingItem, headline: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-1 flex justify-between">
                            Original Source
                            <span className="text-xs font-normal text-slate-400">Read-only reference</span>
                        </label>
                         <textarea 
                            readOnly
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 resize-none focus:outline-none font-mono"
                            value={editingItem.rawContent || 'No content available.'}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-500 mb-1">Status</label>
                            <select 
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm"
                                value={editingItem.status}
                                onChange={(e) => setEditingItem({...editingItem, status: e.target.value as Status})}
                            >
                                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-500 mb-1">Assignee</label>
                            <input 
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm"
                                value={editingItem.assignee}
                                onChange={(e) => setEditingItem({...editingItem, assignee: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-2">Media Type (Select multiple)</label>
                        <div className="flex flex-wrap gap-2">
                            {MEDIA_TYPES.map(type => {
                                const isSelected = editingItem.suggestedMediaType?.includes(type);
                                return (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => toggleMediaType(type)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                                            isSelected 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {isSelected && <Check size={14} />}
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-1">Feedback / Comments</label>
                        <textarea 
                            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded text-sm"
                            value={editingItem.feedback || ''}
                            onChange={(e) => setEditingItem({...editingItem, feedback: e.target.value})}
                            placeholder="Add editorial feedback here..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-1">Live Link</label>
                        <div className="flex gap-2">
                             <input 
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-sm"
                                value={editingItem.liveLink || ''}
                                onChange={(e) => setEditingItem({...editingItem, liveLink: e.target.value})}
                                placeholder="https://..."
                            />
                            {editingItem.liveLink && (
                                <a href={editingItem.liveLink} target="_blank" rel="noreferrer" className="p-2 text-moc-blue hover:bg-blue-50 rounded">
                                    <ExternalLink size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-xl">
                    <button
                        type="button"
                        onClick={(e) => initiateDelete(e, editingItem.id, editingItem.headline, 'modal')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-100"
                    >
                        <Trash2 size={18} />
                        Delete Card
                    </button>
                    
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                onUpdateItem(editingItem);
                                setEditingItem(null);
                            }}
                            className="px-6 py-2 bg-moc-blue text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-100 scale-100 opacity-100 transition-all">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <Trash2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Delete Item?</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteConfirmation.headline}"</span>?
                            <br/>This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-4">
                        <button
                            onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:scale-[1.02]"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};