import { createGenericIndicatorPage } from "./generic-indicator.js";
import { formatTime } from "../../utils/formatter.js";

const kat = (v) => {
  if (v === "cepat") return '<span class="badge badge-primary">Lebih Cepat</span>';
  if (v === "tepat_waktu") return '<span class="badge badge-success">Tepat Waktu (Antara Jam Mulai - Selesai)</span>';
  if (v === "terlambat") return '<span class="badge badge-warning">Terlambat (> Jam Selesai)</span>';
  if (v === "tidak_visit") return '<span class="badge badge-danger">Tidak Visit</span>';
  return '<span class="badge badge-danger">Sangat Terlambat</span>';
};

const sesOptions = [
  { value: "dr. Ismail Yusuf, Sp.PD", label: "dr. Ismail Yusuf" },
  { value: "dr. Aries Kuswanda, Sp.PD", label: "dr. Aries Kuswanda" },
  { value: "dr. Ditto Ruldifar Pribadi, Sp.B", label: "dr. Ditto Ruldifar Pribadi" },
  { value: "dr. Yudi Rinaldi, M.Biomed,MARS., Sp.B", label: "dr. Yudi Rinaldi" },
  { value: "dr. Imas Masitoh, Sp.OG", label: "dr. Imas Masitoh" },
  { value: "dr. David Mallisa Allorante, Sp.OG", label: "dr. David Mallisa Allorante" },
  { value: "dr. H. Didi Sukandi, Sp.A", label: "dr. H. Didi Sukandi" },
  { value: "dr. Ani Yuniar, Sp.A", label: "dr. Ani Yuniar" },
  { value: "dr. Muhammad Baihaqy Ibnu Hakim, Sp.U", label: "dr. Muhammad Baihaqy Ibnu Hakim" },
  { value: "dr. Henny Herawati, Sp.N", label: "dr. Henny Herawati" },
  { value: "dr. Diding Sawaludin, Sp.KJ., M.Kes", label: "dr. Diding Sawaludin" },
  { value: "dr. Fatimah Alzahra, Sp.JP", label: "dr. Fatimah Alzahra" },
  { value: "dr. Dora Apriani, Sp.M", label: "dr. Dora Apriani" },
  { value: "dr. Dira Megiani Rosti, Sp.M", label: "dr. Dira Megiani Rosti" },
  { value: "dr. Evata Putri Ikromi, Sp.P", label: "dr. Evata Putri Ikromi" },
  { value: "dr. Nurhayati, Sp.P (K) Onk. FISR", label: "dr. Nurhayati" },
  { value: "dr. Adi Januar Akbar, Sp.THT-KL", label: "dr. Adi Januar Akbar" },
  { value: "dr. David Simorangkir, Sp.OT", label: "dr. David Simorangkir" },
  { value: "dr. Euis Kartika, Sp.Rad", label: "dr. Euis Kartika" },
  { value: "drg. Anggun Retnoningtyas", label: "drg. Anggun Retnoningtyas" },
  { value: "drg. Hamidah Az Zahra", label: "drg. Hamidah Az Zahra" },
  { value: "dr. Nita Theresia Reyne S, Sp.KFR.,M.Kes", label: "dr. Nita Theresia Reyne S" },
];

function formatVisitTime(val) {
  if (!val) return "-";
  const str = String(val);
  if (str.includes("T")) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
  }
  if (str.includes(":")) {
    const parts = str.split(":");
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return str;
}

