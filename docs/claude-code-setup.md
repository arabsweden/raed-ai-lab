# تشغيل المختبر مع Claude Code
إعداد: 2026-10-11. الأوامر من صفحات الجهات الصانعة في هذا التاريخ؛ راجعها قبل النسخ لأنها تتغير.

## الفكرة في سطرين
- **رائد 7 (تطبيق Claude):** إنتاج الفيديو بالمهارات الجاهزة (raed7-video-pack، raed-script-review، raed-prompt-playground…). لا تحتاج تثبيتًا.
- **مختبر رائد (هذا المستودع + Claude Code على الماك):** حفظ الحلقات، بناء الصفحات والمواقع وفحصها ونشرها.

## أول مرة على الماك
```bash
git clone https://github.com/arabsweden/raed-ai-lab.git
cd raed-ai-lab
claude
```
- يقرأ Claude Code ملف `CLAUDE.md` تلقائيًا، فيعرف قواعد RAED7 والهوية والمصادر.
- يسألك مرة واحدة عن خادم `chrome-devtools` الموجود في `.mcp.json`؛ وافق عليه.
  يحتاج Node.js بإصدار LTS ومتصفح Google Chrome.
  الإعداد يشغّل متصفحًا معزولًا (`--isolated`)، ويوقف إحصاءات الاستخدام وإرسال روابط الأداء إلى Google.

## الأوامر الجاهزة في المختبر
| الأمر | ماذا يفعل |
|---|---|
| `/new-episode stockholm-guide Gamla stan` | ينشئ حلقة جديدة بالملفات الأربعة ويحدّث المتابعة |
| `/check-site app/index.html` | يفحص الصفحة على الجوال ويعطي تقرير إصلاحات بالعربية |
| `/check-site https://…` | نفس الفحص لأي موقع منشور (جسر الأسرة، نلتقي في ستوكهولم) |

## الإضافات الأربع: ماذا تستعمل وأين
| الإضافة | المختبر | جسر الأسرة | نلتقي في ستوكهولم | دليل ستوكهولم |
|---|---|---|---|---|
| Chrome DevTools | ✅ مفعّلة هنا | ✅ فحص الجوال وRTL وSEO | ✅ | ✅ |
| Vercel | لاحقًا لنشر التطبيق | ✅ عند وضع الموقع في GitHub | ✅ | ✅ |
| Supabase | ❌ التطبيق يحفظ محليًا عمدًا | ❌ مبدأ المشروع: لا جمع بيانات شخصية | ⚠️ فقط لنموذج التسجيل، للقراءة أولًا وبمشروع تجريبي | ❌ |
| oh-my-claudecode | ❌ مؤجلة: مجتمعية وتستهلك الحصة | ❌ | ❌ | ❌ |

### Vercel (حين تقرر النشر)
```bash
npx plugins add vercel/vercel-plugin
```
داخل Claude Code: `/vercel-plugin:deploy` ينشر **معاينة**. افتحها بنفسك، ثم `/vercel-plugin:deploy prod`.
لإيقاف الإشارة اليومية: `VERCEL_PLUGIN_TELEMETRY=off`.
التطبيق يحفظ البرومبتات في متصفح كل زائر، فنشره لا يكشف برومبتاتك، لكن الرابط يصبح عامًا.

### Supabase (نلتقي في ستوكهولم فقط، عند الحاجة)
```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<project-id>&read_only=true"
```
ثم `/mcp` ← supabase ← Authenticate. أبقِ الموافقة اليدوية على كل أمر SQL.

## مواقعك خارج المختبر
موقع جسر الأسرة وموقع نلتقي في ستوكهولم غير موجودين في GitHub حاليًا.
ضع كل موقع في مستودع خاص مستقل، وانسخ إليه `CLAUDE.md` و`.mcp.json` و`.claude/commands/check-site.md` من هنا، ثم عدّل قسم «تطبيق app/» ليصف ذلك الموقع.

## روتين أسبوعي مقترح
1. الاثنين: `/new-episode` لحلقة الأسبوع، ثم راجع المصادر بنفسك.
2. الأربعاء: إنتاج المشاهد في تطبيق Claude بمهارات رائد 7.
3. الجمعة: `/check-site` على موقع واحد من مواقعك، وأصلح الأولوية الأولى فقط.

## المصادر
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp (قُرئ 2026-10-11)
- Vercel plugin: https://vercel.com/docs/agent-resources/vercel-plugin
- Supabase AI plugins: https://supabase.com/docs/guides/ai-tools/plugins
- المقال المرجعي: https://store.pyraai.cloud/claude-code-plugins-vibe-coding/ (نُشر 2026-10-11)
