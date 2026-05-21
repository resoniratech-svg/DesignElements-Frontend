import { useDivision } from "../context/DivisionContext";
import { DIVISIONS } from "../constants/divisions";

export default function DivisionSwitcher() {
  const { activeDivision, setActiveDivision, canSwitchDivision } = useDivision();

  if (!canSwitchDivision) {
    return null;
  }

  return (
    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner overflow-hidden">
      <button
        onClick={() => setActiveDivision("all")}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 uppercase tracking-tight ${
          activeDivision === "all"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        All Sectors
      </button>
      {DIVISIONS.map((div) => (
        <button
          key={div.id}
          onClick={() => setActiveDivision(div.id)}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center gap-2 uppercase tracking-tight ${
            activeDivision === div.id
              ? "bg-white shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
          style={{ color: activeDivision === div.id ? div.color : undefined }}
        >
          <span>{div.icon}</span>
          <span className="hidden xl:inline">{div.label.replace(" Sector", "")}</span>
        </button>
      ))}
    </div>
  );
}
