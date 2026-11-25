"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  KeyRound,
  MapPin,
  Navigation,
  FileText,
  Loader2,
  ShieldCheck,
  CalendarCheck2,
  MonitorCheck,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Anggota = {
  id: string;
  nama: string;
  bidang: string;
};

type SesiAktif = {
  id: string;
  nama_kegiatan: string;
  waktu_tutup: string;
  metode: "gps" | "hybrid" | "kiosk";
};

type GpsReading = {
  lat: number;
  lng: number;
  accuracy: number;
  capturedAt: number;
};

// Coordinates of SMK Muhammadiyah 2 Cileungsi; 100m cap prevents off-campus check-ins.
const TARGET_LAT = -6.4307877443825925;
const TARGET_LNG = 106.96295062175803;
const MAX_RADIUS_METERS = 100;
const MAX_GPS_ACCURACY_METERS = 120;
const GPS_FRESHNESS_SECONDS = 90;

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getOrCreateDeviceHash(): string {
  const storageKey = "ipm_smkm2_device_id";
  let baseId = localStorage.getItem(storageKey);

  if (!baseId) {
    baseId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(storageKey, baseId);
  }

  const traits = `${navigator.platform || "web"}_${screen.width}x${screen.height}`;
  return `${baseId}_${traits}`.slice(0, 64);
}

