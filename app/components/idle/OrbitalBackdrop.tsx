export default function OrbitalBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <svg
        className="absolute -right-[18rem] -bottom-[22rem] w-[56rem] h-[56rem] opacity-[0.07]"
        viewBox="0 0 600 600"
      >
        <defs>
          <radialGradient id="apollo-orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b2545" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0b2545" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0b2545" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="32" fill="url(#apollo-orb)" />
        <g
          className="apollo-orbit-slow"
          style={{ transformOrigin: "300px 300px" }}
        >
          <ellipse
            cx="300"
            cy="300"
            rx="150"
            ry="150"
            fill="none"
            stroke="#0b2545"
            strokeWidth="0.8"
            strokeDasharray="2 6"
          />
          <circle cx="450" cy="300" r="3.5" fill="#0b2545" />
        </g>
        <g
          className="apollo-orbit-slower"
          style={{ transformOrigin: "300px 300px" }}
        >
          <ellipse
            cx="300"
            cy="300"
            rx="230"
            ry="230"
            fill="none"
            stroke="#0b2545"
            strokeWidth="0.8"
          />
          <circle cx="300" cy="70" r="2.5" fill="#d97706" />
        </g>
        <g
          className="apollo-orbit-slowest"
          style={{ transformOrigin: "300px 300px" }}
        >
          <ellipse
            cx="300"
            cy="300"
            rx="310"
            ry="310"
            fill="none"
            stroke="#0b2545"
            strokeWidth="0.8"
            strokeDasharray="1 10"
          />
          <circle cx="10" cy="300" r="2" fill="#16a34a" />
        </g>
      </svg>
    </div>
  );
}
