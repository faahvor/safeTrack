import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalApi } from '@/services/api';
import type { Medical } from '@/types';

export function useGetMedical() {
  return useQuery<Medical>({
    queryKey: ['medical'],
    queryFn: async () => {
      const { data } = await medicalApi.get();
      return data;
    },
  });
}

export function useUpdateMedical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Medical>) => medicalApi.update(data),
    onSuccess: ({ data }) => qc.setQueryData(['medical'], data),
  });
}
