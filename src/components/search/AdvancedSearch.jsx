import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function AdvancedSearch({ courses, onFilter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);

  const categories = [...new Set(courses.map(c => c.category))];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const tiers = ['free', 'premium', 'elite'];
  const instructors = [...new Set(courses.map(c => c.instructor))];

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategories, selectedLevels, selectedTiers, selectedInstructors]);

  const applyFilters = () => {
    let filtered = courses;

    // Search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(c => selectedCategories.includes(c.category));
    }

    // Levels
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(c => selectedLevels.includes(c.level));
    }

    // Tiers
    if (selectedTiers.length > 0) {
      filtered = filtered.filter(c => selectedTiers.includes(c.access_tier));
    }

    // Instructors
    if (selectedInstructors.length > 0) {
      filtered = filtered.filter(c => selectedInstructors.includes(c.instructor));
    }

    onFilter(filtered);
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLevel = (level) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const toggleTier = (tier) => {
    setSelectedTiers(prev =>
      prev.includes(tier)
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
  };

  const toggleInstructor = (instructor) => {
    setSelectedInstructors(prev =>
      prev.includes(instructor)
        ? prev.filter(i => i !== instructor)
        : [...prev, instructor]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedTiers([]);
    setSelectedInstructors([]);
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedLevels.length + 
    selectedTiers.length + 
    selectedInstructors.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search courses, instructors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`cat-${category}`} className="cursor-pointer">
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <h3 className="font-semibold mb-3">Level</h3>
                <div className="space-y-2">
                  {levels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                      />
                      <Label htmlFor={`level-${level}`} className="cursor-pointer capitalize">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Tier */}
              <div>
                <h3 className="font-semibold mb-3">Access</h3>
                <div className="space-y-2">
                  {tiers.map(tier => (
                    <div key={tier} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tier-${tier}`}
                        checked={selectedTiers.includes(tier)}
                        onCheckedChange={() => toggleTier(tier)}
                      />
                      <Label htmlFor={`tier-${tier}`} className="cursor-pointer capitalize">
                        {tier}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructors */}
              <div>
                <h3 className="font-semibold mb-3">Instructors</h3>
                <div className="space-y-2">
                  {instructors.map(instructor => (
                    <div key={instructor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`inst-${instructor}`}
                        checked={selectedInstructors.includes(instructor)}
                        onCheckedChange={() => toggleInstructor(instructor)}
                      />
                      <Label htmlFor={`inst-${instructor}`} className="cursor-pointer">
                        {instructor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(cat => (
            <Badge key={cat} variant="secondary" className="flex items-center space-x-1">
              <span>{cat.replace(/_/g, ' ')}</span>
              <button onClick={() => toggleCategory(cat)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedLevels.map(level => (
            <Badge key={level} variant="secondary" className="flex items-center space-x-1">
              <span className="capitalize">{level}</span>
              <button onClick={() => toggleLevel(level)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedTiers.map(tier => (
            <Badge key={tier} variant="secondary" className="flex items-center space-x-1">
              <span className="capitalize">{tier}</span>
              <button onClick={() => toggleTier(tier)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedInstructors.map(instructor => (
            <Badge key={instructor} variant="secondary" className="flex items-center space-x-1">
              <span>{instructor}</span>
              <button onClick={() => toggleInstructor(instructor)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}