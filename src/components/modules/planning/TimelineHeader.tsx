"use client";

interface TimelineHeaderProps {
  dateDebut: Date;
  dateFin: Date;
  colWidth: number;
}

interface SlotInfo {
  date: Date;
  label: string;
  dayKey: string;
  dayLabel: string;
}

export function generateSlots(dateDebut: Date, dateFin: Date): SlotInfo[] {
  const slots: SlotInfo[] = [];
  const joursSemaine = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  const step = 30 * 60 * 1000; // 30 min

  for (let t = start; t < end; t += step) {
    const d = new Date(t);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const h = d.getHours();
    const m = d.getMinutes();
    const label = m === 0 ? `${h}h` : `${h}h${pad(m)}`;
    const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const dayLabel = `${joursSemaine[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    slots.push({ date: d, label, dayKey, dayLabel });
  }
  return slots;
}

export function TimelineHeader({ dateDebut, dateFin, colWidth }: TimelineHeaderProps) {
  const slots = generateSlots(dateDebut, dateFin);

  // Group slots by day for the merged day row
  const days: { dayLabel: string; count: number }[] = [];
  let currentDay = "";
  for (const slot of slots) {
    if (slot.dayKey !== currentDay) {
      days.push({ dayLabel: slot.dayLabel, count: 1 });
      currentDay = slot.dayKey;
    } else {
      days[days.length - 1].count++;
    }
  }

  return (
    <div className="sticky top-0 z-20">
      {/* Day row */}
      <div className="flex" style={{ backgroundColor: "#004489" }}>
        {days.map((day, i) => (
          <div
            key={i}
            className="text-white text-xs font-bold text-center border-r flex items-center justify-center"
            style={{
              width: day.count * colWidth,
              minWidth: day.count * colWidth,
              borderColor: "rgba(255,255,255,0.2)",
              height: 24,
            }}
          >
            {day.dayLabel}
          </div>
        ))}
      </div>
      {/* Hour row */}
      <div className="flex" style={{ backgroundColor: "#003370" }}>
        {slots.map((slot, i) => (
          <div
            key={i}
            className="text-white text-center border-r shrink-0 flex items-center justify-center"
            style={{
              width: colWidth,
              minWidth: colWidth,
              borderColor: "rgba(255,255,255,0.15)",
              height: 22,
              fontSize: colWidth < 20 ? 8 : 10,
            }}
          >
            {colWidth >= 20 || slot.date.getMinutes() === 0 ? slot.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
