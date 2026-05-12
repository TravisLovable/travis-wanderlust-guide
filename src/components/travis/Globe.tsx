import * as React from "react";

/**
 * Orthographic globe — rotates in space, draws coarse country outlines, and
 * traces a great-circle arc from origin → destination as it spins.
 *
 * Port of design/src/globe.jsx. The LAND polygons are recognizable continents
 * sampled to lat/lng; not pixel-perfect, intentional. Rendered with hidden-
 * hemisphere culling so back-facing land is dropped per frame.
 */

type LatLng = [number, number];

const LAND: LatLng[][] = [
  // NORTH AMERICA
  [[71,-156],[70,-141],[69,-130],[60,-140],[55,-133],[48,-124],[40,-124],[34,-120],[32,-117],[30,-115],[23,-110],[22,-105],[18,-97],[21,-88],[18,-88],[15,-83],[9,-79],[8,-77],[12,-72],[15,-83],[20,-87],[26,-80],[30,-81],[35,-76],[40,-74],[43,-70],[45,-67],[47,-60],[50,-57],[53,-56],[55,-60],[60,-64],[63,-77],[68,-86],[73,-95],[72,-108],[68,-115],[70,-128],[71,-156]],
  // Greenland
  [[83,-30],[82,-20],[76,-17],[70,-22],[60,-43],[64,-50],[70,-54],[76,-60],[81,-62],[83,-50],[83,-30]],
  // SOUTH AMERICA
  [[12,-72],[10,-65],[6,-57],[4,-52],[0,-50],[-5,-35],[-10,-36],[-15,-39],[-22,-41],[-26,-48],[-30,-51],[-34,-54],[-38,-58],[-42,-65],[-48,-66],[-53,-69],[-55,-71],[-50,-73],[-45,-74],[-40,-73],[-33,-71],[-28,-71],[-20,-70],[-13,-76],[-6,-81],[0,-80],[6,-78],[9,-79],[12,-72]],
  // EUROPE + Iberia + Scandinavia
  [[71,28],[70,38],[65,40],[60,30],[58,22],[55,20],[54,13],[54,9],[57,8],[60,5],[63,6],[65,13],[68,15],[70,20],[70,25],[71,28],[71,22],[68,15],[62,6],[58,-1],[55,2],[51,2],[51,-4],[49,-5],[45,-2],[43,-9],[38,-9],[37,-7],[36,-6],[38,0],[41,3],[43,7],[45,14],[42,18],[40,23],[38,24],[36,23],[37,27],[40,27],[41,29],[42,29],[45,30],[47,30],[50,30],[55,30],[60,30],[65,40],[71,28]],
  // British Isles
  [[58,-5],[57,-3],[55,-2],[54,-1],[51,1],[50,-4],[53,-6],[55,-8],[58,-7],[58,-5]],
  // AFRICA
  [[37,-6],[34,-7],[33,-13],[28,-13],[22,-17],[15,-17],[12,-17],[9,-14],[5,-9],[4,-2],[5,1],[4,7],[2,9],[-1,9],[-5,12],[-13,13],[-17,11],[-22,14],[-30,17],[-34,18],[-34,25],[-32,28],[-28,32],[-22,36],[-15,40],[-10,40],[-3,42],[1,42],[9,45],[11,51],[12,43],[15,40],[20,37],[27,34],[31,32],[31,25],[22,25],[18,30],[25,30],[31,32],[33,35],[33,32],[35,32],[37,28],[37,-6]],
  // Madagascar
  [[-12,49],[-18,45],[-24,44],[-25,46],[-22,48],[-16,50],[-12,49]],
  // ASIA
  [[70,40],[73,65],[75,85],[77,105],[75,130],[70,140],[60,160],[55,165],[52,158],[45,142],[42,135],[40,130],[35,126],[32,130],[30,122],[22,113],[20,110],[15,108],[10,105],[2,102],[1,112],[5,118],[13,123],[17,121],[20,122],[25,121],[30,122],[35,120],[40,122],[45,131],[50,140],[55,160],[60,170],[66,178],[68,170],[70,155],[71,130],[71,100],[70,75],[65,58],[60,50],[55,45],[50,42],[45,40],[42,45],[38,45],[30,50],[25,55],[22,60],[15,50],[12,45],[13,43],[15,42],[20,40],[25,40],[30,35],[35,35],[40,42],[45,48],[50,55],[55,60],[60,65],[65,70],[70,75],[70,40]],
  // India
  [[35,76],[30,80],[27,88],[22,90],[21,86],[15,80],[10,78],[8,77],[10,73],[19,73],[22,70],[25,68],[32,74],[35,76]],
  // Indonesia (Sumatra/Java)
  [[2,95],[-2,100],[-6,105],[-8,112],[-9,120],[-5,120],[-1,110],[3,100],[2,95]],
  // Australia
  [[-10,142],[-11,130],[-13,127],[-18,122],[-22,114],[-30,115],[-35,117],[-35,130],[-37,140],[-39,146],[-37,150],[-33,152],[-28,153],[-20,149],[-16,145],[-10,142]],
  // New Zealand
  [[-35,173],[-40,176],[-45,168],[-47,167],[-42,171],[-35,173]],
  // Japan
  [[45,141],[42,145],[38,141],[35,140],[34,135],[35,132],[40,140],[45,141]],
  // Iceland
  [[66,-22],[64,-23],[63,-18],[65,-14],[66,-22]],
];

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/** Rotate (lat,lng) by yaw (longitude shift) and tilt (pitch). Returns unit-sphere [x,y,z]. */
function rotatePoint(lat: number, lng: number, yaw: number, tilt: number): [number, number, number] {
  const phi = lat * DEG;
  const lambda = (lng + yaw) * DEG;
  const x = Math.cos(phi) * Math.cos(lambda);
  const y = Math.cos(phi) * Math.sin(lambda);
  const z = Math.sin(phi);
  const t = tilt * DEG;
  const y2 = y * Math.cos(t) - z * Math.sin(t);
  const z2 = y * Math.sin(t) + z * Math.cos(t);
  return [x, y2, z2];
}

