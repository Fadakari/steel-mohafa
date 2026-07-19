<script setup lang="ts">
import { ref, computed } from 'vue'

// --- State Management ---
const profileType = ref('plate') // plate, roundBar, pipe, box, hex
const material = ref('stainless') // stainless (7.93), iron (7.85)

// ابعاد
const length = ref<number | ''>('')
const width = ref<number | ''>('')       // عرض ورق یا قوطی
const height = ref<number | ''>('')      // ارتفاع قوطی
const thickness = ref<number | ''>('')   // ضخامت
const diameter = ref<number | ''>('')    // قطر میلگرد/لوله
const hexSize = ref<number | ''>('')     // سایز آچارخور شش‌پر

// قیمت
const unitPrice = ref<number | ''>('')

const isCopied = ref(false)

// نام فارسی مقاطع برای فاکتور کپی
const profileNames: Record<string, string> = {
  plate: 'ورق',
  roundBar: 'میلگرد / شافت',
  pipe: 'لوله',
  box: 'قوطی / پروفیل',
  hex: 'شِش‌پَر'
}

// محاسبه چگالی
const currentDensity = computed(() => (material.value === 'stainless' ? 7.93 : 7.85))

// هسته محاسباتی مهندسی و دقیق
const calculatedWeight = computed(() => {
  const L = Number(length.value) || 0
  const W = Number(width.value) || 0
  const H = Number(height.value) || 0
  const T = Number(thickness.value) || 0
  const D = Number(diameter.value) || 0
  const S = Number(hexSize.value) || 0
  const density = currentDensity.value

  if (L <= 0) return 0

  if (profileType.value === 'plate' && W > 0 && T > 0) {
    return L * W * T * density
  } 
  
  if (profileType.value === 'roundBar' && D > 0) {
    return Math.pow(D, 2) * 0.006228 * L * (density / 7.85)
  }

  if (profileType.value === 'pipe' && D > 0 && T > 0 && D > T) {
    return (D - T) * T * 0.0249 * L * (density / 7.85)
  }

  if (profileType.value === 'box' && W > 0 && H > 0 && T > 0 && W > 2*T && H > 2*T) {
    // فرمول دقیق حجم قوطی
    return 2 * T * (W + H - 2 * T) * L * (density / 1000)
  }

  if (profileType.value === 'hex' && S > 0) {
    // مساحت شش‌ضلعی منتظم * طول * چگالی
    return 0.866025 * Math.pow(S, 2) * L * (density / 1000)
  }

  return 0
})

// محاسبه قیمت کل
const calculatedPrice = computed(() => {
  const price = Number(unitPrice.value) || 0
  if (calculatedWeight.value > 0 && price > 0) {
    return calculatedWeight.value * price
  }
  return 0
})

// فرمت‌کننده‌ها
const formatNumber = (num: number) => num.toLocaleString('fa-IR', { maximumFractionDigits: 2 })
const formatCurrency = (num: number) => Math.round(num).toLocaleString('fa-IR')

// کپی حرفه‌ای به سبک پیش‌فاکتور
const copyToClipboard = async () => {
  if (calculatedWeight.value === 0) return
  try {
    let textToCopy = `مقدار محاسبه شده برای: ${profileNames[profileType.value]}\n`
    textToCopy += `وزن تقریبی: ${formatNumber(calculatedWeight.value)} کیلوگرم\n`
    if (calculatedPrice.value > 0) {
      textToCopy += `قیمت کل: ${formatCurrency(calculatedPrice.value)} تومان\n`
    }
    textToCopy += `\n(محاسبه شده توسط ابزار آنلاین)`
    
    await navigator.clipboard.writeText(textToCopy)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2500)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}
</script>

