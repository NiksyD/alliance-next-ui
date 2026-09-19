'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();

  // Focused creation flow gets a clean, dedicated canvas without the tab bar overhead
  if (pathname === '/dashboard/events/create') {
    return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
