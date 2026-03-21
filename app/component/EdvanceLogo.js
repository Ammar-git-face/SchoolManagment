export const EdvanceIcon = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#0f172a"/>
        <polygon points="16,6 26,11 16,15 6,11" fill="#ffffff"/>
        <polygon points="16,15 26,11 26,14 16,18" fill="#c7d2fe"/>
        <polygon points="16,15 6,11 6,14 16,18" fill="#818cf8"/>
        <rect x="14.5" y="15" width="3" height="7" rx="1" fill="#ffffff"/>
        <circle cx="16" cy="23" r="2" fill="#818cf8"/>
        <line x1="24" y1="12" x2="24" y2="17" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="19" r="1.5" fill="#818cf8"/>
    </svg>
)

export const EdvanceLogo = ({ size = 32, showText = true, dark = false }) => (
    <div className="flex flex-col items-center mb-8">
    <EdvanceIcon size={72} />
    <span className="mt-3 text-xl font-bold text-gray-900 tracking-tight">edvance</span>
    <span className="text-xs font-medium text-indigo-500 tracking-widest uppercase mt-0.5">School Management</span>
</div>
)