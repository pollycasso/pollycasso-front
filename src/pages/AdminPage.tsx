import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Header } from '@/assets';
import {
  AdminSidebar,
  GenericTable,
  ReportDetail,
  MatchDetail,
} from '@/features/admin';
import type {
  Match,
  Report,
  TabType,
  TableConfig,
  User,
} from '@/features/admin';
import {
  INITIAL_MATCHES,
  INITIAL_REPORTS,
  INITIAL_USERS,
} from '@/mocks/admin.mock';

const AdminPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

  const currentTab = (searchParams.get('tab') as TabType) || 'user';

  const selectedReportId = searchParams.get('reportId');
  const selectedReport = reports.find((r) => r.id === selectedReportId);

  const selectedMatchId = searchParams.get('matchId');
  const selectedMatch = INITIAL_MATCHES.find(
    (m) => m.id === Number(selectedMatchId),
  );

  const handleTabChange = (tabId: TabType) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  const handleReportApply = () => {
    if (selectedReportId) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReportId ? { ...r, isCompleted: true } : r,
        ),
      );
      setSearchParams({ tab: 'report' });
    }
  };

  const userConfig: TableConfig<User> = useMemo(
    () => ({
      data: INITIAL_USERS,
      gridClass:
        'grid grid-cols-[60px_1.5fr_2fr_1fr_2fr] items-center text-left px-6',
      columns: [
        { key: 'id', label: '' },
        {
          key: 'nickname',
          label: '닉네임',
          render: (row) => <span className="font-medium">{row.nickname}</span>,
        },
        { key: 'userId', label: '아이디' },
        { key: 'tag', label: '태그' },
        { key: 'date', label: '가입 날짜' },
      ],
    }),
    [],
  );

  const reportConfig: TableConfig<Report> = useMemo(
    () => ({
      data: reports,
      gridClass:
        'grid grid-cols-[60px_1.5fr_2fr_1fr_2fr] items-center text-left px-6',
      columns: [
        { key: 'id', label: '' },
        {
          key: 'nickname',
          label: '닉네임',
          render: (row) => (
            <div className="flex items-center justify-between gap-2 pr-4">
              <button
                onClick={() =>
                  setSearchParams({ tab: 'report', reportId: row.id })
                }
                className="text-blue-600 underline cursor-pointer font-medium hover:text-blue-800"
              >
                {row.nickname}
              </button>
              {row.isCompleted && (
                <span className="bg-[#EFEFEF] text-[#B4B4B4] text-[10px] px-1.5 py-0.5 rounded border border-gray-200">
                  신고완료
                </span>
              )}
            </div>
          ),
        },
        { key: 'userId', label: '아이디' },
        { key: 'tag', label: '태그' },
        { key: 'date', label: '신고 날짜' },
      ],
    }),
    [reports, setSearchParams],
  );

  const matchConfig: TableConfig<Match> = useMemo(
    () => ({
      data: INITIAL_MATCHES,
      gridClass:
        'grid grid-cols-[80px_1fr_1fr_2.5fr_2fr] items-center text-left px-6',
      columns: [
        { key: 'id', label: '' },
        {
          key: 'roomNum',
          label: '방번호',
          render: (row) => (
            <button
              onClick={() =>
                setSearchParams({ tab: 'match', matchId: String(row.id) })
              }
              className="text-blue-600 underline cursor-pointer font-medium hover:text-blue-800"
            >
              {row.roomNum}
            </button>
          ),
        },
        { key: 'mode', label: '게임모드' },
        {
          key: 'title',
          label: '방 제목',
          render: (row) => <span className="truncate">{row.title}</span>,
        },
        { key: 'startTime', label: '시작 시간' },
      ],
    }),
    [setSearchParams],
  );

  const renderContent = () => {
    if (currentTab === 'report' && selectedReportId && selectedReport) {
      return (
        <ReportDetail
          report={selectedReport}
          onApply={handleReportApply}
          onBack={() => setSearchParams({ tab: 'report' })}
        />
      );
    }

    if (currentTab === 'match' && selectedMatchId && selectedMatch) {
      return (
        <MatchDetail
          match={selectedMatch}
          onBack={() => setSearchParams({ tab: 'match' })}
        />
      );
    }

    return (
      <>
        <h2 className="text-lg font-bold mb-4 text-[#B4B4B4]">
          {currentTab === 'user' && `총 ${userConfig.data.length} 유저`}
          {currentTab === 'report' &&
            `신고 내역 (${reportConfig.data.length}건)`}
          {currentTab === 'match' &&
            `진행된 매치 (${matchConfig.data.length}건)`}
        </h2>

        {currentTab === 'user' && <GenericTable<User> {...userConfig} />}
        {currentTab === 'report' && <GenericTable<Report> {...reportConfig} />}
        {currentTab === 'match' && <GenericTable<Match> {...matchConfig} />}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8f9fa]">
      <header className="w-full h-auto aspect-[1920/115] flex-shrink-0 bg-white">
        <img
          src={Header}
          alt="Admin Header"
          className="w-full h-full object-contain"
        />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar currentTab={currentTab} onTabChange={handleTabChange} />

        <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminPage;
