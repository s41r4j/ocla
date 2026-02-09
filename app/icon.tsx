import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 32,
    height: 32
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: "#09090b",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                }}
            >
                {/* Cyber Hexagon Motif */}
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))",
                    }}
                >
                    <path
                        d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 8V16"
                        stroke="#34d399"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M8 12H16"
                        stroke="#34d399"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        ),
        {
            ...size
        }
    );
}