<template>
  <div class="calculator-wrapper">
    
    <div class="material-switch">
      <button class="switch-btn" :class="{ active: material === 'stainless' }" @click="material = 'stainless'">استیل (۳۰۴/۳۱۶)</button>
      <button class="switch-btn" :class="{ active: material === 'iron' }" @click="material = 'iron'">آهن / فولاد</button>
    </div>

    <div class="profile-grid">
      <button class="profile-btn" :class="{ active: profileType === 'plate' }" @click="profileType = 'plate'" title="ورق">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="9" width="18" height="6" rx="1"></rect></svg>
        <span>ورق</span>
      </button>
      <button class="profile-btn" :class="{ active: profileType === 'roundBar' }" @click="profileType = 'roundBar'" title="میلگرد">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2" fill="currentColor"></circle></svg>
        <span>میلگرد</span>
      </button>
      <button class="profile-btn" :class="{ active: profileType === 'pipe' }" @click="profileType = 'pipe'" title="لوله">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="5"></circle></svg>
        <span>لوله</span>
      </button>
      <button class="profile-btn" :class="{ active: profileType === 'box' }" @click="profileType = 'box'" title="قوطی/پروفیل">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14" rx="1"></rect><rect x="8" y="8" width="8" height="8"></rect></svg>
        <span>پروفیل</span>
      </button>
      <button class="profile-btn" :class="{ active: profileType === 'hex' }" @click="profileType = 'hex'" title="شش‌پر">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"></polygon></svg>
        <span>شش‌پر</span>
      </button>
    </div>

    <div class="divider">ابعاد مقطع</div>

    <div class="inputs-grid">
      <div class="input-group full-width">
        <label>طول (شاخه)</label>
        <div class="input-with-unit">
          <input type="number" v-model.number="length" placeholder="۶" />
          <span class="unit">متر</span>
        </div>
      </div>

      <template v-if="profileType === 'plate'">
        <div class="input-group"><label>عرض</label><div class="input-with-unit"><input type="number" v-model.number="width" placeholder="۱.۲۵" /><span class="unit">متر</span></div></div>
        <div class="input-group"><label>ضخامت</label><div class="input-with-unit"><input type="number" v-model.number="thickness" placeholder="۲" /><span class="unit">میلی‌متر</span></div></div>
      </template>

      <template v-if="profileType === 'roundBar' || profileType === 'pipe'">
        <div class="input-group" :class="{ 'full-width': profileType === 'roundBar' }">
          <label>قطر بیرونی</label><div class="input-with-unit"><input type="number" v-model.number="diameter" placeholder="۵۰" /><span class="unit">میلی‌متر</span></div>
        </div>
      </template>

      <template v-if="profileType === 'pipe'">
        <div class="input-group"><label>ضخامت دیواره</label><div class="input-with-unit"><input type="number" v-model.number="thickness" placeholder="۱.۵" /><span class="unit">میلی‌متر</span></div></div>
      </template>

      <template v-if="profileType === 'box'">
        <div class="input-group"><label>ضلع اول (A)</label><div class="input-with-unit"><input type="number" v-model.number="width" placeholder="۴۰" /><span class="unit">میلی‌متر</span></div></div>
        <div class="input-group"><label>ضلع دوم (B)</label><div class="input-with-unit"><input type="number" v-model.number="height" placeholder="۴۰" /><span class="unit">میلی‌متر</span></div></div>
        <div class="input-group full-width"><label>ضخامت ورق قوطی (T)</label><div class="input-with-unit"><input type="number" v-model.number="thickness" placeholder="۲" /><span class="unit">میلی‌متر</span></div></div>
      </template>

      <template v-if="profileType === 'hex'">
        <div class="input-group full-width"><label>سایز آچارخور (S)</label><div class="input-with-unit"><input type="number" v-model.number="hexSize" placeholder="۲۲" /><span class="unit">میلی‌متر</span></div></div>
      </template>
    </div>

    <div class="divider">محاسبه مالی (اختیاری)</div>

    <div class="price-input-section">
      <div class="input-group full-width">
        <label>قیمت هر کیلوگرم</label>
        <div class="input-with-unit price-field">
          <input type="number" v-model.number="unitPrice" placeholder="مثلاً ۱۳۵۰۰۰" />
          <span class="unit">تومان</span>
        </div>
      </div>
    </div>

    <div class="result-board" :class="{ 'has-value': calculatedWeight > 0 }">
      <div class="result-content">
        <div class="result-row">
          <span class="result-label">وزن:</span>
          <div class="weight-display">
            <span class="number">{{ calculatedWeight > 0 ? formatNumber(calculatedWeight) : '۰.۰۰' }}</span>
            <span class="unit-text">کیلوگرم</span>
          </div>
        </div>
        
        <div v-if="calculatedPrice > 0" class="result-row price-row">
          <span class="result-label">قیمت کل:</span>
          <div class="weight-display price-display">
            <span class="number">{{ formatCurrency(calculatedPrice) }}</span>
            <span class="unit-text">تومان</span>
          </div>
        </div>
      </div>
      
      <button class="copy-btn" @click="copyToClipboard" :class="{ copied: isCopied }" :disabled="calculatedWeight === 0">
        <div class="copy-icon-wrapper">
          <svg v-if="!isCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span>{{ isCopied ? 'کپی شد' : 'کپی فاکتور' }}</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
