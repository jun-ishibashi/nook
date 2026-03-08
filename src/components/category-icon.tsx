export default function CategoryIcon({
  value,
  size = 16,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", className, "aria-hidden": true as const };
  const s = { stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (value) {
    case "living":
      return (
        <svg {...props}>
          <path d="M20 12V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6" {...s} />
          <path d="M2 12h20v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5z" {...s} />
          <path d="M6 19v2M18 19v2" {...s} />
        </svg>
      );
    case "bedroom":
      return (
        <svg {...props}>
          <path d="M2 17V8a2 2 0 012-2h16a2 2 0 012 2v9" {...s} />
          <path d="M2 13h20" {...s} />
          <path d="M6 13V9h5v4M13 13V9h5v4" {...s} />
          <path d="M2 17h20M4 17v2M20 17v2" {...s} />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...props}>
          <path d="M12 2v8M8 2v3a4 4 0 008 0V2" {...s} />
          <path d="M12 10v12" {...s} />
          <circle cx="12" cy="14" r="1" fill="currentColor" />
        </svg>
      );
    case "dining":
      return (
        <svg {...props}>
          <path d="M4 18h16" {...s} />
          <path d="M4 18l1-6h14l1 6" {...s} />
          <path d="M6 12V6M18 12V6" {...s} />
          <path d="M5 22v-4M19 22v-4" {...s} />
        </svg>
      );
    case "study":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" {...s} />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" {...s} />
          <path d="M8 7h8M8 11h5" {...s} />
        </svg>
      );
    case "oneroom":
      return (
        <svg {...props}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" {...s} />
          <path d="M9 21V12h6v9" {...s} />
        </svg>
      );
    case "bathroom":
      return (
        <svg {...props}>
          <path d="M4 12h16a1 1 0 011 1v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2a1 1 0 011-1z" {...s} />
          <path d="M6 12V5a2 2 0 012-2h1" {...s} />
          <path d="M7 19v2M17 19v2" {...s} />
        </svg>
      );
    case "entrance":
      return (
        <svg {...props}>
          <path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z" {...s} />
          <path d="M15 12h.01" {...s} strokeWidth="2.5" />
          <path d="M12 2v20" {...s} strokeDasharray="2 2" />
        </svg>
      );
    case "balcony":
      return (
        <svg {...props}>
          <path d="M12 3v3M5.64 5.64l2.12 2.12M18.36 5.64l-2.12 2.12" {...s} />
          <path d="M3 13h18M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" {...s} />
          <path d="M9 13v8M15 13v8" {...s} />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" {...s} />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" {...s} />
        </svg>
      );
  }
}
