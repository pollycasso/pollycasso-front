import type { ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { TableColumn } from '../model/types';

interface GenericTableProps<Table> {
  data: Table[];
  columns: TableColumn<Table>[];
  gridClass: string;
}

export const GenericTable = <Table extends { id: string | number }>({
  data,
  columns,
  gridClass,
}: GenericTableProps<Table>) => {
  return (
    <div className="bg-[#EFEFEF] border border-gray-300 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="px-4 flex items-center bg-gray-50 border-r border-gray-300">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
          </div>
          <input
            type="text"
            placeholder="검색할 내용을 입력해주세요."
            className="w-full p-3 text-sm outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* 헤더 */}
      <div
        className={`${gridClass} bg-[#EFEFEF] border-y border-gray-300 py-4 font-bold text-sm text-gray-700`}
      >
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={idx !== 0 ? 'border-l border-gray-300 pl-4' : ''}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* 바디 */}
      <div className="bg-white">
        {data.map((row) => (
          <div
            key={row.id}
            className={`${gridClass} border-b border-gray-200 py-4 text-sm text-gray-800 hover:bg-gray-50 transition-colors`}
          >
            {columns.map((col, idx) => (
              <div
                key={idx}
                className={
                  idx === 0 ? 'text-gray-400' : 'border-l border-gray-200 pl-4'
                }
              >
                {/* render 함수가 있으면 실행, 없으면 단순히 값 출력 */}
                {col.render
                  ? col.render(row)
                  : (row[col.key as keyof Table] as ReactNode)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
