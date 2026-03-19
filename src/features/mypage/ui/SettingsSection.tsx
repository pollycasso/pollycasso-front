import { useSoundStore } from '@/entities/sound';
import { useEnvironmentStore } from '@/entities/environment';
import { SoundManager } from '@/shared/api/sound/manager';
import { RangeSlider } from './RangeSlider';
import { SOUND_ASSETS } from '@/shared/api/sound/assets';

export const SettingsSection = () => {
  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume } = useSoundStore();
  const { leafCount, setLeafCount } = useEnvironmentStore();

  return (
    <div className="relative w-full h-[520px] pt-4 flex flex-col gap-14">
      <RangeSlider
        label="배경음악 크기 (Background Music)"
        value={Math.round(bgmVolume * 100)}
        min={0}
        max={100}
        unit="%"
        onChange={(e) => {
          const val = Number(e.target.value) / 100;
          setBgmVolume(val);
          SoundManager.setBgmVolume(val);
        }}
      />

      <RangeSlider
        label="효과음 크기 (Sounds Effect)"
        value={Math.round(sfxVolume * 100)}
        min={0}
        max={100}
        unit="%"
        onChange={(e) => {
          const val = Number(e.target.value) / 100;
          setSfxVolume(val);
          SoundManager.playSfx(SOUND_ASSETS.SFX.ROUND_SUMMARY, val);
        }}
      />

      <RangeSlider
        label="나뭇잎 개수 (Background Leaf)"
        value={leafCount}
        min={0}
        max={20}
        unit="개"
        maxLabel="20"
        description="* 개수를 줄이면 성능이 향상됩니다."
        onChange={(e) => setLeafCount(Number(e.target.value))}
      />
    </div>
  );
};
