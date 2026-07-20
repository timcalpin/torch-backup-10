import svgPaths from "./svg-paths";

export const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p6cb3200} stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p381def80} stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const HashIcon = ({ color = "#F37422" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p1644feb0} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.pb810ec0} stroke="#8A8073" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p2bf4c380} stroke="#8A8073" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const CalendarIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p38abe4f0} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const UsersNavIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p2277bd00} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const MessageCircleIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <clipPath id="cc1"><rect width="14" height="14" fill="white" /></clipPath>
    <g clipPath="url(#cc1)">
      <path d={svgPaths.p857c700} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const FileIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p155dd80} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const ClipboardIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p37f85180} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const ChartColumnIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d={svgPaths.p2ec7049e} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const AlertCircleIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <clipPath id="cc2"><rect width="14" height="14" fill="white" /></clipPath>
    <g clipPath="url(#cc2)">
      <path d={svgPaths.p3aceeb00} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const ChartPieIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <clipPath id="cc3"><rect width="14" height="14" fill="white" /></clipPath>
    <g clipPath="url(#cc3)">
      <path d={svgPaths.p14bdfd80} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const CogIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <clipPath id="cc4"><rect width="14" height="14" fill="white" /></clipPath>
    <g clipPath="url(#cc4)">
      <path d={svgPaths.p3a12c060} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const CircleXIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <clipPath id="cc5"><rect width="14" height="14" fill="white" /></clipPath>
    <g clipPath="url(#cc5)">
      <path d={svgPaths.p2a842300} stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const XCloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 3L11 11M11 3L3 11" stroke="#8A8073" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const ChevronDownIcon = () => (
  <svg width="8" height="6" viewBox="0 0 8.5 5.31066" fill="none">
    <path d="M1 1L4.25 4.31L7.5 1" stroke="#8A8073" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const SparklesIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5L8.17 5.33L12 6.5L8.17 7.67L7 11.5L5.83 7.67L2 6.5L5.83 5.33L7 1.5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
    <path d="M11.5 1.5L12.17 3.33L14 4L12.17 4.67L11.5 6.5L10.83 4.67L9 4L10.83 3.33L11.5 1.5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" />
  </svg>
);

export const BookIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.33 1.75H9.33C10.16 1.75 10.5 2.33 10.5 2.92V10.79C10.5 11.37 10.16 11.96 9.33 11.96H2.33C1.5 11.96 1.17 11.37 1.17 10.79V2.92C1.17 2.33 1.5 1.75 2.33 1.75Z" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    <path d="M10.5 3.5H11.08C11.9 3.5 12.83 4.09 12.83 5.25V10.5C12.83 11.67 11.9 12.25 11.08 12.25H9.33" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
    <path d="M3.5 4.67H8.17M3.5 7H8.17M3.5 9.33H6.42" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const VideoIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.17" y="2.92" width="8.17" height="8.17" rx="1.17" stroke={color} strokeWidth="1.5" />
    <path d="M9.33 5.25L12.83 3.5V10.5L9.33 8.75" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const MicIcon = ({ color = "#8A8073" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="4.67" y="1.17" width="4.67" height="7" rx="2.33" stroke={color} strokeWidth="1.5" />
    <path d="M2.33 7C2.33 9.58 4.42 11.67 7 11.67C9.58 11.67 11.67 9.58 11.67 7M7 11.67V13.42" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

// Torch flame logo
export function TorchFlame() {
  return (
    <svg width="26" height="33" viewBox="0 0 25.29 33.11" fill="none">
      <defs>
        <radialGradient id="f0" cx="0" cy="0" gradientTransform="translate(12.645 13.244) scale(16.4385 21.5215)" gradientUnits="userSpaceOnUse" r="1">
          <stop stopColor="#FFB347" />
          <stop offset="0.35" stopColor="#FF7A1A" />
          <stop offset="0.75" stopColor="#E5421B" />
          <stop offset="1" stopColor="#8E1F12" />
        </radialGradient>
        <radialGradient id="f1" cx="0" cy="0" gradientTransform="translate(14.355 19.87) scale(10.8405 13.849)" gradientUnits="userSpaceOnUse" r="1">
          <stop stopColor="#FFE07A" />
          <stop offset="0.45" stopColor="#FFA63D" />
          <stop offset="1" stopColor="#E5421B" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="f2" cx="0" cy="0" gradientTransform="translate(14.35 22.2055) scale(6.43 8.305)" gradientUnits="userSpaceOnUse" r="1">
          <stop stopColor="#FFFAE0" />
          <stop offset="0.55" stopColor="#FFD15C" />
          <stop offset="1" stopColor="#FF8A1F" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <path d={svgPaths.p3bc2d100} fill="url(#f0)" />
      <path d={svgPaths.pcbe0e00} fill="url(#f1)" />
      <path d={svgPaths.p1b2eb80} fill="url(#f2)" />
    </svg>
  );
}
