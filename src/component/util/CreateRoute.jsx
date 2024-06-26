import { lazy } from "react";
import MasterDaftarPustaka from "../page/daftar-pustaka/Root";
import PengajuanKKs from "../page/pengajuan_kk/Root";
import PICKKbyProdi from "../page/pic-kelompok-keahlian/Root";
import KonfirmasiAnggota from "../page/konfirmasi-anggota-kelompok-keahlian/Root";
import RiwayatPengajuan from "../page/riwayat-pengajuan-kk/Root";
import MasterTest from "../page/master-test/Root";
import MasterProses from "../page/master-proses/Root";

const Beranda = lazy(() => import("../page/beranda/Root"));
const KelolaKK = lazy(() => import("../page/kelola-kelompok-keahlian/Root"));
const AnggotaKK = lazy(() => import("../page/anggota-kelompok-keahlian/Root"));
const Program = lazy(() => import("../page/kelola-program/Root"));
const KKAdd = lazy(() => import("../page/kelola-kelompok-keahlian/Add"));

const routeList = [
  {
    path: "/",
    element: <Beranda />,
  },
  {
    path: "/kelompok_keahlian",
    element: <KelolaKK />,
  },
  {
    path: "/kelompok_keahlian/tambah",
    element: <KKAdd />,
  },
  {
    path: "/anggota_kelompok_keahlian",
    element: <AnggotaKK />,
  },
  {
    path: "/daftar_pustaka",
    element: <MasterDaftarPustaka />,
  },
  {
    path: "/kelola_program",
    element: <Program />,
  },
  {
    path: "/pengajuan_anggota_keahlian",
    element: <PengajuanKKs />,
  },
  {
    path: "/pic_kelompok_keahlian",
    element: <PICKKbyProdi />,
  },
  {
    path: "/persetujuan_anggota_keahlian",
    element: <KonfirmasiAnggota />,
  },
  {
    path: "/riwayat_pengajuan_anggota",
    element: <RiwayatPengajuan />,
  },
  {
    path: "/baca_materi",
    element: <MasterTest />,
  },
  {
    path: "/kelola_materi",
    element: <MasterProses />,
  },
];

export default routeList;
