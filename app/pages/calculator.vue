<script setup lang="ts">
import SteelCalculator from '~/components/SteelCalculator.vue'

/* ---------------------------------------------------------
   داده‌های جدول وزن (بر اساس چگالی استاندارد استیل ضدزنگ
   آستنیتی = 7.93 kg/dm³ — همان چگالی که در فرمول‌های قبلی
   سایت هم استفاده شده، برای هماهنگی کامل با ماشین‌حساب)
--------------------------------------------------------- */

// جدول وزن ورق استیل بر اساس ابعاد استاندارد رول/شیت
const plateWeights = [
  { size: '۱ × ۲ متر', thickness: '0.5 mm', weight: 7.93 },
  { size: '۱ × ۲ متر', thickness: '0.8 mm', weight: 12.69 },
  { size: '۱ × ۲ متر', thickness: '1 mm', weight: 15.86 },
  { size: '۱ × ۲ متر', thickness: '1.5 mm', weight: 23.79 },
  { size: '۱ × ۲ متر', thickness: '2 mm', weight: 31.72 },
  { size: '۱ × ۲ متر', thickness: '3 mm', weight: 47.58 },
  { size: '۱ × ۲ متر', thickness: '4 mm', weight: 63.44 },
  { size: '۱ × ۲ متر', thickness: '5 mm', weight: 79.30 },
  { size: '۱ × ۲ متر', thickness: '6 mm', weight: 95.16 },
  { size: '۱ × ۲ متر', thickness: '8 mm', weight: 126.88 },
  { size: '۱ × ۲ متر', thickness: '10 mm', weight: 158.60 },
  { size: '۱.۲۵ × ۲.۵ متر', thickness: '1 mm', weight: 24.78 },
  { size: '۱.۲۵ × ۲.۵ متر', thickness: '1.5 mm', weight: 37.17 },
  { size: '۱.۲۵ × ۲.۵ متر', thickness: '2 mm', weight: 49.56 },
  { size: '۱.۲۵ × ۲.۵ متر', thickness: '3 mm', weight: 74.34 },
  { size: '۱.۲۵ × ۲.۵ متر', thickness: '4 mm', weight: 99.13 },
  { size: '۱.۲۵ × ۲.۵ متر', thickness: '5 mm', weight: 123.91 },
  { size: '۱.۵ × ۳ متر', thickness: '2 mm', weight: 71.37 },
  { size: '۱.۵ × ۳ متر', thickness: '3 mm', weight: 107.06 },
  { size: '۱.۵ × ۳ متر', thickness: '4 mm', weight: 142.74 },
  { size: '۱.۵ × ۳ متر', thickness: '5 mm', weight: 178.43 }
]

// جدول وزن میلگرد / مفتول استیل بر اساس قطر (کیلوگرم بر متر طول)
const rebarWeights = [
  { diameter: 'Ø6', weight: 0.22 },
  { diameter: 'Ø8', weight: 0.40 },
  { diameter: 'Ø10', weight: 0.62 },
  { diameter: 'Ø12', weight: 0.90 },
  { diameter: 'Ø14', weight: 1.22 },
  { diameter: 'Ø16', weight: 1.59 },
  { diameter: 'Ø18', weight: 2.02 },
  { diameter: 'Ø20', weight: 2.49 },
  { diameter: 'Ø22', weight: 3.02 },
  { diameter: 'Ø25', weight: 3.89 },
  { diameter: 'Ø28', weight: 4.88 },
  { diameter: 'Ø30', weight: 5.61 },
  { diameter: 'Ø32', weight: 6.38 }
]

