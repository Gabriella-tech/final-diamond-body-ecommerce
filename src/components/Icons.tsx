type P = { className?: string; size?: number };
const base = (size = 20) => ({ width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" });

export const IconDiamond = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 3h12l4 6-10 12L2 9z" />
    <path d="M11 3 7 9l5 12L17 9l-4-6" />
    <path d="M2 9h20" />
  </svg>
);
export const IconCart = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
);
export const IconHeart = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
export const IconUser = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
export const IconSearch = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
export const IconMenu = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
export const IconClose = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
export const IconStar = ({ className, size, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
export const IconCheck = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polyline points="20 6 9 17 4 12"/></svg>
);
export const IconArrowRight = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
export const IconChevronDown = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polyline points="6 9 12 15 18 9"/></svg>
);
export const IconChevronRight = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polyline points="9 18 15 12 9 6"/></svg>
);
export const IconWhatsApp = ({ className, size = 24 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.5-4-3.5-.3-.5.3-.5.8-1.5.1-.2.1-.3 0-.5 0-.1-.6-1.5-.9-2.1-.2-.6-.5-.5-.6-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.8-.2-.3A8 8 0 1 1 12 20z"/>
  </svg>
);
export const IconTruck = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
);
export const IconShield = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
export const IconLeaf = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M11 20A7 7 0 0 1 4 13V5h7a7 7 0 0 1 7 7v8z"/><path d="M2 22 11 13"/></svg>
);
export const IconBolt = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
export const IconTrash = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
export const IconDownload = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
export const IconUpload = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
export const IconPlus = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
export const IconMinus = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
export const IconFilter = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);
export const IconLogout = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
export const IconMail = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
export const IconPhone = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
export const IconMapPin = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
export const IconEye = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const IconEyeOff = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
