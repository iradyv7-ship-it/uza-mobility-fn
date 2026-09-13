/** Mirrors TrainingCourse in uza-mobility-bn — Mobility Ecosystem Blueprint, Section 05. */
export type TrainingCourse = {
  id: string;
  title: string;
  provider: string;
  source: 'CHINESE_OEM' | 'LOCAL_RWANDAN';
  language: string;
  category: string;
  url: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
};