/* ---------------------------------------------------------
   Schema.org — FAQPage
--------------------------------------------------------- */
const faqList = [
  {
    q: 'آیا محاسبه وزن استیل دقیق است؟',
    a: 'این ماشین‌حساب بر اساس فرمول‌های مهندسی و چگالی استاندارد استیل (7.93 کیلوگرم بر لیتر برای گریدهای آستنیتی مانند 304 و 316) طراحی شده و برای برآورد وزن و قیمت کاملاً مناسب است.'
  },
  {
    q: 'این ابزار از چه گریدهایی پشتیبانی می‌کند؟',
    a: 'این ابزار برای تمامی گریدهای رایج استنلس استیل مانند 304، 304L، 310، 310S، 316، 316L، 321، 420 و 430 قابل استفاده است.'
  },
  {
    q: 'آیا ماشین‌حساب قیمت را هم محاسبه می‌کند؟',
    a: 'بله؛ با وارد کردن قیمت هر کیلوگرم استیل، قیمت کل قطعه به‌صورت خودکار محاسبه می‌شود.'
  },
  {
    q: 'آیا این ابزار برای پروفیل، لوله و میلگرد استیل هم مناسب است؟',
    a: 'بله، محاسبه وزن ورق، لوله، میلگرد، پروفیل و شش‌پر استیل توسط این ابزار انجام می‌شود.'
  },
  {
    q: 'چرا وزن محاسبه‌شده با جدول وزن استیل کارخانه تفاوت دارد؟',
    a: 'به دلیل تلرانس تولید کارخانه و استانداردهای ساخت ممکن است اختلاف جزئی (معمولاً کمتر از چند درصد) وجود داشته باشد؛ ماشین‌حساب بر اساس ابعاد اسمی محاسبه می‌کند.'
  },
  {
    q: 'آیا این ماشین‌حساب برای محاسبه وزن آهن و فولاد ساده هم کاربرد دارد؟',
    a: 'ابزار برای استیل ضدزنگ کالیبره شده (چگالی 7.93)، اما همان فرمول‌ها با اعمال چگالی آهن و فولاد کربنی (حدود 7.85 کیلوگرم بر لیتر) برای برآورد وزن آهن‌آلات و پروفیل فولادی نیز قابل استفاده است.'
  },
  {
    q: 'جدول وزن استیل چیست و چه کاربردی دارد؟',
    a: 'جدول وزن استیل مرجعی است که وزن هر مقطع (ورق، میلگرد، لوله، پروفیل) را بر اساس ابعاد استاندارد نشان می‌دهد و برای برآورد سریع هزینه خرید، بدون نیاز به محاسبه دستی، استفاده می‌شود.'
  },
  {
    q: 'چگالی استاندارد استفاده‌شده در این ماشین‌حساب چقدر است؟',
    a: 'چگالی مبنا 7.93 کیلوگرم بر لیتر (گرم بر سانتی‌متر مکعب) است که چگالی رایج گریدهای آستنیتی استیل ضدزنگ مانند 304 و 316 می‌باشد.'
  }
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqList.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a
    }
  }))
}

/* ---------------------------------------------------------
   Schema.org — BreadcrumbList
--------------------------------------------------------- */
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://mohafa.com' },
    { '@type': 'ListItem', position: 2, name: 'ماشین حساب وزن استیل', item: 'https://mohafa.com/calculator' }
  ]
}

/* ---------------------------------------------------------
   Schema.org — HowTo
--------------------------------------------------------- */
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'نحوه محاسبه وزن استیل با ماشین‌حساب آنلاین',
  description: 'راهنمای گام‌به‌گام محاسبه وزن و قیمت ورق، لوله، میلگرد و پروفیل استیل.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'انتخاب نوع مقطع',
      text: 'نوع مقطع استیل مورد نظر (ورق، لوله، میلگرد، پروفیل یا شش‌پر) را انتخاب کنید.'
    },
    {
      '@type': 'HowToStep',
      name: 'وارد کردن ابعاد',
      text: 'ابعاد قطعه شامل طول، عرض یا قطر و ضخامت را وارد کنید.'
    },
    {
      '@type': 'HowToStep',
      name: 'مشاهده وزن و قیمت نهایی',
      text: 'وزن قطعه محاسبه می‌شود و در صورت وارد کردن قیمت هر کیلوگرم، قیمت نهایی نیز به‌طور خودکار نمایش داده می‌شود.'
    }
  ]
}

