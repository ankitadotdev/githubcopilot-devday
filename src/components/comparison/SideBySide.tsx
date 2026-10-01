interface SideBySideProps {
  beforeImage: string;
  afterImage: string;
  highlightRegions?: Array<{
    id: string;
    region: { x: number; y: number; width: number; height: number };
    type: string;
    onClick?: () => void;
  }>;
  imageWidth?: number;
}

export function SideBySide({
  beforeImage,
  afterImage,
  highlightRegions = [],
  imageWidth = 1000,
}: SideBySideProps) {
  const containerWidth = imageWidth;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <div className="relative flex-shrink-0" style={{ width: containerWidth }}>
        <img src={beforeImage} alt="Before" className="w-full h-auto" />
        {highlightRegions.map((region) => (
          <div
            key={region.id}
            onClick={region.onClick}
            style={{
              position: "absolute",
              left: `${region.region.x * 100}%`,
              top: `${region.region.y * 100}%`,
              width: `${region.region.width * 100}%`,
              height: `${region.region.height * 100}%`,
            }}
            className={`border-2 cursor-pointer hover:opacity-50 transition ${
              region.type === "removed"
                ? "border-red-500 bg-red-100 bg-opacity-20"
                : region.type === "moved"
                  ? "border-orange-500 bg-orange-100 bg-opacity-20"
                  : "border-yellow-500 bg-yellow-100 bg-opacity-20"
            }`}
          />
        ))}
      </div>

      <div className="relative flex-shrink-0" style={{ width: containerWidth }}>
        <img src={afterImage} alt="After" className="w-full h-auto" />
        {highlightRegions.map((region) => (
          <div
            key={`after-${region.id}`}
            onClick={region.onClick}
            style={{
              position: "absolute",
              left: `${region.region.x * 100}%`,
              top: `${region.region.y * 100}%`,
              width: `${region.region.width * 100}%`,
              height: `${region.region.height * 100}%`,
            }}
            className={`border-2 cursor-pointer hover:opacity-50 transition ${
              region.type === "removed"
                ? "border-red-500 bg-red-100 bg-opacity-20"
                : region.type === "moved"
                  ? "border-orange-500 bg-orange-100 bg-opacity-20"
                  : "border-yellow-500 bg-yellow-100 bg-opacity-20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