:root {
  /* تم کاملاً تاریک با کنتراست بالا */
  --bg-color: #0d0d0d; /* مشکی بسیار عمیق برای درخشش یاقوت */
  --text-color: #f8f9fa;
  --glass-bg: rgba(25, 25, 25, 0.6);
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  
  /* --- جادوی رنگ یاقوتی براق --- */
  --primary-color: #84012B; 
  /* یک هاله درخشان برای دور دکمه‌ها و پنل‌ها */
  --primary-glow: rgba(132, 1, 43, 0.45); 
  /* پس‌زمینه اینپوت‌ها */
  --input-bg: rgba(15, 15, 15, 0.8);
  --blur: blur(20px);
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: 'Vazirmatn', Tahoma, sans-serif;
  direction: rtl;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  /* اضافه کردن دو هاله نور بسیار محو یاقوتی در پس‌زمینه برای زیبایی بیشتر */
  background-image: 
    radial-gradient(circle at 10% 0%, rgba(132, 1, 43, 0.15) 0px, transparent 60%),
    radial-gradient(circle at 90% 100%, rgba(132, 1, 43, 0.1) 0px, transparent 60%);
  background-attachment: fixed;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  /* اضافه کردن یک سایه داخلی (Inset) بسیار ظریف برای ایجاد لبه‌های براق شیشه‌ای */
  box-shadow: var(--glass-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

input, select, button {
  font-family: 'Vazirmatn', inherit;
}

.calculator-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.divider {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.5;
  font-weight: bold;
  margin: 5px 0 -5px 0;
}
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border);
  margin-right: 15px;
}

/* --- انتخابگر متریال --- */
.material-switch {
  display: flex;
  background: var(--input-bg);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
[data-theme="dark"] .material-switch { border-color: rgba(255,255,255,0.05); }

.switch-btn {
  flex: 1; background: transparent; border: none; color: var(--text-color);
  padding: 10px; font-size: 0.95rem; font-weight: 700; border-radius: 8px;
  cursor: pointer; transition: all 0.3s; opacity: 0.5;
}
.switch-btn.active {
  background: var(--primary-color); color: white; opacity: 1;
  box-shadow: 0 4px 12px var(--primary-glow);
}

/* --- انتخابگر مقاطع (Grid) --- */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
  gap: 10px;
}

.profile-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--input-bg); border: 2px solid transparent;
  padding: 12px 5px; border-radius: 16px; color: var(--text-color);
  cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.profile-btn span { font-size: 0.75rem; font-weight: 800; opacity: 0.8; }
