import { Modal } from '@/shared/ui/Modal';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal = ({ onClose }: CreditsModalProps) => {
  return (
    <Modal
      onClose={onClose}
      confirmText="감사합니다"
      onConfirm={onClose}
      cancelText="돌아가기"
    >
      <div className="flex flex-col items-center gap-y-4 text-gray-800 font-ssrm">
        <h2 className="text-4xl font-bold text-[#153712]">
          폴리카소(Pollycasso)
        </h2>
        <div className="w-32 h-1 bg-gray-100 rounded-full" />

        <div className="flex flex-col items-center gap-y-2 mt-2">
          <p className="text-lg font-medium">
            이 프로젝트는 사운드어플라이에서 제공한 음원을 사용했습니다.
          </p>
          <p className="text-lg font-medium">
            ✅ BGM License Verified by SoundApply
          </p>
          <p className="text-lg font-medium">🎧 Title: Silver Wind</p>
          <p className="text-lg font-medium">
            http://soundapply.com/music/30135
          </p>

          <p className="text-lg font-medium">🎧 Title: Vivid Luv</p>
          <p className="text-lg font-medium">
            https://soundapply.com/music/27464
          </p>
        </div>
      </div>
    </Modal>
  );
};
