'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getJobCards, getMechanics, getRescueCalls } from '@/lib/api/workshop';

export const workshopKeys = {
  all: ['workshop'] as const,
  jobCards: () => [...workshopKeys.all, 'job-cards'] as const,
  rescue: () => [...workshopKeys.all, 'rescue'] as const,
  mechanics: () => [...workshopKeys.all, 'mechanics'] as const,
};

function useWorkshopAuth() {
  const { data, status } = useSession();
  return {
    token: data?.accessToken,
    ready: status === 'authenticated' && Boolean(data?.accessToken),
  };
}

export function useJobCards() {
  const { token, ready } = useWorkshopAuth();
  return useQuery({ queryKey: workshopKeys.jobCards(), queryFn: () => getJobCards(token), enabled: ready });
}

export function useRescueCalls() {
  const { token, ready } = useWorkshopAuth();
  return useQuery({ queryKey: workshopKeys.rescue(), queryFn: () => getRescueCalls(token), enabled: ready });
}

export function useMechanics() {
  const { token, ready } = useWorkshopAuth();
  return useQuery({ queryKey: workshopKeys.mechanics(), queryFn: () => getMechanics(token), enabled: ready });
}
