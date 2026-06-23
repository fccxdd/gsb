// app/not-found.tsx

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        gap: 24,
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", width: 280, height: 280 }}>
        <Image
          src="/404-not-found.png"
          alt="404"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      <p
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: "#111",
          margin: 0,
        }}
      >
        It&apos;s not you, it&apos;s just a 404-Error
      </p>

      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "12px 28px",
          borderRadius: 12,
          backgroundColor: "#111",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to GSB
      </Link>
    </div>
  );
}