/* ---------------------------------------------------------
   Meta
--------------------------------------------------------- */
useSeoMeta({
  title:
    'محاسبه وزن استیل، آهن و فولاد | ماشین‌حساب آنلاین + جدول وزن | استیل مهفا',
  description:
    'ماشین‌حساب آنلاین وزن استیل، آهن و فولاد برای محاسبه وزن ورق، لوله، میلگرد، پروفیل و شش‌پر استیل به همراه جدول کامل وزن استیل. محاسبه دقیق وزن و قیمت بر اساس ابعاد و چگالی توسط استیل مهفا.',

  keywords:
    'محاسبه وزن استیل,محاسبه وزن آهن,محاسبه وزن فولاد,ماشین حساب استیل,جدول وزن استیل,جدول وزن ورق استیل,جدول وزن میلگرد استیل,جدول وزن لوله استیل,وزن ورق استیل,وزن لوله استیل,وزن میلگرد استیل,وزن پروفیل استیل,محاسبه وزن ورق 304,محاسبه وزن ورق 316,چگالی استیل,استیل مهفا',

  robots: 'index,follow',
  author: 'استیل مهفا',

  ogType: 'website',
  ogLocale: 'fa_IR',
  ogSiteName: 'استیل مهفا',
  ogTitle: 'محاسبه وزن استیل، آهن و فولاد | ماشین‌حساب آنلاین + جدول وزن',
  ogDescription:
    'محاسبه آنلاین وزن ورق، لوله، میلگرد، پروفیل و شش‌پر استیل با فرمول‌های مهندسی، به همراه جدول کامل وزن استیل.',
  ogUrl: 'https://mohafa.com/calculator',
  ogImage: 'https://mohafa.com/header-logo.png',

  twitterCard: 'summary_large_image',
  twitterTitle: 'محاسبه وزن استیل، آهن و فولاد | ماشین‌حساب آنلاین',
  twitterDescription: 'محاسبه دقیق وزن انواع مقاطع استیل با فرمول‌های مهندسی و جدول وزن کامل.',
  twitterImage: 'https://mohafa.com/header-logo.png'
})

useHead({
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  link: [
    { rel: 'canonical', href: 'https://mohafa.com/calculator' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ماشین حساب وزن استیل',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        url: 'https://mohafa.com/calculator',
        image: 'https://mohafa.com/header-logo.png',
        description:
          'ماشین حساب آنلاین محاسبه وزن انواع مقاطع استیل شامل ورق استیل، لوله استیل، میلگرد استیل، پروفیل استیل و شش پر استیل.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IRR'
        },
        publisher: {
          '@type': 'Organization',
          name: 'استیل مهفا',
          url: 'https://mohafa.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://mohafa.com/header-logo.png'
          }
        }
      })
    },
    { type: 'application/ld+json', children: JSON.stringify(faqSchema) },
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
    { type: 'application/ld+json', children: JSON.stringify(howToSchema) }
  ]
})
</script>

