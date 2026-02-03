import React from 'react';
import { MediaItem } from '../types';
import * as XLSX from 'xlsx';
import { Download, Table, Filter, ExternalLink } from 'lucide-react';

interface ReportingProps {
  items: MediaItem[];
}

export const Reporting: React.FC<ReportingProps> = ({ items }) => {
  // Only show items that are at least "Approved" for the final report, or show all for tracking?
  // Let's show all but highlight Published.
  const [filter, setFilter] = React.useState<'All' | 'Approved'>('All');

  const filteredItems = items.filter(i => filter === 'All' || i.status === 'Approved');

  const handleExport = () => {
    // Format data for TOR requirements (Day 80, 160, 240 style check)
    const exportData = filteredItems.map(item => ({
      'ID': item.id.substring(0, 8),
      'Date': item.date,
      'Headline': item.headline,
      'Pillar': item.pillar,
      'Priority': item.priority,
      'Assignee': item.assignee,
      'Status': item.status,
      'Media Type': Array.isArray(item.suggestedMediaType) ? item.suggestedMediaType.join(', ') : item.suggestedMediaType,
      'Live Link': item.liveLink || 'N/A',
      'Feedback': item.feedback || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MOC_Media_Report");
    XLSX.writeFile(wb, `MOC_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Archive & Reporting</h2>
           <p className="text-slate-500 text-sm">Export performance data for TOR periods.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition-colors"
        >
          <Download size={18} />
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
             <button 
                onClick={() => setFilter('All')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'All' ? 'bg-moc-blue text-white' : 'text-slate-600 hover:bg-slate-200'}`}
             >
                All Items
             </button>
             <button 
                onClick={() => setFilter('Approved')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'Approved' ? 'bg-moc-blue text-white' : 'text-slate-600 hover:bg-slate-200'}`}
             >
                Approved & Published Only
             </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Headline</th>
                        <th className="px-6 py-3">Pillar</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Assignee</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Link</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">No records found.</td>
                        </tr>
                    ) : (
                        filteredItems.map((item) => (
                            <tr key={item.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{item.date}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">{item.headline}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        item.pillar === 'Trust' ? 'bg-indigo-100 text-indigo-700' :
                                        item.pillar === 'Policy' ? 'bg-purple-100 text-purple-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {item.pillar}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {Array.isArray(item.suggestedMediaType) 
                                        ? item.suggestedMediaType.join(', ') 
                                        : item.suggestedMediaType
                                    }
                                </td>
                                <td className="px-6 py-4">{item.assignee}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs border ${
                                        item.status === 'Approved' ? 'border-green-200 bg-green-50 text-green-700' :
                                        item.status === 'Reviewing' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                        'border-slate-200 bg-slate-50 text-slate-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.liveLink ? (
                                        <a href={item.liveLink} target="_blank" rel="noreferrer" className="text-moc-blue hover:underline flex items-center gap-1">
                                            Link <ExternalLink size={12} />
                                        </a>
                                    ) : <span className="text-slate-400">-</span>}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};