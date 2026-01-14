import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building2, Plus, Settings } from 'lucide-react';

export default function SchoolSwitcher({ activeSchool, memberships, onSchoolChange, isAdmin }) {
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchools();
  }, [memberships]);

  const loadSchools = async () => {
    if (!memberships || memberships.length === 0) return;

    // IMPORTANT: Avoid listing all schools (multi-tenant + performance).
    // Instead, fetch only the schools the current user is a member of.
    const schoolIds = Array.from(new Set(memberships.map(m => m.school_id).filter(Boolean)));
    try {
      const fetched = await Promise.all(
        schoolIds.map(async (id) => {
          const rows = await base44.entities.School.filter({ id });
          return rows?.[0] || null;
        })
      );
      setSchools(fetched.filter(Boolean));
    } catch (err) {
      console.error('Failed to load schools', err);
      setSchools([]);
    }
  };

  const handleSchoolSwitch = async (schoolId) => {
    await onSchoolChange(schoolId);
    // No full reload: session/provider updates should re-render with new school context.
  };

  if (!activeSchool) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="max-w-xs">
          <Building2 className="w-4 h-4 mr-2" />
          <span className="truncate">{activeSchool.name}</span>
          <ChevronDown className="w-3 h-3 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch School</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => handleSchoolSwitch(school.id)}
            className={activeSchool.id === school.id ? 'bg-slate-100' : ''}
          >
            <div className="flex items-center space-x-2">
              {school.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="w-5 h-5 rounded" />
              ) : (
                <Building2 className="w-5 h-5 text-slate-500" />
              )}
              <span>{school.name}</span>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate(createPageUrl('SchoolNew'))}>
          <Plus className="w-4 h-4 mr-2" />
          Create New School
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate(createPageUrl('SchoolAdmin'))}>
            <Settings className="w-4 h-4 mr-2" />
            Manage School
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}