export default function PresensiClient() {
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [sesiAktif, setSesiAktif] = useState<SesiAktif | null>(null);
  const [selectedAnggota, setSelectedAnggota] = useState("");
  const [kodeAkses, setKodeAkses] = useState("");
  const [status, setStatus] = useState<"hadir" | "izin" | "sakit">("hadir");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const [gpsReading, setGpsReading] = useState<GpsReading | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsAgeSeconds, setGpsAgeSeconds] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [lockedMemberName, setLockedMemberName] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
  }, []);

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const supabase = createClient();

      const [{ data: dataAnggota }, { data: dataSesi }] = await Promise.all([
        supabase
          .from("anggota")
          .select("id, nama, bidang")
          .order("nama", { ascending: true }),
        supabase
          .from("sesi_presensi")
          .select("id, nama_kegiatan, waktu_tutup, metode")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!isMounted) return;

      if (dataAnggota) setAnggotaList(dataAnggota);
      if (dataSesi) {
        const sesiTyped: SesiAktif = {
          id: dataSesi.id,
          nama_kegiatan: dataSesi.nama_kegiatan,
          waktu_tutup: dataSesi.waktu_tutup,
          metode: (dataSesi.metode as SesiAktif["metode"]) || "gps",
        };
        setSesiAktif(sesiTyped);

        const existingLock = localStorage.getItem(`ipm_presensi_done_${sesiTyped.id}`);
        if (existingLock) {
          setLockedMemberName(existingLock);
        }
      }
      setLoadingInit(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!gpsReading) return;
    const interval = setInterval(() => {
      const age = Math.floor((Date.now() - gpsReading.capturedAt) / 1000);
      setGpsAgeSeconds(age);
    }, 1000);
    return () => clearInterval(interval);
  }, [gpsReading]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser ini tidak mendukung fitur lokasi GPS.");
      return;
    }

    setGettingLocation(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        if (accuracy > MAX_GPS_ACCURACY_METERS) {
          setGettingLocation(false);
          setGpsReading(null);
          setDistance(null);
          setGpsError(
            `Sinyal GPS kurang akurat (±${accuracy}m). Nyalakan lokasi presisi tinggi dan coba lagi.`
          );
          return;
        }

        const dist = Math.round(getDistanceInMeters(lat, lng, TARGET_LAT, TARGET_LNG));
        setGpsReading({
          lat,
          lng,
          accuracy,
          capturedAt: Date.now(),
        });
        setGpsAgeSeconds(0);
        setDistance(dist);
        setGettingLocation(false);
      },
      (err) => {
        setGettingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Izin lokasi ditolak. Aktifkan GPS dan izinkan akses lokasi di browser.");
        } else {
          setGpsError("Gagal mengambil koordinat GPS. Pastikan GPS HP dalam keadaan aktif.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const isGpsExpired = gpsReading !== null && gpsAgeSeconds > GPS_FRESHNESS_SECONDS;
  const isWithinRadius =
    gpsReading !== null &&
    !isGpsExpired &&
    distance !== null &&
    distance <= MAX_RADIUS_METERS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!sesiAktif) {
      showToast("error", "Belum ada sesi rapat yang dibuka oleh pengurus.");
      return;
    }

    if (lockedMemberName) {
      showToast("error", "Perangkat ini sudah digunakan untuk presensi pada sesi ini.");
      return;
    }

    if (!selectedAnggota) {
      showToast("error", "Pilih nama kamu terlebih dahulu.");
      return;
    }

    if (status === "hadir") {
      if (!/^\d{6}$/.test(kodeAkses.trim())) {
        showToast("error", "Masukkan 6 digit kode akses sesi.");
        return;
      }

      if (!gpsReading) {
        showToast("error", "Klik tombol Deteksi Lokasi Saya terlebih dahulu.");
        return;
      }

      if (isGpsExpired) {
        showToast("error", "Koordinat GPS sudah kedaluwarsa. Klik Cek Ulang lokasi.");
        return;
      }

      if (distance !== null && distance > MAX_RADIUS_METERS) {
        showToast(
          "error",
          `Posisi di luar radius rapat (${distance} meter, maksimal ${MAX_RADIUS_METERS}m).`
        );
        return;
      }
    } else if (keterangan.trim().length < 3) {
      showToast("error", "Tuliskan alasan izin atau sakit minimal 3 karakter.");
      return;
    }

    setLoading(true);
    const deviceHash = getOrCreateDeviceHash();

    try {
      const response = await fetch("/api/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId: sesiAktif.id,
          anggotaId: selectedAnggota,
          status,
          kodeAkses: kodeAkses.trim(),
          keterangan: keterangan.trim(),
          latitude: gpsReading?.lat ?? null,
          longitude: gpsReading?.lng ?? null,
          accuracy: gpsReading?.accuracy ?? null,
          gpsTimestamp: gpsReading?.capturedAt ?? null,
          deviceHash,
        }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setLoading(false);
        showToast("error", result.error || "Presensi gagal diproses.");
        return;
      }

      const member = anggotaList.find((a) => a.id === selectedAnggota);
      const memberLabel = member ? `${member.nama} (${member.bidang})` : "Pengurus";
      localStorage.setItem(`ipm_presensi_done_${sesiAktif.id}`, memberLabel);
      setLockedMemberName(memberLabel);

      setLoading(false);
      showToast(
        "success",
        status === "hadir"
          ? "Presensi berhasil tercatat di area rapat."
          : "Pengajuan izin atau sakit berhasil dikirim."
      );

      setKodeAkses("");
      setSelectedAnggota("");
      setKeterangan("");
      setGpsReading(null);
      setDistance(null);
    } catch {
      setLoading(false);
      showToast("error", "Koneksi terputus. Periksa jaringan internet kamu.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5] text-slate-900 pt-16 pb-16 px-4 sm:px-6 font-sans">
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 shadow-md border text-xs sm:text-sm font-semibold ${
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
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              aria-label="Tutup notifikasi"
              className="min-h-9 min-w-9 inline-flex items-center justify-center rounded-lg hover:bg-black/5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-11 px-1 text-xs font-bold text-slate-700 hover:text-emerald-800 transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <header className="space-y-1.5 border-b border-slate-100 pb-5">
            <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              PR IPM SMK Muda Cileungsi
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Presensi Rapat
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Isi kehadiran langsung di lokasi kegiatan dengan verifikasi GPS.
            </p>
          </header>

          {loadingInit ? (
            <div className="py-6 text-center text-xs font-semibold text-slate-600 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin motion-reduce:animate-none text-emerald-700" />
              <span>Memeriksa sesi rapat aktif...</span>
            </div>
          ) : sesiAktif ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <CalendarCheck2 size={20} />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-emerald-800">
                    Sesi Aktif
                  </span>
                  <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                    Mode {sesiAktif.metode}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 leading-snug">
                  {sesiAktif.nama_kegiatan}
                </h2>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900 leading-relaxed">
              Belum ada sesi rapat yang dibuka oleh sekretaris atau admin.
            </div>
          )}

          {sesiAktif && sesiAktif.metode === "kiosk" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center space-y-2.5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <MonitorCheck size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Presensi Melalui Meja Registrasi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesi ini menggunakan verifikasi kartu KTA NFC dan kamera di meja panitia. Silakan langsung menuju meja registrasi.
              </p>
            </div>
          ) : lockedMemberName ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Lock size={16} className="text-emerald-700 shrink-0" />
                <span>Presensi Tercatat dari Perangkat Ini</span>
              </div>
              <p className="text-xs text-emerald-900/90 leading-relaxed">
                Atas nama <strong>{lockedMemberName}</strong>. Satu perangkat hanya dapat digunakan satu kali per sesi rapat.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="select-anggota"
                  className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"
                >
                  <UserCheck size={14} className="text-emerald-700" />
                  <span>Nama Pengurus</span>
                </label>
                <select
                  id="select-anggota"
                  value={selectedAnggota}
                  onChange={(e) => setSelectedAnggota(e.target.value)}
                  required
                  className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20"
                >
                  <option value="">Pilih nama kamu...</option>
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
                      onClick={() => setStatus(st)}
                      aria-pressed={status === st}
                      className={`min-h-11 rounded-lg text-xs font-bold capitalize border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                        status === st
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </fieldset>

              {status === "hadir" ? (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <MapPin size={14} className="text-emerald-700 shrink-0" />
                        <span>Lokasi GPS (Maks {MAX_RADIUS_METERS}m)</span>
                      </span>
                      {gpsReading && (
                        <button
                          type="button"
                          onClick={requestLocation}
                          disabled={gettingLocation}
                          className="min-h-9 px-2 text-xs text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer font-bold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                        >
                          <Navigation size={12} />
                          <span>{gettingLocation ? "Mendeteksi..." : "Cek Ulang"}</span>
                        </button>
                      )}
                    </div>

                    {gettingLocation ? (
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium py-2">
                        <Loader2 size={14} className="animate-spin motion-reduce:animate-none text-emerald-700" />
                        <span>Mengambil koordinat GPS presisi...</span>
                      </div>
                    ) : gpsReading && distance !== null ? (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span
                            className={
                              isWithinRadius ? "text-emerald-800" : "text-rose-700"
                            }
                          >
                            {isGpsExpired
                              ? "Koordinat kedaluwarsa, cek ulang"
                              : distance <= MAX_RADIUS_METERS
                              ? "Dalam area rapat"
                              : `Di luar radius (${distance}m)`}
                          </span>
                          <span className="font-mono text-slate-700">
                            {distance}m (±{gpsReading.accuracy}m)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {isGpsExpired
                            ? "Masa berlaku GPS 90 detik telah habis."
                            : `Berlaku ${Math.max(0, GPS_FRESHNESS_SECONDS - gpsAgeSeconds)} detik lagi.`}
                        </p>
                      </div>
                    ) : gpsError ? (
                      <div className="space-y-2.5 pt-0.5">
                        <p className="text-xs text-rose-700 font-medium leading-snug">
                          {gpsError}
                        </p>
                        <button
                          type="button"
                          onClick={requestLocation}
                          className="w-full min-h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                        >
                          <Navigation size={14} />
                          <span>Coba Deteksi Lagi</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={requestLocation}
                        className="w-full min-h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                      >
                        <Navigation size={14} />
                        <span>Deteksi Lokasi Saya</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="input-kode-akses"
                      className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"
                    >
                      <KeyRound size={14} className="text-emerald-700" />
                      <span>Kode Akses Rapat (6 Digit)</span>
                    </label>
                    <input
                      id="input-kode-akses"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      placeholder="Masukkan 6 digit kode"
                      value={kodeAkses}
                      onChange={(e) => setKodeAkses(e.target.value.replace(/\D/g, ""))}
                      className="w-full min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-base font-extrabold tracking-widest text-slate-900 placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-500 outline-none transition focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label
                    htmlFor="input-keterangan"
                    className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <FileText size={14} className="text-amber-700" />
                    <span>Alasan {status === "izin" ? "Izin" : "Sakit"}</span>
                  </label>
                  <textarea
                    id="input-keterangan"
                    rows={3}
                    required
                    maxLength={250}
                    placeholder={`Tuliskan alasan ${status} kamu secara singkat...`}
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20 resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !sesiAktif}
                className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>
                      {status === "hadir"
                        ? "Kirim Presensi"
                        : `Kirim Pengajuan ${status === "izin" ? "Izin" : "Sakit"}`}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}