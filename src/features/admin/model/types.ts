import type { ReactNode } from 'react';

export interface User {
  id: number;
  date: string;
  nickname: string;
  userId: string;
  tag: string;
}

export interface Report {
  id: string;
  date: string;
  nickname: string;
  userId: string;
  tag: string;
  content: string;
  isCompleted: boolean;
}

export interface Match {
  id: number;
  roomNum: string;
  mode: string;
  title: string;
  startTime: string;
  creatorId: string;
  participants: string[];
  result: string;
}

export type TabType = 'user' | 'report' | 'match';

export interface TableColumn<Table> {
  key: keyof Table | 'custom';
  label: string;
  render?: (row: Table) => ReactNode;
}

export interface TableConfig<Table> {
  data: Table[];
  gridClass: string;
  columns: TableColumn<Table>[];
}