.profile-btn svg { width: 26px; height: 26px; opacity: 0.6; transition: all 0.3s; }
.profile-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.06); }

.profile-btn.active {
  border-color: var(--primary-color);
  background: linear-gradient(145deg, var(--input-bg), rgba(0, 102, 204, 0.05));
  color: var(--primary-color); transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--primary-glow);
}
.profile-btn.active svg { opacity: 1; stroke: var(--primary-color); stroke-width: 2.5; }
.profile-btn.active span { opacity: 1; }

/* --- فیلدها --- */
.inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.full-width { grid-column: span 2; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 0.85rem; font-weight: 800; color: var(--text-color); margin-right: 5px; }

.input-with-unit { position: relative; display: flex; align-items: center; }
.input-with-unit input {
  width: 100%; background: var(--input-bg); border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 14px; padding: 14px 15px; font-size: 1.1rem; font-weight: 800;
  color: var(--text-color); transition: all 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.01);
}
[data-theme="dark"] .input-with-unit input { border-color: rgba(255,255,255,0.05); }
.input-with-unit input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 4px var(--primary-glow); outline: none; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.unit { position: absolute; left: 15px; font-size: 0.85rem; font-weight: 800; color: var(--text-color); opacity: 0.4; pointer-events: none; }
.price-field input { color: #10b981; } /* رنگ سبز برای فیلد پول */
.price-field input:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }

/* --- برد نتیجه --- */
.result-board {
  background: var(--input-bg);
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 20px; padding: 20px;
  display: flex; justify-content: space-between; align-items: stretch;
  transition: all 0.4s; margin-top: 10px;
}
[data-theme="dark"] .result-board { border-color: rgba(255,255,255,0.1); }

.result-board.has-value {
  background: linear-gradient(135deg, var(--primary-color), #003d99);
  border-style: solid; border-color: transparent;
  box-shadow: 0 10px 30px var(--primary-glow);
}

.result-content { display: flex; flex-direction: column; justify-content: center; gap: 15px; flex-grow: 1; }
.result-row { display: flex; flex-direction: column; gap: 2px; }
.price-row { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; }

.result-label { font-size: 0.9rem; font-weight: 600; color: var(--text-color); opacity: 0.6; }
.has-value .result-label { color: rgba(255, 255, 255, 0.7); }

.weight-display { display: flex; align-items: baseline; gap: 6px; }
.number { font-size: 2rem; font-weight: 900; color: var(--text-color); line-height: 1; }
.has-value .number { color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.price-display .number { font-size: 1.6rem; color: #34d399; } /* سبز روشن برای قیمت */

.unit-text { font-size: 1rem; font-weight: bold; color: var(--text-color); opacity: 0.5; }
.has-value .unit-text { color: rgba(255, 255, 255, 0.8); }
.price-display .unit-text { color: #a7f3d0; opacity: 0.8; }

/* دکمه کپی */
.copy-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: transparent; border: none; color: var(--text-color); opacity: 0.3;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: 0 15px; border-right: 1px solid rgba(255,255,255,0.1);
}
.copy-btn span { font-size: 0.8rem; font-weight: 800; white-space: nowrap; }
.copy-icon-wrapper {
  width: 45px; height: 45px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.05); transition: all 0.3s;
}
.copy-icon-wrapper svg { width: 22px; height: 22px; }

.has-value .copy-btn { color: white; opacity: 0.9; border-color: rgba(255,255,255,0.2); }
.has-value .copy-icon-wrapper { background: rgba(255,255,255,0.15); }
.has-value .copy-btn:hover { transform: scale(1.05); opacity: 1; }
.has-value .copy-btn:hover .copy-icon-wrapper { background: rgba(255,255,255,0.25); }

.copy-btn.copied { color: #4ade80 !important; }
.copy-btn.copied .copy-icon-wrapper { background: rgba(74, 222, 128, 0.2); }
</style>