import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInsApi } from '@/services/api';
import type { CheckIn } from '@/types';

export function useCheckIns() {
  return useQuery<CheckIn[]>({
    queryKey: ['checkins'],
    queryFn: async () => {
      const { data } = await checkInsApi.list();
      return data;
    },
  });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data?: { journeyId?: string; message?: string }) => checkInsApi.create(data),
    onSuccess: ({ data }) => {
      qc.setQueryData<CheckIn[]>(['checkins'], (prev) => [data, ...(prev ?? [])]);
    },
  });
}
