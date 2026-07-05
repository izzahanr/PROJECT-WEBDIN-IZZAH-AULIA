import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card" style={{ textAlign: "center", marginTop: 50, padding: 40 }}>
        <h1 style={{ marginBottom: 16 }}>Sistem Informasi Kampus</h1>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
          <Link href="/mahasiswa">
            <button className="btn-primary">Buka Data Mahasiswa</button>
          </Link>
          <Link href="/login">
            <button className="btn-secondary">Login</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
