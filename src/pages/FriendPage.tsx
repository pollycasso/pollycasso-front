import { useState } from 'react';

import { BackButton } from '@/features/add-friend/ui/BackButton';
import { FriendHeader, FriendList } from '@/widgets/friend';
import { useFriend } from '@/entities/friend';

const FriendPage = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const { recommendedFriends } = useFriend('');

  return (
    <div className="flex items-center justify-center min-h-screen p-6 md:p-12 font-ssrm font-bold ">
      <BackButton />
      <div className="w-full max-w-[1500px] min-w-[768px] h-[760px] flex flex-col rounded-3xl bg-[#1E3411]/40 overflow-hidden px-5">
        {/* 추천 친구 데이터를 헤더로 넘깁니다 */}
        <FriendHeader
          value={searchKeyword}
          onChange={setSearchKeyword}
          recommendedFriends={recommendedFriends}
        />
        <FriendList searchKeyword={searchKeyword} />
      </div>
    </div>
  );
};

export default FriendPage;