/** Orthographic projection. Returns [px, py, front]. */
function ortho(
  p: [number, number, number],
  cx: number,
  cy: number,
  r: number,
): [number, number, boolean] {
  const [x, y, z] = p;
  return [cx + y * r, cy - z * r, x > 0];
}

/** Great-circle interpolation between two lat/lng pairs. */
function greatCircle(a: LatLng, b: LatLng, n = 96): LatLng[] {
  const phi1 = a[0] * DEG;
  const lam1 = a[1] * DEG;
  const phi2 = b[0] * DEG;
  const lam2 = b[1] * DEG;
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((phi2 - phi1) / 2) ** 2 +
          Math.cos(phi1) * Math.cos(phi2) * Math.sin((lam2 - lam1) / 2) ** 2,
      ),
    );
  if (d === 0) return [a, b];
  const pts: LatLng[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(phi1) * Math.cos(lam1) + B * Math.cos(phi2) * Math.cos(lam2);
    const y = A * Math.cos(phi1) * Math.sin(lam1) + B * Math.cos(phi2) * Math.sin(lam2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);
    pts.push([
      Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD,
      Math.atan2(y, x) * RAD,
    ]);
  }
  return pts;
}

type RouteGlobeProps = {
  origin?: LatLng;
  originLabel?: string;
  dest: LatLng;
  destLabel?: string;
  size?: number;
  /** Arc traversal duration in ms. */
  arcDurationMs?: number;
};

