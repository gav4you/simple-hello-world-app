import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SchoolContext = createContext();

export function useSchool() {
  return useContext(SchoolContext);
}

export function SchoolProvider({ children }) {
  const [activeSchool, setActiveSchoolState] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load active school on mount
  useEffect(() => {
    loadActiveSchool();
  }, []);

  const loadActiveSchool = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Fetch user's memberships
      const userMemberships = await base44.entities.SchoolMembership.filter({
        user_email: currentUser.email
      });
      setMemberships(userMemberships);

      // Check for saved preference
      const prefs = await base44.entities.UserSchoolPreference.filter({
        user_email: currentUser.email
      });

      if (prefs.length > 0 && prefs[0].active_school_id) {
        // Load the active school
        const schools = await base44.entities.School.filter({
          id: prefs[0].active_school_id
        });
        if (schools.length > 0) {
          setActiveSchoolState(schools[0]);
          localStorage.setItem('active_school_id', schools[0].id);
          setLoading(false);
          return;
        }
      }

      // No preference set - check memberships
      if (userMemberships.length === 0) {
        // No schools - redirect to create
        setLoading(false);
        navigate(createPageUrl('SchoolNew'));
      } else if (userMemberships.length === 1) {
        // Auto-select single school
        const schools = await base44.entities.School.filter({
          id: userMemberships[0].school_id
        });
        if (schools.length > 0) {
          await setActiveSchool(schools[0].id);
        }
        setLoading(false);
      } else {
        // Multiple schools - let user choose
        setLoading(false);
        navigate(createPageUrl('SchoolSelect'));
      }
    } catch (error) {
      console.error('Error loading active school:', error);
      setLoading(false);
    }
  };

  const setActiveSchool = async (schoolId) => {
    try {
      // Fetch school details
      const schools = await base44.entities.School.filter({ id: schoolId });
      if (schools.length === 0) return;

      const school = schools[0];
      setActiveSchoolState(school);
      localStorage.setItem('active_school_id', schoolId);

      // Update or create preference
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
    } catch (error) {
      console.error('Error setting active school:', error);
    }
  };

  const getUserRole = (schoolId) => {
    const membership = memberships.find(m => m.school_id === schoolId);
    return membership?.role || 'STUDENT';
  };

  const isSchoolAdmin = () => {
    if (!activeSchool) return false;
    const role = getUserRole(activeSchool.id);
    return role === 'OWNER' || role === 'ADMIN';
  };

  const value = {
    activeSchool,
    setActiveSchool,
    memberships,
    loading,
    user,
    getUserRole,
    isSchoolAdmin,
    refreshMemberships: loadActiveSchool
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
}