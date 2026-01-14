import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Languages as LanguagesIcon } from 'lucide-react';
import LanguageSelector from '../components/language/LanguageSelector';

export default function Languages() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <LanguagesIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Language Learning</h1>
            <p className="text-purple-200 text-lg mt-1">
              Master Hebrew, Aramaic, Yiddish & More
            </p>
          </div>
        </div>
        <p className="text-purple-100 max-w-3xl">
          Learn all variations of the holy language - from Biblical Hebrew to Modern Hebrew, 
          Talmudic Aramaic, and Yiddish. Interactive lessons inspired by Rosetta Stone methodology.
        </p>
      </div>

      {/* Quote */}
      <div className="bg-gradient-to-r from-amber-50 to-blue-50 rounded-xl p-6 border-l-4 border-amber-500">
        <p className="text-slate-700 text-lg italic font-serif mb-2">
          "The gates of prayer are sometimes locked, but the gates of repentance are always open."
        </p>
        <p className="text-slate-600 font-semibold">— Devarim Rabbah 2:12</p>
        <p className="text-slate-500 text-sm mt-2">
          Understanding the original languages deepens your connection to Torah
        </p>
      </div>

      {/* Language Selection */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Language</h2>
        <LanguageSelector />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Immersive Learning</h3>
          <p className="text-slate-600 text-sm">
            Learn like Rosetta Stone - through context and immersion
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl mb-3">🔊</div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Audio Pronunciation</h3>
          <p className="text-slate-600 text-sm">
            Native speaker audio for perfect pronunciation
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl mb-3">📈</div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Track Progress</h3>
          <p className="text-slate-600 text-sm">
            See your vocabulary grow and maintain streaks
          </p>
        </div>
      </div>
    </div>
  );
}