export function RouteGlobe({
  origin = [40.64, -73.78],
  originLabel = "NYC · NEW YORK",
  dest,
  destLabel = "DEST",
  size = 420,
  arcDurationMs = 8600,
}: RouteGlobeProps) {
  const [yaw, setYaw] = React.useState(40);
  const [t, setT] = React.useState(0);

  React.useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setYaw(40 + elapsed * 8);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  React.useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / arcDurationMs);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [arcDurationMs]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const tilt = -18;

  // Land
  const landSegments = LAND.flatMap((poly, idx) => {
    const pts = poly.map(([la, ln]) => rotatePoint(la, ln, yaw, tilt));
    if (!pts.some((p) => p[0] > 0.02)) return [];
    const segs: Array<Array<[number, number]>> = [];
    let cur: Array<[number, number]> = [];
    pts.forEach((p) => {
      if (p[0] > 0) {
        const [px, py] = ortho(p, cx, cy, r);
        cur.push([px, py]);
      } else {
        if (cur.length > 1) segs.push(cur);
        cur = [];
      }
    });
    if (cur.length > 1) segs.push(cur);
    return segs.map((seg, i) => ({ key: `${idx}-${i}`, pts: seg }));
  });

  // Graticule
  const grid: Array<{ k: string; pts: Array<[number, number]> }> = [];
  for (let lng = -180; lng < 180; lng += 30) {
    const pts: Array<[number, number]> = [];
    for (let lat = -80; lat <= 80; lat += 5) {
      const p = rotatePoint(lat, lng, yaw, tilt);
      if (p[0] > 0) {
        const [px, py] = ortho(p, cx, cy, r);
        pts.push([px, py]);
      }
    }
    if (pts.length > 1) grid.push({ k: `m${lng}`, pts });
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: Array<[number, number]> = [];
    for (let lng = -180; lng <= 180; lng += 5) {
      const p = rotatePoint(lat, lng, yaw, tilt);
      if (p[0] > 0) {
        const [px, py] = ortho(p, cx, cy, r);
        pts.push([px, py]);
      }
    }
    if (pts.length > 1) grid.push({ k: `p${lat}`, pts });
  }

  // Equator
  const equatorPts: Array<[number, number]> = [];
  for (let lng = -180; lng <= 180; lng += 3) {
    const p = rotatePoint(0, lng, yaw, tilt);
    if (p[0] > 0) {
      const [px, py] = ortho(p, cx, cy, r);
      equatorPts.push([px, py]);
    }
  }

  // Arc
  const arcPts = React.useMemo(() => greatCircle(origin, dest, 120), [origin, dest]);
  const arcProjected = arcPts.map(([la, ln]) => {
    const p = rotatePoint(la, ln, yaw, tilt);
    const [px, py] = ortho(p, cx, cy, r);
    return [px, py, p[0] > 0] as [number, number, boolean];
  });
  const arcRuns: Array<Array<[number, number]>> = [];
  let run: Array<[number, number]> = [];
  arcProjected.forEach((p) => {
    if (p[2]) run.push([p[0], p[1]]);
    else {
      if (run.length > 1) arcRuns.push(run);
      run = [];
    }
  });
  if (run.length > 1) arcRuns.push(run);

  const arcIdx = Math.floor(t * arcProjected.length);
  const planePt = arcProjected[Math.min(arcProjected.length - 1, arcIdx)];

  // Pins
  const oR = rotatePoint(origin[0], origin[1], yaw, tilt);
  const dR = rotatePoint(dest[0], dest[1], yaw, tilt);
  const [oX, oY, oVis] = ortho(oR, cx, cy, r);
  const [dX, dY, dVis] = ortho(dR, cx, cy, r);

  const id = React.useId();

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-atmo`} cx="0.5" cy="0.5" r="0.58">
          <stop offset="78%" stopColor="oklch(0.78 0.09 220)" stopOpacity="0" />
          <stop offset="92%" stopColor="oklch(0.78 0.09 220)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="oklch(0.78 0.09 220)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sphere`} cx="0.38" cy="0.32" r="0.78">
          <stop offset="0%" stopColor="oklch(0.30 0.02 235)" />
          <stop offset="55%" stopColor="oklch(0.22 0.015 235)" />
          <stop offset="85%" stopColor="oklch(0.15 0.008 240)" />
          <stop offset="100%" stopColor="oklch(0.10 0.006 240)" />
        </radialGradient>
        <radialGradient id={`${id}-term`} cx="0.32" cy="0.30" r="0.85">
          <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0" />
          <stop offset="55%" stopColor="oklch(0 0 0)" stopOpacity="0" />
          <stop offset="100%" stopColor="oklch(0 0 0)" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      <circle cx={cx} cy={cy} r={r + 12} fill={`url(#${id}-atmo)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-sphere)`} />

      <g clipPath={`url(#${id}-clip)`}>
        {grid.map((g) => (
          <path
            key={g.k}
            d={"M" + g.pts.map((p) => p.join(",")).join(" L")}
            fill="none"
            stroke="oklch(1 0 0 / 0.05)"
            strokeWidth={0.7}
          />
        ))}
        {equatorPts.length > 1 && (
          <path
            d={"M" + equatorPts.map((p) => p.join(",")).join(" L")}
            fill="none"
            stroke="oklch(1 0 0 / 0.10)"
            strokeWidth={0.9}
            strokeDasharray="2 4"
          />
        )}
        {landSegments.map((seg) => (
          <path
            key={seg.key}
            d={"M" + seg.pts.map((p) => p.join(",")).join(" L")}
            fill="none"
            stroke="oklch(0.72 0.04 220 / 0.55)"
            strokeWidth={0.9}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-term)`} />
      </g>

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="oklch(1 0 0 / 0.18)"
        strokeWidth={0.9}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r + 0.6}
        fill="none"
        stroke="oklch(1 0 0 / 0.04)"
        strokeWidth={2}
      />

      {arcRuns.map((seg, i) => (
        <path
          key={`arc-glow-${i}`}
          d={"M" + seg.map((p) => p.join(",")).join(" L")}
          fill="none"
          stroke="var(--signal-ok)"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.12}
        />
      ))}
      {arcRuns.map((seg, i) => (
        <path
          key={`arc-${i}`}
          d={"M" + seg.map((p) => p.join(",")).join(" L")}
          fill="none"
          stroke="var(--signal-ok)"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.95}
        />
      ))}

      {planePt && planePt[2] && (
        <>
          <circle cx={planePt[0]} cy={planePt[1]} r={6} fill="var(--signal-ok)" opacity={0.25} />
          <circle cx={planePt[0]} cy={planePt[1]} r={2.4} fill="var(--signal-ok)" />
        </>
      )}

      {oVis && (
        <g>
          <circle cx={oX} cy={oY} r={9} fill="none" stroke="oklch(1 0 0 / 0.25)" strokeWidth={1} />
          <circle cx={oX} cy={oY} r={2.8} fill="var(--ink)" />
          <line x1={oX} y1={oY - 14} x2={oX} y2={oY - 5} stroke="var(--hair-strong)" />
          <text
            x={oX}
            y={oY - 18}
            fill="var(--ink-2)"
            fontSize={9.5}
            fontFamily="var(--mono)"
            letterSpacing="0.14em"
            textAnchor="middle"
          >
            {originLabel}
          </text>
        </g>
      )}

      {dVis && (
        <g>
          <circle cx={dX} cy={dY} r={14} fill="none" stroke="var(--signal-ok)" strokeWidth={1} opacity={0.6}>
            <animate attributeName="r" values="5;18;5" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={dX} cy={dY} r={3.2} fill="var(--signal-ok)" />
          <line x1={dX} y1={dY + 5} x2={dX} y2={dY + 18} stroke="var(--hair-strong)" />
          <text
            x={dX}
            y={dY + 30}
            fill="var(--ink)"
            fontSize={9.5}
            fontFamily="var(--mono)"
            letterSpacing="0.14em"
            textAnchor="middle"
          >
            {destLabel}
          </text>
        </g>
      )}
    </svg>
  );
}

type GlobePanelProps = Omit<RouteGlobeProps, "size"> & {
  size?: number;
};

export function GlobePanel({ size = 440, ...props }: GlobePanelProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        padding: "8px 0",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }}
        aria-hidden
      >
        {Array.from({ length: 52 }).map((_, i) => {
          const x = (i * 97) % 600;
          const y = (i * 53) % 500;
          const r = i % 5 === 0 ? 1.1 : 0.45;
          const op = 0.15 + ((i * 13) % 40) / 140;
          return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op} />;
        })}
      </svg>
      <RouteGlobe size={size} {...props} />
    </div>
  );
}
