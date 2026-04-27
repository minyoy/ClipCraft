import logo from '../assets/images/logo/logo.svg';
import type { LogoProps } from '../types/components/Logo';

export default function Logo({ height = 40 }: LogoProps) {
  return <img src={logo} alt="ClipCraft" style={{ height, width: 'auto' }} />;
}