<template>
  <main class="calculator-page selection:bg-[#84012b7a]">

    <!-- Breadcrumb قابل مشاهده برای کاربر (هماهنگ با BreadcrumbList schema) -->
    <nav class="visible-breadcrumb" aria-label="مسیر صفحه">
      <NuxtLink to="/">خانه</NuxtLink>
      <span> / </span>
      <span>ماشین حساب وزن استیل</span>
    </nav>

    <section class="hero mt-[4.5rem] text-transparent text-4xl bg-clip-text bg-gradient-to-l pb-2 from-[#84012B] to-[#ff477e]">

      <h1>
        ماشین حساب آنلاین محاسبه وزن استیل، آهن و فولاد
      </h1>

      <p class="hero-description">
        با استفاده از ماشین‌حساب وزن استیل استیل مهفا می‌توانید وزن تقریبی
        ورق استیل، لوله استیل، میلگرد استیل، پروفیل استیل و شش‌پر استیل را
        بر اساس ابعاد و چگالی استاندارد محاسبه کنید. همچنین با اعمال چگالی
        متناسب، این ابزار برای محاسبه وزن آهن و فولاد کربنی نیز کاربرد دارد.
      </p>

    </section>

    <SteelCalculator />

    <!-- فهرست مطالب: به تجربه کاربر و لینک‌سازی داخلی صفحه کمک می‌کند -->
    <nav class="toc" aria-label="فهرست مطالب">
      <h2 class="toc-title">فهرست مطالب</h2>
      <ul>
        <li><a href="#plate-weight-table">جدول وزن ورق استیل</a></li>
        <li><a href="#rebar-weight-table">جدول وزن میلگرد استیل</a></li>
        <li><a href="#other-weight-table">جدول وزن لوله و پروفیل استیل</a></li>
        <li><a href="#calculator-seo">راهنمای محاسبه وزن استیل، آهن و فولاد</a></li>
        <li><a href="#faq">سوالات متداول</a></li>
      </ul>
    </nav>

    <!-- جدول وزن ورق استیل -->
    <section id="plate-weight-table" class="weight-table-section">
      <h2>جدول وزن ورق استیل</h2>
      <p class="table-intro">
        جدول زیر وزن ورق استیل را برای رایج‌ترین ابعاد و ضخامت‌های موجود در
        بازار، بر اساس چگالی استاندارد 7.93 کیلوگرم بر لیتر نشان می‌دهد.
      </p>

      <div class="table-wrapper">
        <table class="steel-table">
          <thead>
            <tr>
              <th>ابعاد ورق</th>
              <th>ضخامت</th>
              <th>وزن تقریبی</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in plateWeights" :key="'plate-' + i">
              <td>{{ row.size }}</td>
              <td>{{ row.thickness }}</td>
              <td>{{ row.weight.toFixed(2) }} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- جدول وزن میلگرد استیل -->
    <section id="rebar-weight-table" class="weight-table-section">
      <h2>جدول وزن میلگرد استیل</h2>
      <p class="table-intro">
        وزن میلگرد و مفتول استیل به ازای هر متر طول، بر اساس قطر اسمی و
        چگالی استاندارد استیل ضدزنگ.
      </p>

      <div class="table-wrapper">
        <table class="steel-table">
          <thead>
            <tr>
              <th>قطر میلگرد</th>
              <th>وزن هر متر</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rebarWeights" :key="'rebar-' + i">
              <td>{{ row.diameter }}</td>
              <td>{{ row.weight.toFixed(2) }} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- جدول نمونه سایر مقاطع (لوله / قوطی) -->
    <section id="other-weight-table" class="weight-table-section">
      <h2>جدول وزن لوله و پروفیل استیل</h2>
      <p class="table-intro">
        نمونه‌ای از وزن استاندارد لوله و قوطی (پروفیل) استیل برای رایج‌ترین
        سایزهای مصرفی در صنعت.
      </p>

      <div class="table-wrapper">
        <table class="steel-table">
          <thead>
            <tr>
              <th>مقطع</th>
              <th>ابعاد</th>
              <th>وزن هر متر</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>لوله استیل</td>
              <td>25×2</td>
              <td>1.17 kg</td>
            </tr>
            <tr>
              <td>لوله استیل</td>
              <td>38×2</td>
              <td>1.82 kg</td>
            </tr>
            <tr>
              <td>قوطی استیل</td>
              <td>40×40×2</td>
              <td>2.39 kg</td>
            </tr>
            <tr>
              <td>قوطی استیل</td>
              <td>60×40×2</td>
              <td>2.97 kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="calculator-seo" class="calculator-seo w-[50%] m-auto mb-[5rem]">
      <h2>محاسبه وزن استیل، آهن و فولاد به صورت آنلاین</h2>

      <p>
        ماشین‌حساب وزن استیل استیل مهفا امکان محاسبه سریع و دقیق وزن انواع
        مقاطع استیل، آهن و فولاد را بر اساس ابعاد واقعی فراهم می‌کند. این
        ابزار برای مهندسان، پیمانکاران، تولیدکنندگان، مجریان پروژه و
        خریداران استیل طراحی شده است تا بدون نیاز به جدول‌های وزنی بتوانند
        وزن تقریبی هر قطعه را تنها با وارد کردن ابعاد محاسبه کنند.
      </p>

      <p>
        تمامی فرمول‌های استفاده‌شده در این ابزار بر اساس روابط مهندسی و
        چگالی استاندارد استیل طراحی شده‌اند و نتایج ارائه‌شده برای برآورد
        وزن، قیمت و حمل بار کاملاً مناسب هستند. با تغییر چگالی ورودی، همین
        فرمول‌ها برای برآورد وزن آهن‌آلات و فولاد کربنی نیز قابل استفاده‌اند.
      </p>

      <h2>محاسبه وزن ورق استیل</h2>
      <p>
        برای محاسبه وزن ورق استیل کافی است طول، عرض و ضخامت ورق را وارد کنید.
        ماشین‌حساب به‌صورت خودکار وزن ورق را بر اساس چگالی گریدهای مختلف
        استیل محاسبه می‌کند. برای مرجع سریع‌تر می‌توانید از
        <a href="#plate-weight-table">جدول وزن ورق استیل</a> نیز استفاده کنید.
      </p>

      <h2>محاسبه وزن لوله استیل</h2>
      <p>
        در محاسبه وزن لوله استیل، قطر خارجی، ضخامت دیواره و طول لوله در نظر
        گرفته می‌شود. این ابزار برای انواع لوله‌های صنعتی، دکوراتیو و
        صنایع غذایی مناسب است.
      </p>

      <h2>محاسبه وزن میلگرد استیل</h2>
      <p>
        برای محاسبه وزن میلگرد استیل تنها کافی است قطر و طول شاخه را وارد
        کنید. این محاسبه برای میلگردهای استیل 304، 316، 310 و 420 نیز قابل
        استفاده است؛ جدول کامل قطرهای رایج را در
        <a href="#rebar-weight-table">جدول وزن میلگرد استیل</a> ببینید.
      </p>

      <h2>محاسبه وزن پروفیل استیل</h2>
      <p>
        ماشین‌حساب وزن پروفیل استیل برای انواع قوطی و پروفیل‌های صنعتی و
        دکوراتیو قابل استفاده است و وزن را بر اساس ابعاد واقعی مقطع محاسبه
        می‌کند.
      </p>

      <h2>محاسبه وزن آهن و فولاد ساده</h2>
      <p>
        اگرچه این ماشین‌حساب برای استیل ضدزنگ کالیبره شده، همان اصول و
        فرمول‌های محاسبه وزن با جایگزینی چگالی آهن و فولاد کربنی (حدود
        7.85 کیلوگرم بر لیتر به‌جای 7.93) برای برآورد وزن آهن‌آلات، تیرآهن،
        نبشی و ناودانی نیز صادق است.
      </p>

      <h2>چرا محاسبه وزن استیل اهمیت دارد؟</h2>
      <ul>
        <li>برآورد هزینه خرید پیش از ثبت سفارش</li>
        <li>محاسبه دقیق قیمت نهایی پروژه</li>
        <li>تخمین هزینه حمل و نقل بر اساس وزن بار</li>
        <li>انتخاب مناسب تجهیزات و جرثقیل جابجایی</li>
        <li>کاهش خطای سفارش و برش قطعات</li>
        <li>مقایسه سریع‌تر گزینه‌ها هنگام خرید ورق، لوله یا میلگرد استیل</li>
      </ul>
    </section>

    <section id="faq" class="faq-section">

      <h2>سوالات متداول درباره محاسبه وزن استیل</h2>

      <div v-for="(item, i) in faqList" :key="'faq-' + i" class="faq-item">
        <h3>{{ item.q }}</h3>
        <p>{{ item.a }}</p>
      </div>

    </section>

    <section class="calculator-cta">

      <h2>استعلام قیمت روز استیل</h2>

      <p>
        اگر پس از محاسبه وزن، قصد خرید ورق استیل، لوله استیل، میلگرد استیل،
        پروفیل استیل یا سایر مقاطع استیل را دارید، کارشناسان فروش استیل
        مهفا آماده ارائه قیمت روز و مشاوره تخصصی هستند.
      </p>

      <a
        href="tel:02166394159"
        class="call-button"
        aria-label="تماس تلفنی با کارشناسان فروش استیل مهفا"
      >
        تماس با کارشناسان فروش
        021-66394159
      </a>

    </section>

  </main>
