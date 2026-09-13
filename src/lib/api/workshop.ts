'use client';

import { authenticatedFetch } from '@/lib/api/authenticated';
import type { JobCard, Mechanic, RescueCall } from '@/types/workshop/job-card';
import type { TrainingCourse } from '@/types/workshop/training-course';

const BASE = '/workshop';

export function getJobCards(token?: string) {
  return authenticatedFetch<JobCard[]>(`${BASE}/job-cards`, { token });
}

export function getRescueCalls(token?: string) {
  return authenticatedFetch<RescueCall[]>(`${BASE}/rescue`, { token });
}

export function getMechanics(token?: string) {
  return authenticatedFetch<Mechanic[]>(`${BASE}/mechanics`, { token });
}

export function getTrainingCourses(token?: string) {
  return authenticatedFetch<TrainingCourse[]>(`${BASE}/training-courses`, { token });
}
