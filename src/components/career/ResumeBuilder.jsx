import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';

export default function ResumeBuilder({ userEmail }) {
  const [template, setTemplate] = useState('modern');
  const [sections, setSections] = useState({
    summary: '',
    experience: [],
    education: [],
    skills: []
  });

  const downloadPDF = () => {
    // In real implementation, this would generate PDF
    alert('Generating PDF...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Resume Builder</span>
          </div>
          <Button onClick={downloadPDF} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Template</label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Professional Summary</label>
          <Textarea
            value={sections.summary}
            onChange={(e) => setSections({...sections, summary: e.target.value})}
            placeholder="Write a brief professional summary..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Experience</label>
          <Button variant="outline" size="sm">Add Experience</Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Education</label>
          <Button variant="outline" size="sm">Add Education</Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills</label>
          <Input placeholder="Add skills..." />
        </div>
      </CardContent>
    </Card>
  );
}