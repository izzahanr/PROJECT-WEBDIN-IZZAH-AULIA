"use client";

import { Mahasiswa } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Props = {
  mahasiswa: Mahasiswa[];
  onEdit: (item: Mahasiswa) => void;
  onDelete: (id: number) => Promise<void>;
};

export default function MahasiswaTable({ mahasiswa, onEdit, onDelete }: Props) {
  const user = getUser();
  const role = user?.role;
  const canEdit = role === "admin" || role === "operator";
  const canDelete = role === "admin";
  const showAksi = canEdit || canDelete;

  if (mahasiswa.length === 0) {
    return <p>Belum ada data mahasiswa.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>NIM</th>
          <th>Nama</th>
          <th>Prodi</th>
          <th>Angkatan</th>
          {showAksi && <th>Aksi</th>}
        </tr>
      </thead>

      <tbody>
        {mahasiswa.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>{item.nim}</td>
            <td>{item.nama}</td>
            <td>{item.prodi}</td>
            <td>{item.angkatan}</td>
            {showAksi && (
              <td>
                <div className="actions">
                  {canEdit && (
                    <button className="btn-secondary" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn-danger" onClick={() => onDelete(item.id)}>
                      Hapus
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
