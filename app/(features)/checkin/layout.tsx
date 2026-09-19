'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CheckinRootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <DashboardLayout>{children}</DashboardLayout>;
}
