"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mahasiswa, MahasiswaInput, Prodi, getProdi } from "@/lib/api";

type Props = {
  selectedMahasiswa: Mahasiswa | null;
  onSubmit: (payload: MahasiswaInput) => Promise<void>;
  onCancelEdit: () => void;
};

const initialForm: MahasiswaInput = {
  nim: "",
  nama: "",
  prodi_id: 0,
  angkatan: new Date().getFullYear(),
  foto: null,
};

export default function MahasiswaForm({
  selectedMahasiswa,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [form, setForm] = useState<MahasiswaInput>(initialForm);
  const [loading, setLoading] = useState(false);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);

  useEffect(() => {
    // Load prodi list
    getProdi().then(setProdiList).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedMahasiswa) {
      setForm({
        nim: selectedMahasiswa.nim,
        nama: selectedMahasiswa.nama,
        prodi_id: selectedMahasiswa.prodi_id,
        angkatan: selectedMahasiswa.angkatan,
        foto: null, // Jangan set file dari string foto lama
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedMahasiswa]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (form.prodi_id === 0 && prodiList.length > 0) {
        form.prodi_id = prodiList[0].id;
      }
      await onSubmit(form);
      setForm(initialForm);
      // Reset input file manually
      const fileInput = document.getElementById("foto") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{selectedMahasiswa ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>

      <div className="grid">
        <div className="form-group">
          <label htmlFor="nim">NIM</label>
          <input
            id="nim"
            value={form.nim}
            onChange={(e) => setForm({ ...form, nim: e.target.value })}
            placeholder="Contoh: 2201001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nama">Nama</label>
          <input
            id="nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama mahasiswa"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prodi_id">Prodi</label>
          <select
            id="prodi_id"
            value={form.prodi_id}
            onChange={(e) => setForm({ ...form, prodi_id: Number(e.target.value) })}
            required
          >
            <option value={0} disabled>Pilih Program Studi</option>
            {prodiList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} ({p.kode})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="angkatan">Angkatan</label>
          <input
            id="angkatan"
            type="number"
            value={form.angkatan}
            onChange={(e) =>
              setForm({ ...form, angkatan: Number(e.target.value) })
            }
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="foto">Foto (Opsional)</label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, foto: e.target.files ? e.target.files[0] : null })
            }
          />
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : selectedMahasiswa ? "Update" : "Simpan"}
        </button>

        {selectedMahasiswa && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Batal Edit
          </button>
        )}
      </div>
    </form>
  );
}
