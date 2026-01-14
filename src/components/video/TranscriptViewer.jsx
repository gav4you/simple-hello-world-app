import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TranscriptViewer({ transcript, onSeek }) {
  const [search, setSearch] = useState('');

  const filteredTimestamps = transcript?.timestamps?.filter(t =>
    t.text.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Transcript</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcript..."
            className="pl-10"
          />
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {(search ? filteredTimestamps : transcript?.timestamps || []).map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSeek?.(item.time)}
              className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs text-slate-500 mr-2">
                {Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-sm text-slate-700">{item.text}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}