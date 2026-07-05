"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  User,
  UserInput,
} from "@/lib/api";
import { isLoggedIn, logout, getUser } from "@/lib/auth";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [form, setForm] = useState<UserInput>({ name: "", email: "", password: "", role: "viewer" });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    if (!isAdmin) {
      window.location.href = "/mahasiswa"; // Redirect non-admins
      return;
    }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      if (selectedUserId) {
        await updateUser(selectedUserId, { name: form.name, email: form.email, role: form.role });
        setMessage("User berhasil diperbarui");
      } else {
        await createUser(form);
        setMessage("User berhasil ditambahkan");
      }
      setForm({ name: "", email: "", password: "", role: "viewer" });
      setSelectedUserId(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan user");
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUser?.id === id) {
      alert("Anda tidak bisa menghapus akun Anda sendiri.");
      return;
    }
    const confirmed = window.confirm("Yakin ingin menghapus user ini?");
    if (!confirmed) return;
    try {
      setMessage("");
      setError("");
      await deleteUser(id);
      setMessage("User berhasil dihapus");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user");
    }
  };

  const handleResetPassword = async (id: number) => {
    const confirmed = window.confirm("Yakin ingin mereset password user ini?");
    if (!confirmed) return;
    try {
      setMessage("");
      setError("");
      const tempPass = await resetPassword(id);
      alert(`Password berhasil direset!\n\nPassword sementara: ${tempPass}\n\nSilakan catat password ini, hanya ditampilkan sekali.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mereset password");
    }
  };

  const handleEditClick = (u: User) => {
    setSelectedUserId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role, password: "" }); // password dikosongkan saat edit
  };

  const handleCancelEdit = () => {
    setSelectedUserId(null);
    setForm({ name: "", email: "", password: "", role: "viewer" });
  };

  if (!isAdmin) return null;

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1>Manajemen User</h1>
          <p>
            Khusus Admin. 
            {currentUser && <span> Login sebagai: <strong>{currentUser.name}</strong></span>}
          </p>
        </div>
        <div className="actions">
          <Link href="/mahasiswa">
            <button className="btn-secondary">Data Mahasiswa</button>
          </Link>
          <button className="btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <h2>{selectedUserId ? "Edit User" : "Tambah User Baru"}</h2>
        <div className="grid">
          <div className="form-group">
            <label htmlFor="name">Nama</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          {!selectedUserId && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              required
            >
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {selectedUserId ? "Update User" : "Simpan User"}
          </button>
          {selectedUserId && (
            <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
              Batal
            </button>
          )}
        </div>
      </form>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Daftar User</h2>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.name} {currentUser?.id === u.id && "(Anda)"}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn-secondary" onClick={() => handleEditClick(u)}>Edit</button>
                      <button className="btn-secondary" onClick={() => handleResetPassword(u.id)}>Reset Pass</button>
                      {currentUser?.id !== u.id && (
                         <button className="btn-danger" onClick={() => handleDelete(u.id)}>Hapus</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5}>Belum ada data user.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
