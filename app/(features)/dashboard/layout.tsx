'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <DashboardLayout>{children}</DashboardLayout>;
}
