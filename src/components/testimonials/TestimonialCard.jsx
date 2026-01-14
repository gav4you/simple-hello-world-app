import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Play } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  return (
    <Card className={testimonial.featured ? 'border-2 border-amber-500' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {testimonial.student_name?.[0]}
          </div>
          <div>
            <h4 className="font-bold">{testimonial.student_name}</h4>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
        
        {testimonial.video_url && (
          <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
            <Play className="w-4 h-4 mr-2" />
            Watch Video Testimonial
          </button>
        )}
        
        {testimonial.results_achieved?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Results Achieved:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              {testimonial.results_achieved.slice(0, 3).map((result, idx) => (
                <li key={idx}>✓ {result}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}