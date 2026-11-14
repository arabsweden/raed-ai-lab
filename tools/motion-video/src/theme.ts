import { loadFont } from "@remotion/google-fonts/Tajawal";

const { fontFamily } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["arabic", "latin"],
});

export const FONT = fontFamily;

// 4 ألوان مسطحة فقط
export const NAVY = "#0E1B3D";
export const YELLOW = "#FFC53D";
export const CREAM = "#F5EFE3";
export const CORAL = "#F0533A";

export const W = 1080;
export const H = 1920;
// نقطة تركيز الكاميرا على الشاشة: منتصف المنطقة الآمنة (280–1290)
export const FX = 540;
export const FY = 785;

export const FPS = 30;
export const DURATION = 990; // 33 ثانية (الفويس أوفر 30.9 ثانية + الكشف الأخير)
