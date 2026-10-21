import type { Register, SessionUsage } from 'claude-code'

// قوالب ثابتة: تُعرض محليًا بدون استدعاء النموذج = صفر استهلاك
const T: Record<string, { d: string; t: string }> = {
  'raed-help': {
    d: 'قائمة أوامر رائد',
    t: `أوامر رائد (بدون استهلاك):
/raed7   خطوات منهج RAED7
/mashhad قالب مشهد 10 ثوانٍ
/flow    قالب برومبت صورة تحافظ على وجهك
/nashr   قالب حزمة نشر
/usage   استهلاك الجلسة الآن`,
  },
  raed7: {
    d: 'خطوات منهج RAED7',
    t: `RAED7:
1. الفكرة: سطر واحد + الجمهور + الهوك
2. السكربت: فصحى مشكّلة، جمل قصيرة
3. المشاهد: 10 ثوانٍ لكل مشهد (≈ 20–25 كلمة)
4. الصور: برومبت لكل مشهد + أين تظهر صورتي
5. الصوت: تعليق صوتي + مؤثرات
6. المونتاج: انتقالات + أسماء الأماكن بالسويدية أعلى الشاشة
7. النشر: عنوان + منشور + 4 هاشتاغات`,
  },
  mashhad: {
    d: 'قالب مشهد 10 ثوانٍ',
    t: `[مشهد ] (00:00–00:10)
اللقطة:
حركة الكاميرا:
الإضاءة:
النص الصوتي (≈ 20–25 كلمة):
اسم المكان (سويدي، أعلى الشاشة):
المؤثرات الصوتية:
الانتقال:
صورتي: نعم / لا`,
  },
  flow: {
    d: 'قالب برومبت يحافظ على هوية الوجه',
    t: `Use the reference photo as the identity anchor. Keep the exact face, age, eye shape, nose, mouth and jawline unchanged.
Change only: outfit [ ], pose [ ], lighting [ ], background [ ].
Location: [ ], Sweden. Camera: [ ]. Photorealistic, 9:16, 10 seconds.
No Arabic text on screen. Swedish place name at the top, away from the face.`,
  },
  nashr: {
    d: 'قالب حزمة نشر',
    t: `العنوان:
المنشور (2–3 أسطر + دعوة للتفاعل):
الهاشتاغات: #السويد # # #`,
  },
}

function line(u: SessionUsage): string {
  const parts = [`السياق ${Math.round(u.context.percent ?? 0)}%`]
  for (const r of u.rateLimits) parts.push(`${r.kind === 'five_hour' ? '5 ساعات' : r.kind === 'seven_day' ? 'الأسبوع' : r.kind} ${Math.round(r.percentUsed)}%`)
  return parts.join(' · ')
}

export const register: Register = on => {
  let warned = false

  on('session.start', async ($, e, next) => {
    for (const [name, c] of Object.entries(T))
      await $.command.register({ name, description: c.d })
    await $.command.register({ name: 'usage', description: 'استهلاك الجلسة الآن' })
    return next(e)
  })

  on('command.run', async ($, e, next) => {
    const c = T[e.command]
    if (c) return { text: c.t }
    if (e.command === 'usage') return { text: line(await $.session.usage()) }
    return next(e)
  }).catch(($, e, next) => (next.called ? undefined : next(e)))

  // بعد كل رد: حدّث شريط الحالة، ونبّه مرة واحدة إذا امتلأ السياق
  on('turn.complete', async ($, e, next) => {
    const out = await next(e)
    try {
      $.ui.status(line(await $.session.usage()))
      const p = (await $.session.usage()).context.percent ?? 0
      if (p >= 70 && !warned) {
        warned = true
        $.ui.toast('السياق تجاوز 70% — اكتب /compact أو ابدأ محادثة جديدة لتوفير الاستهلاك')
      }
      if (p < 50) warned = false
    } catch {}
    return out
  })
}
