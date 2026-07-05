"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  Mahasiswa,
  MahasiswaInput,
  updateMahasiswa,
} from "@/lib/api";
import { isLoggedIn, logout, getUser } from "@/lib/auth";

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = getUser();
  const role = user?.role;
  const canCreate = role === "admin" || role === "operator";
  const isAdmin = role === "admin";

  const [mounted, setMounted] = useState(false);

  const loadMahasiswa = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getMahasiswa();
      setMahasiswa(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    loadMahasiswa();
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (payload: MahasiswaInput) => {
    try {
      setMessage("");
      setError("");
      if (selectedMahasiswa) {
        await updateMahasiswa(selectedMahasiswa.id, payload);
        setMessage("Data mahasiswa berhasil diperbarui");
      } else {
        await createMahasiswa(payload);
        setMessage("Data mahasiswa berhasil ditambahkan");
      }
      setSelectedMahasiswa(null);
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirmed) return;
    try {
      setMessage("");
      setError("");
      await deleteMahasiswa(id);
      setMessage("Data mahasiswa berhasil dihapus");
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
  };

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1>CRUD Data Mahasiswa</h1>
          {user && (
            <p style={{ color: "#be185d", marginTop: 4 }}>
              Login sebagai: <strong>{user.name || user.email}</strong> ({user.role})
            </p>
          )}
        </div>
        <div className="actions">
          {isAdmin && (
            <Link href="/users">
              <button className="btn-primary" style={{ marginRight: 8 }}>Manajemen User</button>
            </Link>
          )}
          <Link href="/">
            <button className="btn-secondary">Kembali</button>
          </Link>
          <button className="btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}

      {/* Form hanya tampil untuk admin dan operator */}
      {canCreate && (
        <MahasiswaForm
          selectedMahasiswa={selectedMahasiswa}
          onSubmit={handleSubmit}
          onCancelEdit={() => setSelectedMahasiswa(null)}
        />
      )}

      {/* Viewer hanya bisa melihat tabel */}
      {!canCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ color: "#6b7280" }}>
            🔒 Anda login sebagai <strong>{role}</strong>. Hanya dapat melihat data mahasiswa.
          </p>
        </div>
      )}

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Daftar Mahasiswa</h2>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <MahasiswaTable
            mahasiswa={mahasiswa}
            onEdit={setSelectedMahasiswa}
            onDelete={handleDelete}
          />
        )}
      </section>
    </main>
  );
}
