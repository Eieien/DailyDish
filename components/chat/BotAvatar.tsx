import { Image } from 'react-native';

// Static asset — bundled at build time. Replace the file at this path with
// your own avatar (PNG with transparency recommended).
const botAvatar = require('@/assets/bot-avatar.png');

interface BotAvatarProps {
  size?: number;
}

/** Circular robot avatar used in the header and beside assistant messages. */
export const BotAvatar: React.FC<BotAvatarProps> = ({ size = 44 }) => {
  return (
    <Image
      source={botAvatar}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
    />
  );
};
