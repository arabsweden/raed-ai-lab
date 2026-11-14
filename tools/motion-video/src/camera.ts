import { Easing } from "remotion";
import { FX, FY } from "./theme";
import { T } from "./timing";

export type Cam = { x: number; y: number; rot: number; s: number; fy: number };

// يحوّل نقطة من إحداثيات محطة (كأنها الشاشة) إلى إحداثيات اللوحة
export const localToBoard = (cam: Cam, px: number, py: number) => {
  const dx = (px - FX) / cam.s;
  const dy = (py - FY) / cam.s;
  const t = (-cam.rot * Math.PI) / 180;
  return {
    x: cam.x + dx * Math.cos(t) - dy * Math.sin(t),
    y: cam.y + dx * Math.sin(t) + dy * Math.cos(t),
  };
};

// مواقع المحطات على اللوحة
const A = 1350;
const B = 3450;
const R1 = 1100;
const R2 = 3700;
const R3 = 6300;

export const BOARD_W = 4500;
export const BOARD_H = 7800;

export const S1: Cam = { x: B, y: R1, rot: 0, s: 1, fy: FY };
export const S2: Cam = { x: A, y: R1, rot: 0, s: 1, fy: FY };
export const S3: Cam = { x: A, y: R2, rot: 90, s: 1, fy: FY };
// الشاشة الصغيرة داخل محطة 3: أعلاها اليسار (450, 950) ومقاسها 180×320
export const PHONE = { left: 450, top: 950, w: 180, h: 320 };
const ZOOM = 1080 / PHONE.w; // 6
const p4 = localToBoard(S3, PHONE.left + FX / ZOOM, PHONE.top + FY / ZOOM);
export const S4: Cam = { x: p4.x, y: p4.y, rot: 90, s: ZOOM, fy: FY };
export const S5: Cam = { x: B, y: R2, rot: 0, s: 1, fy: FY };
export const S6: Cam = { x: B, y: R3, rot: 0, s: 1, fy: FY };
export const WORDMARK = { x: A + 50, y: R3 + 150 };
export const OVERVIEW: Cam = { x: 2280, y: 3880, rot: 0, s: 0.25, fy: 960 };

type Key = {
  f: number;
  cam: Cam;
  ease?: (t: number) => number;
  tilt?: number; // ميلان إضافي في منتصف الحركة
};

const whip = Easing.bezier(0.7, 0, 0.2, 1);
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const dive = Easing.bezier(0.55, 0, 0.25, 1);

// دفعة كاميرا بطيئة أثناء الوقوف على المحطة (تكبير خفيف ما يكشف الحواف)
const push = (c: Cam, k: number): Cam => ({ ...c, s: c.s * k });
const hold = Easing.inOut(Easing.sin);

export const KEYS: Key[] = [
  { f: 0, cam: S1 },
  { f: T.whip[0], cam: push(S1, 1.03), ease: hold },
  { f: T.whip[1], cam: S2, ease: whip }, // سحبة كاميرا سريعة
  { f: T.roll[0], cam: push(S2, 1.035), ease: hold },
  { f: T.roll[1], cam: S3, ease: smooth }, // لفّة 90 درجة
  { f: T.dive[0], cam: push(S3, 1.03), ease: hold },
  { f: T.dive[1], cam: S4, ease: dive }, // غوص جوّا مربع صغير
  { f: T.out[0], cam: push(S4, 1.03), ease: hold },
  { f: T.out[1], cam: S5, ease: smooth },
  { f: T.tilt[0], cam: push(S5, 1.03), ease: hold },
  { f: T.tilt[1], cam: S6, ease: smooth, tilt: -14 }, // ميلان الكاميرا
  { f: T.pull[0], cam: push(S6, 1.03), ease: hold },
  { f: T.pull[1], cam: OVERVIEW, ease: smooth }, // الكاميرا ترجع ورا
  { f: T.end, cam: push(OVERVIEW, 0.96), ease: hold },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const camAt = (frame: number): Cam => {
  if (frame <= KEYS[0].f) return KEYS[0].cam;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const k0 = KEYS[i];
    const k1 = KEYS[i + 1];
    if (frame >= k0.f && frame <= k1.f) {
      const t = (frame - k0.f) / (k1.f - k0.f);
      const u = (k1.ease ?? smooth)(t);
      const a = k0.cam;
      const b = k1.cam;
      const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), u));
      // الطرف الأكبر تكبيرًا يتحرك خطيًا على الشاشة → زووم بلا انزلاق
      let x: number;
      let y: number;
      if (b.s >= a.s) {
        x = b.x + (a.x - b.x) * (1 - u) * (a.s / s);
        y = b.y + (a.y - b.y) * (1 - u) * (a.s / s);
      } else {
        x = a.x + (b.x - a.x) * u * (b.s / s);
        y = a.y + (b.y - a.y) * u * (b.s / s);
      }
      const rot = lerp(a.rot, b.rot, u) + (k1.tilt ?? 0) * Math.sin(Math.PI * u);
      return { x, y, s, rot, fy: lerp(a.fy, b.fy, u) };
    }
  }
  return KEYS[KEYS.length - 1].cam;
};