</template>

<style>
.visible-breadcrumb{
    font-size:.85rem;
    opacity:.6;
    margin-top:1rem;
    padding:0 20px;
}

.visible-breadcrumb a{
    color:inherit;
    text-decoration:underline;
}

.toc{
    width:60%;
    margin:50px auto;
    padding:24px 28px;
    border-radius:16px;
    border:1px solid rgba(255,255,255,.08);
    background:var(--glass-bg);
    color:#d6d6d6;
}

.toc-title{
    font-size:1.2rem;
    font-weight:800;
    margin-bottom:12px;
}

.toc ul{
    padding-right:20px;
    line-height:2.1;
}

.toc a{
    color:#9dd7ff;
    text-decoration:none;
}

.toc a:hover{
    text-decoration:underline;
}

.hero{
    margin-bottom:40px;
}

.hero h1{
    font-size:2.2rem;
    font-weight:900;
    line-height:1.5;
    margin-bottom:16px;
    width: 100%;
    text-align: center;
    margin:auto;
    padding:40px 20px;
}

.hero-description{
    font-size:1.05rem;
    line-height:2;
    color:#777;
    max-width:900px;
    text-align: center;
    margin: auto;
}

.calculator-seo{
    margin-top:80px;
    line-height:2.2;
    color:#d6d6d6;
}

