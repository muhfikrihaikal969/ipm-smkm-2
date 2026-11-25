"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Printer,
  Loader2,
  UserPlus,
  Bell,
  BellRing,
  Filter,
  Users,
  Check,
  Timer,
  Hourglass,
  AlertTriangle,
  Search,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MetodePresensi = "gps" | "hybrid" | "kiosk";

type Sesi = {
  id: string;
  nama_kegiatan: string;
  kode_akses: string;
  waktu_buka: string;
  waktu_tutup: string;
  is_active: boolean;
  metode?: MetodePresensi;
};

type Anggota = {
  id: string;
  nama: string;
  bidang: string;
};

type RekapRow = {
  anggota_id: string;
  nama: string;
  bidang: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
};

type LogDetail = {
  id: string;
  sesi_id: string;
  anggota_id: string;
  status: "hadir" | "izin" | "sakit";
  keterangan: string | null;
  waktu_absen: string;
  created_at?: string;
  anggota?: { nama: string; bidang: string };
};

export default function AdminPresensiPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<"sesi" | "manual" | "rekap">("rekap");
  const [rekapSubTab, setRekapSubTab] = useState<"per_sesi" | "keseluruhan">("per_sesi");

  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [rekapList, setRekapList] = useState<RekapRow[]>([]);
  const [selectedSesiFilter, setSelectedSesiFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"semua" | "hadir" | "izin" | "sakit">("semua");
  const [logSesiList, setLogSesiList] = useState<LogDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchKeseluruhan, setSearchKeseluruhan] = useState<string>("");
  const [searchPerSesi, setSearchPerSesi] = useState<string>("");

  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [durasiMenit, setDurasiMenit] = useState<number>(15);
  const [metodeSesi, setMetodeSesi] = useState<MetodePresensi>("gps");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSesiManual, setSelectedSesiManual] = useState("");
  const [selectedAnggotaManual, setSelectedAnggotaManual] = useState("");
  const [statusManual, setStatusManual] = useState<"hadir" | "izin" | "sakit">("hadir");

  const [deletingSesi, setDeletingSesi] = useState<Sesi | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [realtimePopup, setRealtimePopup] = useState<{
    show: boolean;
    nama: string;
    status: string;
    keterangan: string;
  }>({ show: false, nama: "", status: "", keterangan: "" });

  const [sisaDetikMap, setSisaDetikMap] = useState<Record<string, number>>({});
  const [showExtendModal, setShowExtendModal] = useState<boolean>(false);
  const [activePromptSesiId, setActivePromptSesiId] = useState<string | null>(null);
  const [dismissedSesiPrompts, setDismissedSesiPrompts] = useState<Set<string>>(new Set());
  const [tambahanMenit, setTambahanMenit] = useState<number>(5);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const selectedSesiFilterRef = useRef(selectedSesiFilter);
  useEffect(() => {
    selectedSesiFilterRef.current = selectedSesiFilter;
  }, [selectedSesiFilter]);

  const anggotaMap = useMemo(() => {
    const map = new Map<string, Anggota>();
    anggotaList.forEach((a) => map.set(a.id, a));
    return map;
  }, [anggotaList]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
  }, []);

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deletingSesi && !isDeleting) setDeletingSesi(null);
        if (showExtendModal) {
          setShowExtendModal(false);
          setActivePromptSesiId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deletingSesi, isDeleting, showExtendModal]);

  const fetchLogSesi = useCallback(
    async (sesiId: string) => {
      if (!sesiId) {
        setLogSesiList([]);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("log_presensi")
        .select("*")
        .eq("sesi_id", sesiId);

      if (error) {
        showToast("error", `Gagal memuat log: ${error.message}`);
        setLogSesiList([]);
        return;
      }

      if (data) {
        const sorted = (data as LogDetail[]).sort((a, b) => {
          const timeA = new Date(a.waktu_absen || a.created_at || 0).getTime();
          const timeB = new Date(b.waktu_absen || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        setLogSesiList(sorted);
      } else {
        setLogSesiList([]);
      }
    },
    [showToast]
  );

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: sesiData }, { data: rekapData }, { data: anggotaData }] = await Promise.all([
      supabase.from("sesi_presensi").select("*").order("created_at", { ascending: false }),
      supabase.from("vw_rekap_presensi").select("*"),
      supabase.from("anggota").select("id, nama, bidang").order("nama", { ascending: true }),
    ]);

    if (sesiData) {
      setSesiList(sesiData);
      if (sesiData.length > 0) {
        const isStillExist = sesiData.some((s) => s.id === selectedSesiFilterRef.current);
        const targetId = isStillExist ? selectedSesiFilterRef.current : sesiData[0].id;

        selectedSesiFilterRef.current = targetId;
        setSelectedSesiFilter(targetId);
        fetchLogSesi(targetId);
      } else {
        selectedSesiFilterRef.current = "";
        setSelectedSesiFilter("");
        setLogSesiList([]);
      }
    }

    if (rekapData) setRekapList(rekapData);
    if (anggotaData) setAnggotaList(anggotaData);
    setLoading(false);
  }, [fetchLogSesi]);

  // Verify authenticated admin session before loading member attendance records.
  useEffect(() => {
    let isMounted = true;
    async function verifyAndLoad() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      setAuthChecked(true);
      await loadData();
    }
    verifyAndLoad();
    return () => {
      isMounted = false;
    };
  }, [loadData, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMap: Record<string, number> = {};
      const now = Date.now();

      sesiList.forEach((s) => {
        if (s.is_active) {
          const diffSeconds = Math.max(
            0,
            Math.floor((new Date(s.waktu_tutup).getTime() - now) / 1000)
          );
          newMap[s.id] = diffSeconds;

          if (
            diffSeconds > 0 &&
            diffSeconds <= 60 &&
            !dismissedSesiPrompts.has(s.id) &&
            !showExtendModal
          ) {
            setActivePromptSesiId(s.id);
            setShowExtendModal(true);
          }
        }
      });

      setSisaDetikMap(newMap);
    }, 1000);

    return () => clearInterval(interval);
  }, [sesiList, dismissedSesiPrompts, showExtendModal]);

  useEffect(() => {
    if (!authChecked) return;
    const supabase = createClient();

    const channel = supabase
      .channel("admin_realtime_presensi")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "log_presensi" },
        async (payload) => {
          setUnreadCount((prev) => prev + 1);

          const { data: newLog } = await supabase
            .from("log_presensi")
            .select("id, anggota_id, status, keterangan")
            .eq("id", payload.new.id)
            .single();

          if (newLog) {
            const memberInfo = anggotaMap.get(newLog.anggota_id);
            const namaSiswa = memberInfo?.nama || "Anggota";

            setRealtimePopup({
              show: true,
              nama: namaSiswa,
              status: newLog.status,
              keterangan: newLog.keterangan || "-",
            });

            setTimeout(() => {
              setRealtimePopup((prev) => ({ ...prev, show: false }));
            }, 6000);
          }

          loadData();
          if (selectedSesiFilterRef.current) {
            fetchLogSesi(selectedSesiFilterRef.current);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authChecked, loadData, fetchLogSesi, anggotaMap]);

  const handleSelectSesiChange = (sesiId: string) => {
    selectedSesiFilterRef.current = sesiId;
    setSelectedSesiFilter(sesiId);
    fetchLogSesi(sesiId);
  };

  async function handleBuatSesi(e: React.FormEvent) {
    e.preventDefault();
    if (durasiMenit <= 0) {
      showToast("error", "Durasi sesi minimal 1 menit.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    await supabase.from("sesi_presensi").update({ is_active: false }).eq("is_active", true);

    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const kodeRandom = String(100000 + (array[0] % 900000));

    const waktuBuka = new Date();
    const waktuTutup = new Date(waktuBuka.getTime() + durasiMenit * 60000);

    const { error } = await supabase.from("sesi_presensi").insert([
      {
        nama_kegiatan: namaKegiatan.trim(),
        kode_akses: kodeRandom,
        waktu_buka: waktuBuka.toISOString(),
        waktu_tutup: waktuTutup.toISOString(),
        is_active: true,
        metode: metodeSesi,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      showToast("error", `Gagal membuka sesi: ${error.message}`);
    } else {
      showToast("success", `Rapat dibuka (${durasiMenit} menit). Kode Akses: ${kodeRandom}`);
      setNamaKegiatan("");
      loadData();
    }
  }

  async function handlePerpanjangSesi() {
    if (!activePromptSesiId || tambahanMenit <= 0) return;

    const targetSesi = sesiList.find((s) => s.id === activePromptSesiId);
    if (!targetSesi) return;

    const supabase = createClient();
    const currentWaktuTutup = new Date(targetSesi.waktu_tutup).getTime();
    const waktuTutupBaru = new Date(
      Math.max(Date.now(), currentWaktuTutup) + tambahanMenit * 60000
    );

    const { error } = await supabase
      .from("sesi_presensi")
      .update({ waktu_tutup: waktuTutupBaru.toISOString(), is_active: true })
      .eq("id", activePromptSesiId);

    if (error) {
      showToast("error", "Gagal memperpanjang waktu sesi.");
    } else {
      showToast("success", `Sesi diperpanjang +${tambahanMenit} menit.`);
      setShowExtendModal(false);
      setActivePromptSesiId(null);
      loadData();
    }
  }

  function handleTolakPerpanjang() {
    if (activePromptSesiId) {
      setDismissedSesiPrompts((prev) => new Set(prev).add(activePromptSesiId));
    }
    setShowExtendModal(false);
    setActivePromptSesiId(null);
  }

  async function handlePresensiManual(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSesiManual || !selectedAnggotaManual) {
      showToast("error", "Pilih sesi kegiatan dan nama anggota.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from("log_presensi").insert([
      {
        sesi_id: selectedSesiManual,
        anggota_id: selectedAnggotaManual,
        status: statusManual,
        keterangan: "Input Manual oleh Admin (Susulan)",
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        showToast("error", "Anggota ini sudah terdata pada sesi tersebut.");
      } else {
        showToast("error", `Gagal menyimpan: ${error.message}`);
      }
    } else {
      showToast("success", "Presensi susulan berhasil disimpan.");
      setSelectedAnggotaManual("");
      loadData();
      if (selectedSesiFilterRef.current) {
        fetchLogSesi(selectedSesiFilterRef.current);
      }
    }
  }

  async function handleTutupSesi(id: string) {
    const supabase = createClient();
    await supabase.from("sesi_presensi").update({ is_active: false }).eq("id", id);
    showToast("success", "Sesi presensi ditutup.");
    loadData();
  }

  async function handleHapusSesi() {
    if (!deletingSesi) return;

    setIsDeleting(true);
    const supabase = createClient();
    const deletedId = deletingSesi.id;

    const { error: logError } = await supabase
      .from("log_presensi")
      .delete()
      .eq("sesi_id", deletedId);

    if (logError) {
      showToast("error", `Gagal menghapus log presensi: ${logError.message}`);
      setIsDeleting(false);
      return;
    }

    const { error: sesiError } = await supabase
      .from("sesi_presensi")
      .delete()
      .eq("id", deletedId);

    if (sesiError) {
      showToast("error", `Gagal menghapus rapat: ${sesiError.message}`);
      setIsDeleting(false);
      return;
    }

    if (selectedSesiFilterRef.current === deletedId) {
      selectedSesiFilterRef.current = "";
      setSelectedSesiFilter("");
      setLogSesiList([]);
    }

    setIsDeleting(false);
    setDeletingSesi(null);

    showToast("success", "Rapat dan seluruh data kehadirannya berhasil dihapus.");
    await loadData();
  }

  const formatTimeRemaining = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "Waktu Habis";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
  };

  const formatWaktuRealtime = (isoString?: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";
    return (
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " WIB"
    );
  };

  const getStatusBadgeClass = (status: LogDetail["status"]) => {
    if (status === "hadir") return "bg-emerald-100 text-emerald-900 border-emerald-200";
    if (status === "izin") return "bg-sky-100 text-sky-900 border-sky-200";
    return "bg-amber-100 text-amber-900 border-amber-200";
  };

  const filteredRekapList = rekapList.filter(
    (r) =>
      r.nama.toLowerCase().includes(searchKeseluruhan.toLowerCase()) ||
      r.bidang.toLowerCase().includes(searchKeseluruhan.toLowerCase())
  );

  const filteredLogSesiList = logSesiList.filter((l) => {
    if (statusFilter !== "semua" && l.status !== statusFilter) return false;
    const member = l.anggota || anggotaMap.get(l.anggota_id);
    const nama = member?.nama || "";
    const bidang = member?.bidang || "";
    const keyword = searchPerSesi.toLowerCase();

    return (
      nama.toLowerCase().includes(keyword) ||
      bidang.toLowerCase().includes(keyword) ||
      l.status.toLowerCase().includes(keyword)
    );
  });

  const handleExportPDF = () => {
    const docTitle = "rekapitulasi data kehadiran seluruh anggota PR. IPM SMKM2 Cileungsi";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let tableHtml = "";

    if (rekapSubTab === "keseluruhan") {
      tableHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">Rekapitulasi Akumulasi Kehadiran Anggota</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold; color: #047857;">PR IPM SMK Muhammadiyah 2 Cileungsi</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>Nama Anggota</th>
              <th>Bidang</th>
              <th style="text-align: center;">Hadir</th>
              <th style="text-align: center;">Izin</th>
              <th style="text-align: center;">Sakit</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRekapList
              .map(
                (r, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${r.nama}</strong></td>
                <td>${r.bidang}</td>
                <td style="text-align: center; color: #059669; font-weight: bold;">${r.total_hadir}</td>
                <td style="text-align: center; color: #1d4ed8; font-weight: bold;">${r.total_izin}</td>
                <td style="text-align: center; color: #b45309; font-weight: bold;">${r.total_sakit}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else {
      const sesiSelected = sesiList.find((s) => s.id === selectedSesiFilter);
      const namaSesi = sesiSelected ? sesiSelected.nama_kegiatan : "Sesi Rapat";
      tableHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">Rekapitulasi Presensi Rapat</h2>
          <h3 style="margin: 4px 0; font-size: 15px; color: #047857;">"${namaSesi}"</h3>
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #475569;">PR IPM SMK Muhammadiyah 2 Cileungsi</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>Nama Anggota</th>
              <th>Bidang</th>
              <th style="text-align: center;">Status</th>
              <th>Keterangan / Alasan</th>
              <th style="text-align: right;">Waktu Absen</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogSesiList
              .map((l, idx) => {
                const member = l.anggota || anggotaMap.get(l.anggota_id);
                const nama = member?.nama || "-";
                const bidang = member?.bidang || "-";
                const waktu = formatWaktuRealtime(l.waktu_absen || l.created_at);
                return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td><strong>${nama}</strong></td>
                  <td>${bidang}</td>
                  <td style="text-align: center; font-weight: bold; text-transform: uppercase;">${l.status}</td>
                  <td>${l.keterangan || "-"}</td>
                  <td style="text-align: right; font-family: monospace;">${waktu}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-transform: uppercase; font-size: 10px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            @page { size: auto; margin: 15mm; }
          </style>
        </head>
        <body>
          ${tableHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const idAnggotaSudahAbsen = new Set(logSesiList.map((l) => l.anggota_id));
  const anggotaBelumAbsen = anggotaList
    .filter((a) => !idAnggotaSudahAbsen.has(a.id))
    .filter(
      (a) =>
        a.nama.toLowerCase().includes(searchPerSesi.toLowerCase()) ||
        a.bidang.toLowerCase().includes(searchPerSesi.toLowerCase())
    );

  const countHadir = logSesiList.filter((l) => l.status === "hadir").length;
  const countIzinSakit = logSesiList.filter((l) => l.status !== "hadir").length;
  const totalBelumAbsenRaw = anggotaList.filter((a) => !idAnggotaSudahAbsen.has(a.id)).length;

  const activePromptSesi = sesiList.find((s) => s.id === activePromptSesiId);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#F6F7F5] flex items-center justify-center px-4">
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
          <Loader2 size={18} className="animate-spin motion-reduce:animate-none text-emerald-700" />
          <span>Memverifikasi akses pengurus...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5] text-slate-900 pt-6 sm:pt-12 pb-20 px-3.5 sm:px-6 lg:px-8 font-sans relative">
      {deletingSesi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-hapus-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 id="modal-hapus-title" className="text-base font-extrabold text-slate-900">
                  Hapus Sesi Rapat
                </h2>
                <p className="text-xs text-rose-700 font-semibold">
                  Data yang dihapus tidak bisa dikembalikan.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Menghapus rapat <strong className="text-slate-900">&quot;{deletingSesi.nama_kegiatan}&quot;</strong> akan menghapus seluruh catatan kehadiran anggota di sesi tersebut.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingSesi(null)}
                className="min-h-11 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleHapusSesi}
                className="min-h-11 rounded-lg bg-rose-700 hover:bg-rose-800 py-2.5 text-xs font-bold text-white transition cursor-pointer inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
              >
                {isDeleting ? (
                  <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
                ) : (
                  "Ya, Hapus Rapat"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExtendModal && activePromptSesi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-extend-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 id="modal-extend-title" className="text-base font-extrabold text-slate-900">
                  Waktu Sesi Hampir Habis
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Sisa waktu kurang dari 1 menit.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Sesi <strong className="text-slate-900">&quot;{activePromptSesi.nama_kegiatan}&quot;</strong> segera ditutup. Tambah durasi sekarang?
            </p>

            <div className="space-y-1.5">
              <label htmlFor="input-tambah-menit" className="block text-xs font-bold text-slate-800">
                Tambah Durasi (Menit)
              </label>
              <input
                id="input-tambah-menit"
                type="number"
                min={1}
                max={120}
                value={tambahanMenit}
                onChange={(e) => setTambahanMenit(parseInt(e.target.value) || 1)}
                className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleTolakPerpanjang}
                className="min-h-11 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Biarkan Tutup
              </button>
              <button
                type="button"
                onClick={handlePerpanjangSesi}
                className="min-h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 py-2.5 text-xs font-bold text-white transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Tambah Waktu
              </button>
            </div>
          </div>
        </div>
      )}

      {realtimePopup.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3.5"
        >
          <div className="rounded-xl bg-slate-900 text-white p-3.5 sm:p-4 shadow-lg border border-slate-700 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <BellRing size={18} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Presensi Masuk
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      realtimePopup.status === "hadir"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    {realtimePopup.status}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-white truncate">{realtimePopup.nama}</p>
                <p className="text-[11px] text-slate-300 line-clamp-2">{realtimePopup.keterangan}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Tutup popup presensi masuk"
              onClick={() => setRealtimePopup((prev) => ({ ...prev, show: false }))}
              className="min-h-10 min-w-10 shrink-0 inline-flex items-center justify-center text-slate-300 hover:text-white transition rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-3.5"
        >
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-md border text-xs sm:text-sm font-semibold ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-700 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="min-h-10 min-w-10 shrink-0 inline-flex items-center justify-center rounded-lg hover:bg-black/5 transition cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 sm:pb-5">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 min-h-11 text-xs font-bold text-slate-700 hover:text-emerald-800 transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <ArrowLeft size={16} />
              <span>Dashboard Admin</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Presensi
              </h1>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setUnreadCount(0)}
                  className="min-h-9 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
                >
                  <Bell size={13} />
                  <span>+{unreadCount} Baru</span>
                  <Check size={12} />
                </button>
              )}
            </div>
          </div>

          <nav
            aria-label="Menu presensi admin"
            className="grid grid-cols-3 w-full md:w-auto md:inline-flex rounded-xl border border-slate-200 bg-white p-1 gap-1"
          >
            <button
              type="button"
              onClick={() => setActiveTab("rekap")}
              className={`min-h-11 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                activeTab === "rekap" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Rekapitulasi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sesi")}
              className={`min-h-11 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                activeTab === "sesi" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Sesi Rapat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`min-h-11 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                activeTab === "manual" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Input Susulan
            </button>
          </nav>
        </header>

        {activeTab === "rekap" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-5 sm:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Rekapitulasi Kehadiran
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pantau kehadiran kader per kegiatan maupun akumulasi keseluruhan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="grid grid-cols-2 sm:inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setRekapSubTab("per_sesi")}
                    className={`min-h-10 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      rekapSubTab === "per_sesi"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-700"
                    }`}
                  >
                    Per Acara Rapat
                  </button>
                  <button
                    type="button"
                    onClick={() => setRekapSubTab("keseluruhan")}
                    className={`min-h-10 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      rekapSubTab === "keseluruhan"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-700"
                    }`}
                  >
                    Akumulasi Total
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="min-h-11 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition cursor-pointer"
                  >
                    <FileText size={14} />
                    <span>Ekspor PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-11 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>
            </div>

            {rekapSubTab === "per_sesi" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="text-[11px] font-bold text-slate-600">Total Pengurus</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{anggotaList.length}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                    <span className="text-[11px] font-bold text-emerald-800">Hadir</span>
                    <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{countHadir}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                    <span className="text-[11px] font-bold text-amber-800">Izin / Sakit</span>
                    <p className="text-xl font-extrabold text-amber-900 mt-0.5">{countIzinSakit}</p>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                    <span className="text-[11px] font-bold text-rose-800">Belum Absen</span>
                    <p className="text-xl font-extrabold text-rose-900 mt-0.5">{totalBelumAbsenRaw}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                  <label
                    htmlFor="filter-sesi-select"
                    className="flex items-center gap-2 text-xs font-bold text-slate-800 shrink-0"
                  >
                    <Filter size={15} className="text-emerald-700" />
                    <span>Acara Kegiatan:</span>
                  </label>
                  <select
                    id="filter-sesi-select"
                    value={selectedSesiFilter}
                    onChange={(e) => handleSelectSesiChange(e.target.value)}
                    className="w-full sm:w-auto sm:min-w-65 max-w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus-visible:border-emerald-700"
                  >
                    {sesiList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_kegiatan} {s.is_active ? "(Aktif)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      aria-label="Cari nama atau bidang"
                      placeholder="Cari nama anggota atau bidang..."
                      value={searchPerSesi}
                      onChange={(e) => setSearchPerSesi(e.target.value)}
                      className="w-full min-h-11 rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus-visible:border-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-4 sm:flex gap-1.5 w-full sm:w-auto">
                    {(["semua", "hadir", "izin", "sakit"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`min-h-10.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize border transition cursor-pointer ${
                          statusFilter === st
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Users size={14} />
                    <span>Daftar Sudah Absen ({filteredLogSesiList.length} Orang)</span>
                  </h3>

                  {filteredLogSesiList.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs font-semibold text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
                      {searchPerSesi || statusFilter !== "semua"
                        ? "Data tidak ditemukan untuk filter yang dipilih."
                        : "Belum ada presensi yang masuk pada sesi ini."}
                    </div>
                  ) : (
                    <>
                      {/* Reflow card layout on mobile to prevent horizontal table scrolling */}
                      <div className="md:hidden space-y-2.5">
                        {filteredLogSesiList.map((log) => {
                          const memberInfo = log.anggota || anggotaMap.get(log.anggota_id);
                          return (
                            <article
                              key={log.id}
                              className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-slate-900 wrap-break-word">
                                    {memberInfo?.nama || "Anggota"}
                                  </h4>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    {memberInfo?.bidang || "-"}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase ${getStatusBadgeClass(
                                    log.status
                                  )}`}
                                >
                                  {log.status}
                                </span>
                              </div>

                              <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-700 wrap-break-word">
                                {log.keterangan || "-"}
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                                <span>Waktu Masuk</span>
                                <span className="font-mono font-bold text-slate-800">
                                  {formatWaktuRealtime(log.waktu_absen || log.created_at)}
                                </span>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                            <tr>
                              <th className="py-3 px-4">Nama Anggota</th>
                              <th className="py-3 px-4">Bidang</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4">Keterangan Verifikasi</th>
                              <th className="py-3 px-4 text-right">Waktu Masuk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredLogSesiList.map((log) => {
                              const memberInfo = log.anggota || anggotaMap.get(log.anggota_id);
                              return (
                                <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 font-bold text-slate-900">
                                    {memberInfo?.nama || "Anggota"}
                                  </td>
                                  <td className="py-3 px-4 text-slate-700">
                                    {memberInfo?.bidang || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase ${getStatusBadgeClass(
                                        log.status
                                      )}`}
                                    >
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-700">
                                    {log.keterangan || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-800 font-mono font-bold text-[11px]">
                                    {formatWaktuRealtime(log.waktu_absen || log.created_at)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {anggotaBelumAbsen.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 pt-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 mb-2.5">
                        Belum Absen ({anggotaBelumAbsen.length} Orang)
                      </h4>
                      <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto sm:max-h-none pr-1">
                        {anggotaBelumAbsen.map((a) => (
                          <span
                            key={a.id}
                            className="px-2.5 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                          >
                            {a.nama}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {rekapSubTab === "keseluruhan" && (
              <div className="space-y-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    aria-label="Cari anggota pada rekap akumulasi"
                    placeholder="Cari nama anggota atau bidang..."
                    value={searchKeseluruhan}
                    onChange={(e) => setSearchKeseluruhan(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus-visible:border-emerald-700"
                  />
                </div>

                {loading ? (
                  <div className="py-10 text-center font-semibold text-xs text-slate-600 flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin motion-reduce:animate-none text-emerald-700" />
                    <span>Memuat data rekapitulasi...</span>
                  </div>
                ) : filteredRekapList.length === 0 ? (
                  <div className="py-10 text-center text-xs font-semibold text-slate-600">
                    {searchKeseluruhan
                      ? "Nama anggota atau bidang tidak ditemukan."
                      : "Belum ada data rekapitulasi."}
                  </div>
                ) : (
                  <>
                    <div className="md:hidden space-y-2.5">
                      {filteredRekapList.map((r) => (
                        <article
                          key={r.anggota_id}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3"
                        >
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 wrap-break-word">
                              {r.nama}
                            </h3>
                            <p className="text-xs text-slate-600 mt-0.5">{r.bidang}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                            <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-1.5 px-2">
                              <span className="block text-[10px] font-bold text-emerald-800 uppercase">
                                Hadir
                              </span>
                              <span className="text-sm font-extrabold text-emerald-950">
                                {r.total_hadir}
                              </span>
                            </div>
                            <div className="rounded-lg bg-sky-50 border border-sky-200 py-1.5 px-2">
                              <span className="block text-[10px] font-bold text-sky-800 uppercase">
                                Izin
                              </span>
                              <span className="text-sm font-extrabold text-sky-950">
                                {r.total_izin}
                              </span>
                            </div>
                            <div className="rounded-lg bg-amber-50 border border-amber-200 py-1.5 px-2">
                              <span className="block text-[10px] font-bold text-amber-800 uppercase">
                                Sakit
                              </span>
                              <span className="text-sm font-extrabold text-amber-950">
                                {r.total_sakit}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Nama Anggota</th>
                            <th className="py-3 px-4">Bidang</th>
                            <th className="py-3 px-4 text-center">Total Hadir</th>
                            <th className="py-3 px-4 text-center">Total Izin</th>
                            <th className="py-3 px-4 text-center">Total Sakit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredRekapList.map((r) => (
                            <tr key={r.anggota_id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-bold text-slate-900">{r.nama}</td>
                              <td className="py-3 px-4 text-slate-700">{r.bidang}</td>
                              <td className="py-3 px-4 text-center text-emerald-800 font-bold">
                                {r.total_hadir}
                              </td>
                              <td className="py-3 px-4 text-center text-sky-800 font-bold">
                                {r.total_izin}
                              </td>
                              <td className="py-3 px-4 text-center text-amber-800 font-bold">
                                {r.total_sakit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "sesi" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            <section className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4 h-fit">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-emerald-700" />
                <span>Buka Sesi Rapat</span>
              </h2>

              <form onSubmit={handleBuatSesi} className="space-y-4">
                <div>
                  <label htmlFor="input-nama-kegiatan" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nama Kegiatan Rapat
                  </label>
                  <input
                    id="input-nama-kegiatan"
                    type="text"
                    required
                    placeholder="Contoh: Rapat Evaluasi Bidang"
                    value={namaKegiatan}
                    onChange={(e) => setNamaKegiatan(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none focus-visible:border-emerald-700"
                  />
                </div>

                <div>
                  <label htmlFor="select-metode-sesi" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Metode Verifikasi
                  </label>
                  <select
                    id="select-metode-sesi"
                    value={metodeSesi}
                    onChange={(e) => setMetodeSesi(e.target.value as MetodePresensi)}
                    className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus-visible:border-emerald-700"
                  >
                    <option value="gps">GPS Mandiri (Radius 100m)</option>
                    <option value="hybrid">Hybrid (GPS + Kiosk NFC)</option>
                    <option value="kiosk">Khusus Kiosk NFC & Kamera</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="input-durasi-menit" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Durasi Sesi (Menit)
                  </label>
                  <input
                    id="input-durasi-menit"
                    type="number"
                    min={1}
                    max={1440}
                    required
                    value={durasiMenit || ""}
                    onChange={(e) => setDurasiMenit(parseInt(e.target.value) || 0)}
                    className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus-visible:border-emerald-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-11.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-bold text-white transition cursor-pointer"
                >
                  {isSubmitting ? "Membuka Rapat..." : "Buka Sesi Rapat Baru"}
                </button>
              </form>
            </section>

            <section className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-emerald-700" />
                <span>Daftar & Riwayat Sesi</span>
              </h2>

              {sesiList.length === 0 ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-600">
                  Belum ada sesi rapat yang dibuat.
                </div>
              ) : (
                <div className="space-y-3">
                  {sesiList.map((s) => {
                    const sisaDetik = sisaDetikMap[s.id] ?? 0;

                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                      >
                        <div className="space-y-1.5 w-full sm:w-auto">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                s.is_active
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {s.is_active ? "Sesi Aktif" : "Selesai"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 uppercase">
                              {s.metode || "gps"}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1">
                              <KeyRound size={12} />
                              <span>Kode: {s.kode_akses}</span>
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 wrap-break-word">
                            {s.nama_kegiatan}
                          </h3>

                          {s.is_active && (
                            <div className="flex items-center gap-1.5 text-xs font-bold pt-0.5">
                              <Timer
                                size={14}
                                className={sisaDetik <= 60 ? "text-rose-700" : "text-emerald-700"}
                              />
                              <span className="text-slate-600 font-medium">Sisa Waktu:</span>
                              <span
                                className={`font-mono ${
                                  sisaDetik <= 60 ? "text-rose-700 font-extrabold" : "text-slate-900"
                                }`}
                              >
                                {formatTimeRemaining(sisaDetik)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className={`w-full sm:w-auto shrink-0 ${
                            s.is_active ? "grid grid-cols-3 sm:flex gap-2" : "flex justify-end"
                          }`}
                        >
                          {s.is_active && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePromptSesiId(s.id);
                                  setShowExtendModal(true);
                                }}
                                className="min-h-11 px-3 py-2 rounded-lg bg-white text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-50 transition cursor-pointer inline-flex items-center justify-center gap-1"
                              >
                                <Hourglass size={13} />
                                <span>+ Waktu</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTutupSesi(s.id)}
                                className="min-h-11 px-3 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer inline-flex items-center justify-center"
                              >
                                Tutup
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeletingSesi(s)}
                            aria-label={`Hapus sesi ${s.nama_kegiatan}`}
                            className="w-full sm:w-auto min-h-11 px-3 py-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer inline-flex items-center justify-center gap-1"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "manual" && (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-700" />
                <span>Presensi Susulan oleh Admin</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Catat kehadiran anggota yang datang terlambat atau mengalami kendala perangkat.
              </p>
            </div>

            <form onSubmit={handlePresensiManual} className="space-y-4">
              <div>
                <label htmlFor="select-sesi-manual" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Sesi Kegiatan
                </label>
                <select
                  id="select-sesi-manual"
                  value={selectedSesiManual}
                  onChange={(e) => setSelectedSesiManual(e.target.value)}
                  required
                  className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus-visible:border-emerald-700"
                >
                  <option value="">Pilih sesi kegiatan...</option>
                  {sesiList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_kegiatan} {s.is_active ? "(Aktif)" : "(Selesai)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="select-anggota-manual" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Anggota
                </label>
                <select
                  id="select-anggota-manual"
                  value={selectedAnggotaManual}
                  onChange={(e) => setSelectedAnggotaManual(e.target.value)}
                  required
                  className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus-visible:border-emerald-700"
                >
                  <option value="">Pilih nama anggota...</option>
                  {anggotaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama} ({a.bidang})
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="block text-xs font-bold text-slate-800 mb-1.5">
                  Status Kehadiran
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["hadir", "izin", "sakit"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusManual(st)}
                      aria-pressed={statusManual === st}
                      className={`min-h-11 rounded-lg text-xs font-bold capitalize border transition cursor-pointer ${
                        statusManual === st
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-11.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-bold text-white transition cursor-pointer"
              >
                {isSubmitting ? "Menyimpan Data..." : "Simpan Presensi Susulan"}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}