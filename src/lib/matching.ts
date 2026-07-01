/**
 * الگوریتم محاسبه درصد تطابق رزومه کارجو با آگهی شغلی
 * این تابع با بررسی کلمات کلیدی، عنوان شغلی و مهارت‌ها یک عدد بین 0 تا 100 برمی‌گرداند.
 */

interface SeekerData {
  job_title?: string | null;
  skills?: string | null;
}

interface JobData {
  title?: string | null;
  description?: string | null;
}

// تابع نرمال‌سازی حروف فارسی و انگلیسی (برای اینکه سرچ دقیق‌تر باشد)
// 🔥 export شد تا در سایر بخش‌های پروژه (مثل تطبیق دوره‌های آکادمی با عنوان شغلی) هم قابل استفاده باشد
export const normalizeText = (text?: string | null) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ") // حذف علائم نگارشی
    .replace(/\s{2,}/g, " ") // حذف فاصله‌های اضافی
    .trim();
};

export function calculateMatchScore(seeker: SeekerData, job: JobData): number {
  let score = 0;

  const sTitle = normalizeText(seeker.job_title);
  const sSkills = normalizeText(seeker.skills);
  const jTitle = normalizeText(job.title);
  const jDesc = normalizeText(job.description);

  // اگر اطلاعات ناقص باشد، یک حداقل امتیازی می‌دهیم
  if (!sTitle && !sSkills) return 15;

  // ۱. بررسی عنوان شغلی (حداکثر ۴۰ امتیاز)
  if (sTitle && jTitle) {
    const titleWords = sTitle.split(" ").filter(w => w.length > 2); // کلمات معنادار بیشتر از 2 حرف
    let matchCount = 0;
    
    titleWords.forEach(word => {
      if (jTitle.includes(word) || jDesc.includes(word)) matchCount++;
    });

    // به ازای هر کلمه کلیدی مشترک در عنوان، 20 امتیاز (تا سقف 40)
    score += Math.min(40, matchCount * 20);
  }

  // ۲. بررسی مهارت‌ها با متن آگهی (حداکثر ۶۰ امتیاز)
  if (sSkills && (jDesc || jTitle)) {
    // فرض می‌کنیم مهارت‌ها با کاما جدا شده‌اند
    const skillsArray = sSkills.split(',').map(s => s.trim()).filter(s => s.length > 1);
    let matchedSkills = 0;

    skillsArray.forEach(skill => {
      const normalizedSkill = normalizeText(skill);
      if (jDesc.includes(normalizedSkill) || jTitle.includes(normalizedSkill)) {
        matchedSkills++;
      }
    });

    if (skillsArray.length > 0) {
      // محاسبه درصد مهارت‌های یافته شده (سقف 60 امتیاز)
      // اگر کارفرما حداقل ۳ مهارت از کارجو را خواسته باشد، امتیاز کامل می‌گیرد
      const skillScore = (matchedSkills / Math.max(skillsArray.length, 2)) * 60;
      score += Math.min(60, skillScore);
    }
  }

  // اضافه کردن یک شانس پایه (Base Score) برای اینکه صفر مطلق نشود
  if (score < 10) score += 12;

  // هیچکس 100 درصد کامل نیست (برای طبیعی‌تر شدن عدد)
  return Math.floor(Math.min(98, score));
}