// Session Management Hook - Single Source of Truth
import { useState, useEffect, createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { normalizeAudienceFromRole } from '../config/features';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [activeSchool, setActiveSchool] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [activeSchoolSource, setActiveSchoolSource] = useState(null); // localStorage | preference | firstMembership | manual
  const [role, setRole] = useState(null);
  const [audience, setAudience] = useState('student');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load memberships
      const userMemberships = await base44.entities.SchoolMembership.filter({
        user_email: currentUser.email
      });
      setMemberships(userMemberships);

      // Load active school (localStorage -> persisted preference -> first membership)
      let preferredSchoolId = localStorage.getItem('active_school_id');
      let preferredSource = preferredSchoolId ? 'localStorage' : null;
      if (!preferredSchoolId) {
        try {
          const prefs = await base44.entities.UserSchoolPreference.filter({
            user_email: currentUser.email,
          });
          if (prefs?.[0]?.active_school_id) {
            preferredSchoolId = prefs[0].active_school_id;
          }
        } catch (e) {
          // optional entity in some workspaces
        }
      }
      if (!preferredSchoolId && userMemberships.length > 0) {
        preferredSchoolId = userMemberships[0].school_id;
      }
      if (preferredSchoolId) {
        localStorage.setItem('active_school_id', preferredSchoolId);
        await loadActiveSchool(preferredSchoolId, userMemberships);

        // Reconcile subscriptions (best effort, background)
        try {
          const { reconcileSubscriptions } = await import('../subscriptions/subscriptionEngine');
          reconcileSubscriptions({
            school_id: preferredSchoolId,
            user_email: currentUser.email,
          });
        } catch (e) {
          console.warn('Subscription reconciliation failed:', e);
        }
      }
    } catch (error) {
      console.error('Session load error:', error);
      setUser(null);
      setMemberships([]);
      setActiveSchool(null);
      setActiveSchoolId(null);
      setActiveSchoolSource(null);
      setRole(null);
      setAudience('student');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveSchool = async (schoolId, userMemberships = memberships) => {
    try {
      const schools = await base44.entities.School.filter({ id: schoolId });
      if (schools[0]) {
        setActiveSchool(schools[0]);
        setActiveSchoolId(schoolId);
        
        // Determine role and audience
        const membership = userMemberships.find(m => m.school_id === schoolId);
        if (membership) {
          setRole(membership.role);
          setAudience(normalizeAudienceFromRole(membership.role));
        }
      }
    } catch (error) {
      console.error('Load active school error:', error);
    }
  };

  const changeActiveSchool = async (schoolId) => {
    localStorage.setItem('active_school_id', schoolId);
    setActiveSchoolSource('manual');
    await loadActiveSchool(schoolId);
    
    // Update preference
    try {
      const prefs = await base44.entities.UserSchoolPreference.filter({
        user_email: user.email
      });
      if (prefs.length > 0) {
        await base44.entities.UserSchoolPreference.update(prefs[0].id, {
          active_school_id: schoolId
        });
      } else {
        await base44.entities.UserSchoolPreference.create({
          user_email: user.email,
          active_school_id: schoolId
        });
      }
    } catch (error) {
      console.error('Update preference error:', error);
    }
    
    // Avoid full reload; react-query + scoped keys already include school_id.
  };

  const value = {
    user,
    memberships,
    activeSchool,
    activeSchoolId,
    activeSchoolSource,
    needsSchoolSelection: memberships.length > 1 && activeSchoolSource === 'firstMembership',
    role,
    audience,
    isLoading,
    isAdmin: audience === 'admin',
    isTeacher: audience === 'teacher' || audience === 'admin',
    isStudent: audience === 'student',
    changeActiveSchool,
    refreshSession: loadSession
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};