.calculator-seo h2{
    margin-top:45px;
    margin-bottom:18px;
    font-size:30px;
    font-weight:800;
    color:#ffffff;
}

.calculator-seo p{
    margin-bottom:18px;
    font-size:18px;
}

.calculator-seo a{
    color:#9dd7ff;
}

.calculator-seo ul{
    margin-top:15px;
    padding-right:25px;
}

.calculator-seo li{
    margin-bottom:10px;
}

.faq-section{
    margin-top:80px;
    width: 50%;
    margin: auto;
    color: #ffffff;
    margin-bottom: 5rem;
}

.faq-item{
    margin-top:35px;
}

.faq-item h3{
    font-size:22px;
    font-weight:800;
    margin-bottom:10px;
}

.faq-item p{
    line-height:2.1;
    opacity:.9;
}

.calculator-cta{

margin-top:90px;

padding:50px;

border-radius:24px;

background:linear-gradient(
135deg,
#84012B,
#5f0120
);

text-align:center;

color:white;

box-shadow:0 15px 40px rgba(132,1,43,.35);
width: 50%;
margin: auto;
margin-bottom: 5rem;

}

.calculator-cta h2{

font-size:34px;

font-weight:900;

margin-bottom:20px;

}

.calculator-cta p{

font-size:18px;

line-height:2;

max-width:850px;

margin:auto;

opacity:.92;

}

.call-button{

display:inline-block;

margin-top:35px;

padding:18px 42px;

background:white;

color:#84012B;

font-weight:900;

font-size:20px;

border-radius:14px;

text-decoration:none;

transition:.3s;

}

.call-button:hover{

transform:translateY(-4px);

box-shadow:0 10px 30px rgba(255,255,255,.25);

}

.weight-table-section{
    margin-top:80px;
    width: 80%;
    margin-left:auto;
    margin-right:auto;
    color:#d6d6d6;
}

.weight-table-section h2{
    font-size:2rem;
    font-weight:900;
    margin-bottom:15px;
}

.table-intro{
    line-height:2;
    opacity:.8;
    margin-bottom:30px;
}

.table-wrapper{

    overflow:auto;

    border-radius:22px;

    border:1px solid rgba(255,255,255,.08);

    background:var(--glass-bg);

    backdrop-filter:blur(20px);
    width: 100%;
    margin: auto;

}

.steel-table{

    width:100%;

    border-collapse:collapse;

    min-width:650px;

}

.steel-table thead{

    background:linear-gradient(
        90deg,
        #84012B,
        #a30039
    );

    color:white;

}

.steel-table th{

    padding:18px;

    font-size:1rem;

    text-align:center;

}

.steel-table td{

    padding:16px;

    text-align:center;

    border-top:1px solid rgba(255,255,255,.05);

    transition:.25s;

}

.steel-table tbody tr:nth-child(even){

    background:rgba(255,255,255,.02);

}

.steel-table tbody tr:hover{

    background:rgba(132,1,43,.12);

}

.steel-table td:first-child{

    font-weight:800;

    color:#fff;

}

.steel-table td:nth-child(2){

    color:#9dd7ff;

    font-weight:700;

}

.steel-table td:last-child{

    color:#47d18c;

    font-weight:900;

}
</style>
