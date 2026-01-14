import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

export default function SchoolSelect() {
  const [user, setUser] = useState(null);
  const [schools, setSchools] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const userMemberships = await base44.entities.SchoolMembership.filter({
        user_email: currentUser.email
      });
      setMemberships(userMemberships);

      const schoolIds = userMemberships.map(m => m.school_id);
      const allSchools = await base44.entities.School.list();
      const userSchools = allSchools.filter(s => schoolIds.includes(s.id));
      setSchools(userSchools);
    } catch (error) {
      base44.auth.redirectToLogin();
    }
  };

  const handleSelectSchool = async (schoolId) => {
    // Update preference
    const prefs = await base44.entities.UserSchoolPreference.filter({
      user_email: user.email
    });

    if (prefs.length > 0) {
      await base44.entities.UserSchoolPreference.update(prefs[0].id, {
        active_school_id: schoolId,
        updated_at: new Date().toISOString()
      });
    } else {
      await base44.entities.UserSchoolPreference.create({
        user_email: user.email,
        active_school_id: schoolId,
        updated_at: new Date().toISOString()
      });
    }

    localStorage.setItem('active_school_id', schoolId);
    navigate(createPageUrl('Dashboard'));
    window.location.reload();
  };

  const getRoleBadge = (schoolId) => {
    const membership = memberships.find(m => m.school_id === schoolId);
    return membership?.role || 'STUDENT';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Select Your School</h1>
          <p className="text-slate-600 text-lg">Choose which school you'd like to access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schools.map((school) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectSchool(school.id)}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  {school.logo_url ? (
                    <img src={school.logo_url} alt={school.name} className="w-12 h-12 rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle>{school.name}</CardTitle>
                    <span className="text-xs text-slate-500">{getRoleBadge(school.id)}</span>
                  </div>
                </div>
                {school.description && (
                  <CardDescription>{school.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Enter School
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate(createPageUrl('SchoolNew'))}>
            Create New School
          </Button>
        </div>
      </div>
    </div>
  );
}