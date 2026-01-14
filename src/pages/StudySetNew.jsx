import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudySetNew() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'PRIVATE',
    language_variant: ''
  });
  const [cards, setCards] = useState([
    { front: '', back: '' },
    { front: '', back: '' }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create study set
      const studySet = await base44.entities.StudySet.create({
        school_id: activeSchoolId,
        creator_user: user.email,
        ...formData
      });

      // Create cards
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card.front && card.back) {
          await base44.entities.StudyCard.create({
            school_id: activeSchoolId,
            study_set_id: studySet.id,
            front: card.front,
            back: card.back,
            order: i
          });
        }
      }

      return studySet;
    },
    onSuccess: (studySet) => {
      toast.success('Study set created!');
      navigate(createPageUrl(`StudySetPractice?id=${studySet.id}`));
    }
  });

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const removeCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Study Set</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Study Set Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Hebrew Vocabulary - Week 1"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(v) => setFormData({...formData, visibility: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="SCHOOL">School</SelectItem>
                  <SelectItem value="PUBLIC_WITHIN_SCHOOL">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Flashcards</span>
              <Button onClick={addCard} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards.map((card, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Card {i + 1}</span>
                  {cards.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeCard(i)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Front</Label>
                    <Input
                      value={card.front}
                      onChange={(e) => updateCard(i, 'front', e.target.value)}
                      placeholder="Question/Term"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Back</Label>
                    <Input
                      value={card.back}
                      onChange={(e) => updateCard(i, 'back', e.target.value)}
                      placeholder="Answer/Definition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button 
          onClick={() => createMutation.mutate()}
          disabled={!formData.title || cards.filter(c => c.front && c.back).length === 0 || createMutation.isPending}
          className="w-full"
          size="lg"
        >
          Create Study Set
        </Button>
      </div>
    </div>
  );
}