import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Trash2, Copy, Archive } from 'lucide-react';

export default function BulkOperations({ items, type, onComplete }) {
  const [selected, setSelected] = useState([]);

  const handleSelectAll = () => {
    setSelected(selected.length === items.length ? [] : items.map(i => i.id));
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selected) {
        await base44.entities[type].delete(id);
      }
      toast.success(`Deleted ${selected.length} items`);
      setSelected([]);
      onComplete?.();
    } catch (error) {
      toast.error('Failed to delete items');
    }
  };

  const handleBulkArchive = async () => {
    try {
      for (const id of selected) {
        await base44.entities[type].update(id, { is_archived: true });
      }
      toast.success(`Archived ${selected.length} items`);
      setSelected([]);
      onComplete?.();
    } catch (error) {
      toast.error('Failed to archive items');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox checked={selected.length === items.length} onCheckedChange={handleSelectAll} />
            <span className="text-sm">Select All ({selected.length} selected)</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                checked={selected.includes(item.id)}
                onCheckedChange={(checked) => {
                  setSelected(checked 
                    ? [...selected, item.id] 
                    : selected.filter(id => id !== item.id)
                  );
                }}
              />
              <span className="text-sm">{item.title || item.name}</span>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="flex space-x-2">
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleBulkArchive} variant="outline" size="sm">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}