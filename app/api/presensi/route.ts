import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PresensiPayload = {
  sesiId?: string;
  anggotaId?: string;
  status?: "hadir" | "izin" | "sakit";
  kodeAkses?: string;
  keterangan?: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  gpsTimestamp?: number | null;
  deviceHash?: string;
};

const MAX_GPS_AGE_MS = 90_000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PresensiPayload;
    const {
      sesiId,
      anggotaId,
      status,
      kodeAkses,
      keterangan,
      latitude,
      longitude,
      accuracy,
      gpsTimestamp,
      deviceHash,
    } = body;

    if (!sesiId || !anggotaId || !status) {
      return NextResponse.json(
        { error: "Data sesi, anggota, dan status wajib diisi." },
        { status: 400 }
      );
    }

    if (!["hadir", "izin", "sakit"].includes(status)) {
      return NextResponse.json(
        { error: "Status kehadiran tidak valid." },
        { status: 400 }
      );
    }

    if (!deviceHash || deviceHash.length < 16) {
      return NextResponse.json(
        { error: "Identitas perangkat tidak valid. Muat ulang halaman." },
        { status: 400 }
      );
    }

    if (status === "hadir") {
      if (!kodeAkses || !/^\d{6}$/.test(kodeAkses.trim())) {
        return NextResponse.json(
          { error: "Kode akses harus terdiri dari 6 digit angka." },
          { status: 400 }
        );
      }

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return NextResponse.json(
          { error: "Koordinat GPS belum terdeteksi." },
          { status: 400 }
        );
      }

      if (!gpsTimestamp || Date.now() - gpsTimestamp > MAX_GPS_AGE_MS) {
        return NextResponse.json(
          { error: "Data lokasi sudah kedaluwarsa. Klik deteksi lokasi ulang." },
          { status: 400 }
        );
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc("submit_presensi_aman", {
      p_sesi_id: sesiId,
      p_anggota_id: anggotaId,
      p_status: status,
      p_kode_akses: status === "hadir" ? kodeAkses?.trim() : null,
      p_keterangan: status !== "hadir" ? keterangan?.trim() || null : null,
      p_latitude: status === "hadir" ? latitude : null,
      p_longitude: status === "hadir" ? longitude : null,
      p_accuracy:
        status === "hadir" && typeof accuracy === "number"
          ? Math.round(accuracy)
          : null,
      p_device_hash: deviceHash.slice(0, 64),
    });

    if (error) {
      return NextResponse.json(
        { error: "Terjadi gangguan saat memvalidasi presensi." },
        { status: 500 }
      );
    }

    const result = data as { ok?: boolean; error?: string } | null;

    if (!result?.ok) {
      return NextResponse.json(
        { error: result?.error || "Presensi ditolak oleh sistem." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      { status: 400 }
    );
  }
}