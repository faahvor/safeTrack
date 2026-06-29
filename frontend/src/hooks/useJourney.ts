import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journeysApi } from '@/services/api';
import type { Journey } from '@/types';

export function useJourneys() {
  return useQuery<Journey[]>({
    queryKey: ['journeys'],
    queryFn: async () => {
      const { data } = await journeysApi.list();
      return data;
    },
  });
}

export function useJourney(id: string) {
  return useQuery<Journey>({
    queryKey: ['journeys', id],
    queryFn: async () => {
      const { data } = await journeysApi.get(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) => journeysApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journeys'] }),
  });
}

export function useEndJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journeysApi.end(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['journeys'] });
      qc.invalidateQueries({ queryKey: ['journeys', id] });
    },
  });
}
