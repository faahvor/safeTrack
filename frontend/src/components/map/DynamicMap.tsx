import dynamic from 'next/dynamic';

export const DynamicMap = dynamic(
  () => import('./MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full"
        style={{ background: 'linear-gradient(145deg, #3d5a8a 0%, #2e4a7a 40%, #1f3a6a 100%)' }}
      />
    ),
  }
);
