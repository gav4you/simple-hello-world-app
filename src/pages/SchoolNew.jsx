import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolNew() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    brand_primary: '#d4af37',
    brand_accent: '#1e40af'
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

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

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Check if slug is unique
      const existingSchools = await base44.entities.School.filter({ slug: formData.slug });
      if (existingSchools.length > 0) {
        toast.error('School slug already exists. Please choose a different name.');
        setCreating(false);
        return;
      }

      // Create school
      const school = await base44.entities.School.create({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo_url: formData.logo_url,
        brand_primary: formData.brand_primary,
        brand_accent: formData.brand_accent,
        default_theme: 'system',
        created_by_user: user.email
      });

      // Create membership as OWNER
      await base44.entities.SchoolMembership.create({
        school_id: school.id,
        user_email: user.email,
        role: 'OWNER',
        joined_at: new Date().toISOString()
      });

      // Set as active school
      const prefs = await base44.entities.UserSchoolPreference.filter({
        user_email: user.email
      });

      if (prefs.length > 0) {
        await base44.entities.UserSchoolPreference.update(prefs[0].id, {
          active_school_id: school.id,
          updated_at: new Date().toISOString()
        });
      } else {
        await base44.entities.UserSchoolPreference.create({
          user_email: user.email,
          active_school_id: school.id,
          updated_at: new Date().toISOString()
        });
      }

      localStorage.setItem('active_school_id', school.id);
      toast.success('School created successfully!');
      navigate(createPageUrl('SchoolAdmin'));
      window.location.reload();
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school. Please try again.');
      setCreating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create New School</CardTitle>
              <CardDescription>Set up your Torah learning institution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Breslov Academy"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="breslov-academy"
                required
              />
              <p className="text-xs text-slate-500">This will be used in URLs and must be unique</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Spreading the Torah of Rebbe Nachman..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL (optional)</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand_primary">Primary Color</Label>
                <Input
                  id="brand_primary"
                  type="color"
                  value={formData.brand_primary}
                  onChange={(e) => setFormData({ ...formData, brand_primary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_accent">Accent Color</Label>
                <Input
                  id="brand_accent"
                  type="color"
                  value={formData.brand_accent}
                  onChange={(e) => setFormData({ ...formData, brand_accent: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Creating...' : 'Create School'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}