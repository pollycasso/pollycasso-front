import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import type { LeafData } from '@/shared/lib';
import { cn, createLeafData } from '@/shared/lib';
import { Leaf } from '@/shared/ui/Leaf';
import { ROUTE_CONFIG } from '@/shared/ui/RootLayout/RootLayout.config';
// TODO: FSD 위반 import 리팩토링
import { SoundButton } from '@/features/sound';
import { useEnvironmentStore } from '@/entities/environment';

export const RootLayout = () => {
  const { pathname } = useLocation();
  const { leafCount } = useEnvironmentStore();
  const [leafData, setLeafData] = useState<LeafData[]>([]);

  const currentConfig = ROUTE_CONFIG[pathname] || ROUTE_CONFIG['default'];

  useEffect(() => {
    setLeafData((prev) => {
      const diff = leafCount - prev.length;

      if (diff > 0) {
        const newLeaves = createLeafData(
          diff,
          window.innerWidth,
          window.innerHeight,
        );
        return [...prev, ...newLeaves];
      }

      if (diff < 0) {
        return prev.slice(0, leafCount);
      }

      return prev;
    });
  }, [leafCount]);

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 z-0 bg-center bg-cover transition-all duration-700 ease-out',
          currentConfig.isDark ? 'brightness-75' : 'brightness-100',
        )}
        style={{ backgroundImage: `url(${currentConfig.image})` }}
      />

      <SoundButton />

      {leafData.map((leaf, index) => (
        <Leaf key={index} {...leaf} />
      ))}

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};
