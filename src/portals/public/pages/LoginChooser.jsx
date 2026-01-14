import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LoginChooser() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-slate-600">
        Choose the portal you want to enter.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-medium">Student</h2>
          <p className="mt-2 text-sm text-slate-600">
            Access your courses, lessons, and quizzes.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link to="/login/student">Continue as student</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-medium">Teacher</h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage courses, students, quizzes, and content.
          </p>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/login/teacher">Continue as teacher</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
