import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LanguageSelector() {
  const languages = [
    {
      id: 'biblical_hebrew',
      name: 'Biblical Hebrew',
      nameHebrew: 'עברית מקראית',
      description: 'Language of Tanakh and Torah',
      color: 'from-blue-600 to-cyan-600',
      icon: '📜'
    },
    {
      id: 'torah_hebrew',
      name: 'Torah Hebrew',
      nameHebrew: 'עברית תורנית',
      description: 'Classical Torah commentary language',
      color: 'from-purple-600 to-pink-600',
      icon: '📖'
    },
    {
      id: 'talmud_bavli',
      name: 'Talmud Bavli',
      nameHebrew: 'תלמוד בבלי',
      description: 'Babylonian Talmud Aramaic-Hebrew',
      color: 'from-amber-600 to-orange-600',
      icon: '📚'
    },
    {
      id: 'modern_hebrew',
      name: 'Modern Hebrew',
      nameHebrew: 'עברית חדשה',
      description: 'Contemporary Israeli Hebrew',
      color: 'from-green-600 to-emerald-600',
      icon: '🗣️'
    },
    {
      id: 'aramaic',
      name: 'Aramaic',
      nameHebrew: 'ארמית',
      description: 'Ancient Semitic language',
      color: 'from-red-600 to-rose-600',
      icon: '🏛️'
    },
    {
      id: 'yiddish',
      name: 'Yiddish',
      nameHebrew: 'אידיש',
      description: 'Historic Jewish language',
      color: 'from-indigo-600 to-blue-600',
      icon: '🎭'
    },
    {
      id: 'ancient_hebrew',
      name: 'Ancient Hebrew',
      nameHebrew: 'עברית עתיקה',
      description: 'Pre-biblical Hebrew',
      color: 'from-slate-600 to-gray-700',
      icon: '⚱️'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {languages.map((lang) => (
        <Link key={lang.id} to={createPageUrl(`LanguageLearning?lang=${lang.id}`)}>
          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${lang.color}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{lang.icon}</div>
                <Badge className={`bg-gradient-to-r ${lang.color} text-white border-0`}>
                  Start Learning
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {lang.name}
              </h3>
              <p className="text-amber-700 font-semibold mb-3" dir="rtl">
                {lang.nameHebrew}
              </p>
              <p className="text-slate-600 text-sm">
                {lang.description}
              </p>

              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-slate-500">
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Multiple lessons
                </span>
                <span className="flex items-center">
                  <Languages className="w-4 h-4 mr-1" />
                  All levels
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}