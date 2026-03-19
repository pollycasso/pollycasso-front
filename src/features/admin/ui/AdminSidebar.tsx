import type { TabType } from '../model/types';

interface AdminSidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const MENU_ITEMS: { id: TabType; label: string }[] = [
  { id: 'user', label: '유저 정보' },
  { id: 'report', label: '신고 목록' },
  { id: 'match', label: '게임 매치 기록' },
];

export const AdminSidebar = ({
  currentTab,
  onTabChange,
}: AdminSidebarProps) => {
  return (
    <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex flex-col">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`text-left p-4 font-semibold border-b border-gray-100 transition-colors
              ${
                currentTab === item.id
                  ? 'bg-[#EFEFEF] text-black'
                  : 'text-[#B4B4B4] hover:bg-[#EFEFEF] hover:text-black'
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
