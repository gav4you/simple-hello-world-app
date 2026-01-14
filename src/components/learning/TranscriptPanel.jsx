import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import { scopedFilter, buildCacheKey } from '@/components/api/scoped';
import { shouldFetchMaterials } from '@/components/materials/materialsEngine';
import { useSession } from '@/components/hooks/useSession';

export default function TranscriptPanel({ lesson, accessLevel = 'FULL', maxPreviewChars = 1500 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { activeSchoolId } = useSession();

  const canFetch = useMemo(() => {
    return !!lesson?.id && shouldFetchMaterials(accessLevel);
  }, [lesson?.id, accessLevel]);

  const schoolId = lesson?.school_id || activeSchoolId;

  const { data: transcripts = [] } = useQuery({
    queryKey: buildCacheKey('transcript', schoolId, lesson?.id),
    queryFn: () => scopedFilter('Transcript', schoolId, { lesson_id: lesson.id }),
    enabled: canFetch && !!schoolId,
    staleTime: 60_000,
  });

  const transcript = transcripts?.[0] || null;

  const displayText = useMemo(() => {
    const raw = transcript?.text || '';
    if (!raw) return raw;
    if (accessLevel === 'PREVIEW' && maxPreviewChars && raw.length > maxPreviewChars) {
      return raw.slice(0, maxPreviewChars) + '…';
    }
    return raw;
  }, [transcript?.text, accessLevel, maxPreviewChars]);

  const highlightText = (text) => {
    if (!searchQuery || !text) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200">{part}</mark>
      ) : (
        part
      )
    );
  };

  const locked = !!lesson?.id && !shouldFetchMaterials(accessLevel);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Transcript
        </CardTitle>
      </CardHeader>
      <CardContent>
        {locked ? (
          <p className="text-sm text-slate-600">
            Transcript is locked for this lesson.
          </p>
        ) : !transcript ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No transcript available
          </p>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcript..."
                className="pl-10"
              />
            </div>

            {accessLevel === 'PREVIEW' ? (
              <p className="text-xs text-slate-500">
                Preview transcript (truncated).
              </p>
            ) : null}

            <div className="max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {highlightText(displayText)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
