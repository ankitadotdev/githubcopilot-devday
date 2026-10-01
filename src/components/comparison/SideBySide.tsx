import type { ChangeType } from "../../types/analysis";

interface HighlightRegion {
  id: string;
  region: { x: number; y: number; width: number; height: number };
  type: ChangeType | string;
  index: number;
  onClick?: () => void;
}

interface SideBySideProps {
  beforeImage: string;
  afterImage: string;
  highlightRegions?: HighlightRegion[];
  selectedRegionId?: string | null;
}

const regionBorderColor: Record<string, string> = {
  removed: "#dc2626",
  added: "#16a34a",
  moved: "#d97706",
  modified: "#2563eb",
  uncertain: "#6b7280",
  damaged: "#eab308",
};

function RegionOverlay({
  region,
  selected,
}: {
  region: HighlightRegion;
  selected: boolean;
}) {
  const color = regionBorderColor[region.type] || regionBorderColor.uncertain;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        region.onClick?.();
      }}
      className="region-marker"
      style={{
        left: `${region.region.x * 100}%`,
        top: `${region.region.y * 100}%`,
        width: `${region.region.width * 100}%`,
        height: `${region.region.height * 100}%`,
        borderColor: color,
        backgroundColor: selected
          ? `${color}18`
          : `${color}08`,
        boxShadow: selected ? `0 0 0 3px ${color}30` : "none",
      }}
    >
      <span
        className="region-number"
        style={{ backgroundColor: color }}
      >
        {region.index + 1}
      </span>
    </div>
  );
}

export function SideBySide({
  beforeImage,
  afterImage,
  highlightRegions = [],
  selectedRegionId,
}: SideBySideProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100">
      {/* Before */}
      <div className="relative">
        <div className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded text-xs font-semibold z-10 pointer-events-none">
          BEFORE
        </div>
        <img
          src={beforeImage}
          alt="Before"
          className="w-full h-auto block"
        />
        {highlightRegions.map((r) => (
          <RegionOverlay
            key={r.id}
            region={r}
            selected={selectedRegionId === r.id}
          />
        ))}
      </div>

      {/* After */}
      <div className="relative">
        <div className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded text-xs font-semibold z-10 pointer-events-none">
          AFTER
        </div>
        <img
          src={afterImage}
          alt="After"
          className="w-full h-auto block"
        />
        {highlightRegions.map((r) => (
          <RegionOverlay
            key={`after-${r.id}`}
            region={r}
            selected={selectedRegionId === r.id}
          />
        ))}
      </div>
    </div>
  );
}