export default createGenericIndicatorPage({
  title: "Visit Dokter Spesialis",
  subtitle: "Kepatuhan waktu visit dokter spesialis pada pasien rawat inap",
  endpoint: "/visit-dokter",
  metricType: "compliance",
  numeratorLabel: "PATUH (N1)",
  numerator2Label: "PATUH (N2)",
  modalWidth: "700px",
  columns: [
    { label: "Nama DPJP", key: "nama_dpjp" },
    { label: "Nama Pasien", key: "nama_pasien" },
    { label: "No RM", key: "no_rm" },
    { label: "Mulai-Selesai", key: "jam_mulai_selesai" },
    { label: "Jam Visit", key: "jam_visit", render: (r) => formatVisitTime(r.jam_visit) },
    { label: "Kategori Waktu", key: "kategori_visit", render: (r) => kat(r.kategori_visit) },
  ],
  beforeSubmit: (formData) => {
    const startHour = document.getElementById("visit-start-hour")?.value || "08";
    const startMin = document.getElementById("visit-start-min")?.value || "00";
    const endHour = document.getElementById("visit-end-hour")?.value || "08";
    const endMin = document.getElementById("visit-end-min")?.value || "15";
    formData.jam_mulai_selesai = `${startHour}:${startMin} - ${endHour}:${endMin}`;

    const actualHour = document.getElementById("visit-actual-hour")?.value || "08";
    const actualMin = document.getElementById("visit-actual-min")?.value || "00";
    formData.jam_visit = `${actualHour}:${actualMin}`;
  },
  rowClass: (r) => (r.kategori_visit === "tepat_waktu" ? "" : "row-danger"),
  fields: [
    { name: "nama_dpjp", label: "Nama DPJP (Dokter Spesialis)", type: "select", options: sesOptions, required: true, row: 1 },
    { name: "nama_pasien", label: "Nama Pasien", type: "text", required: true, row: 1 },
    { name: "no_rm", label: "No RM", type: "text", required: true, row: 2 },
    {
      name: "jam_mulai_selesai",
      label: "Durasi Mulai-Selesai",
      type: "custom",
      required: true,
      row: 2,
      render: (val) => {
        let startHour = "08",
          startMin = "00",
          endHour = "08",
          endMin = "15";
        if (val && val.includes("-")) {
          const parts = val.split("-").map((p) => p.trim());
          if (parts[0] && parts[0].includes(":")) {
            const startParts = parts[0].split(":");
            startHour = startParts[0];
            startMin = startParts[1];
          }
          if (parts[1] && parts[1].includes(":")) {
            const endParts = parts[1].split(":");
            endHour = endParts[0];
            endMin = endParts[1];
          }
        }

        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
        const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

        const startHourSelect = `<select id="visit-start-hour" class="form-control" style="width: 75px; display: inline-block;">
          ${hours.map((h) => `<option value="${h}" ${h === startHour ? "selected" : ""}>${h}</option>`).join("")}
        </select>`;

        const startMinSelect = `<select id="visit-start-min" class="form-control" style="width: 75px; display: inline-block;">
          ${minutes.map((m) => `<option value="${m}" ${m === startMin ? "selected" : ""}>${m}</option>`).join("")}
        </select>`;

        const endHourSelect = `<select id="visit-end-hour" class="form-control" style="width: 75px; display: inline-block;">
          ${hours.map((h) => `<option value="${h}" ${h === endHour ? "selected" : ""}>${h}</option>`).join("")}
        </select>`;

        const endMinSelect = `<select id="visit-end-min" class="form-control" style="width: 75px; display: inline-block;">
          ${minutes.map((m) => `<option value="${m}" ${m === endMin ? "selected" : ""}>${m}</option>`).join("")}
        </select>`;

        return `
          <div class="form-group">
            <label class="form-label">Durasi Mulai-Selesai <span class="required">*</span></label>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${startHourSelect}
              <span>:</span>
              ${startMinSelect}
              <span style="margin: 0 4px; font-weight: 500; color: var(--text-secondary);">s.d.</span>
              ${endHourSelect}
              <span>:</span>
              ${endMinSelect}
            </div>
          </div>
        `;
      },
    },
    {
      name: "jam_visit",
      label: "Jam Visit Aktual (HH:MM)",
      type: "custom",
      required: true,
      row: 3,
      render: (val) => {
        let visitHour = "08",
          visitMin = "00";
        if (val) {
          const formatted = formatVisitTime(val);
          if (formatted && formatted.includes(":")) {
            const parts = formatted.split(":");
            visitHour = parts[0].padStart(2, "0");
            visitMin = parts[1].padStart(2, "0");
          }
        }

        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
        const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

        const hourSelect = `<select id="visit-actual-hour" class="form-control" style="width: 75px; display: inline-block;">
          ${hours.map((h) => `<option value="${h}" ${h === visitHour ? "selected" : ""}>${h}</option>`).join("")}
        </select>`;

        const minSelect = `<select id="visit-actual-min" class="form-control" style="width: 75px; display: inline-block;">
          ${minutes.map((m) => `<option value="${m}" ${m === visitMin ? "selected" : ""}>${m}</option>`).join("")}
        </select>`;

        return `
          <div class="form-group">
            <label class="form-label">Jam Visit Aktual <span class="required">*</span></label>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${hourSelect}
              <span>:</span>
              ${minSelect}
            </div>
          </div>
        `;
      },
    },
    {
      name: "kategori_visit",
      label: "Kategori Waktu",
      type: "select",
      required: true,
      options: [
        { value: "cepat", label: "Kurang dari jam mulai" },
        { value: "tepat_waktu", label: "Tepat Waktu (di Antara jam mulai - selesai)" },
        { value: "terlambat", label: "Terlambat (setelah jam selesai)" },
        { value: "tidak_visit", label: "Tidak Visit" },
      ],
      row: 3,
    },
  ],
});
