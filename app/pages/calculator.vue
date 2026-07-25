<script setup lang="ts">
import SteelCalculator from '~/components/SteelCalculator.vue'

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "آیا محاسبه وزن استیل دقیق است؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "این ماشین حساب بر اساس فرمول‌های مهندسی و چگالی استاندارد استیل طراحی شده است و برای برآورد وزن و قیمت کاملاً مناسب است."
      }
    },
    {
      "@type": "Question",
      "name": "این ابزار از چه گریدهایی پشتیبانی می‌کند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "این ابزار برای تمامی گریدهای رایج مانند استیل 304، 310، 316، 420، 430 و سایر گریدهای استنلس استیل قابل استفاده است."
      }
    },
    {
      "@type": "Question",
      "name": "آیا ماشین حساب قیمت را هم محاسبه می‌کند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، با وارد کردن قیمت هر کیلوگرم استیل، قیمت کل قطعه به صورت خودکار محاسبه می‌شود."
      }
    },
    {
      "@type": "Question",
      "name": "آیا این ابزار برای پروفیل و لوله و میلگرد استیل مناسب است؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، محاسبه وزن ورق، لوله، میلگرد، پروفیل و شش پر استیل توسط این ابزار انجام می‌شود."
      }
    },
    {
      "@type": "Question",
      "name": "چرا وزن محاسبه شده با جدول وزن استیل تفاوت دارد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "به دلیل تلرانس تولید کارخانه و استانداردهای ساخت ممکن است اختلاف جزئی وجود داشته باشد."
      }
    }
  ]
}

useSeoMeta({
  title: 'محاسبه وزن استیل | ماشین حساب آنلاین وزن ورق، لوله، میلگرد و پروفیل استیل | استیل مهفا',
  description:
    'ماشین حساب آنلاین وزن استیل برای محاسبه وزن ورق استیل، لوله استیل، میلگرد استیل، پروفیل استیل و شش پر استیل. محاسبه دقیق وزن و قیمت استیل بر اساس ابعاد و چگالی توسط استیل مهفا.',

  keywords:
    'محاسبه وزن استیل,ماشین حساب استیل,وزن ورق استیل,وزن لوله استیل,وزن میلگرد استیل,وزن پروفیل استیل,محاسبه وزن ورق 304,محاسبه وزن ورق 316,استیل مهفا',

  robots: 'index,follow',

  author: 'استیل مهفا',

  ogType: 'website',

  ogSiteName: 'استیل مهفا',

  ogTitle:
    'محاسبه وزن استیل | ماشین حساب آنلاین استیل | Mohafa',

  ogDescription:
    'محاسبه آنلاین وزن ورق، لوله، میلگرد، پروفیل و شش پر استیل با فرمول‌های مهندسی.',

  ogUrl: 'https://mohafa.com/calculator',

  ogImage: 'https://mohafa.com/header-logo.png',

  twitterCard: 'summary_large_image',

  twitterTitle:
    'محاسبه وزن استیل | ماشین حساب آنلاین استیل',

  twitterDescription:
    'محاسبه دقیق وزن انواع مقاطع استیل با فرمول‌های مهندسی.',

  twitterImage:
    'https://mohafa.com/header-logo.png'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://mohafa.com/calculator'
    }
  ]
})

useHead({
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
    },{
        type: 'application/ld+json',
        children: JSON.stringify(faqSchema)
      }
  ]
})



const plateWeights = [
  {
    title: 'ورق ۱×۲ متر ضخامت ۱ میل',
    weight: 15.86
  },
  {
    title: 'ورق ۱×۲ متر ضخامت ۲ میل',
    weight: 31.72
  },
  {
    title: 'ورق ۱×۲ متر ضخامت ۳ میل',
    weight: 47.58
  },
  {
    title: 'ورق ۱×۲ متر ضخامت ۴ میل',
    weight: 63.44
  },
  {
    title: 'ورق ۱×۲ متر ضخامت ۵ میل',
    weight: 79.30
  },
  {
    title: 'ورق ۱.۲۵×۲.۵ متر ضخامت ۱ میل',
    weight: 24.78
  },
  {
    title: 'ورق ۱.۲۵×۲.۵ متر ضخامت ۲ میل',
    weight: 49.56
  },
  {
    title: 'ورق ۱.۲۵×۲.۵ متر ضخامت ۳ میل',
    weight: 74.34
  }
]
</script>

<template>
  <main class="calculator-page selection:bg-[#84012b7a]">

    <section class="hero mt-[4.5rem] text-transparent text-4xl bg-clip-text bg-gradient-to-l pb-2 from-[#84012B] to-[#ff477e]">

      <h1>
        ماشین حساب آنلاین محاسبه وزن استیل
      </h1>

      <p class="hero-description">
        با استفاده از ماشین حساب وزن استیل استیل مهفا می‌توانید وزن تقریبی
        ورق استیل، لوله استیل، میلگرد استیل، پروفیل استیل و شش پر استیل را
        بر اساس ابعاد و چگالی استاندارد محاسبه کنید.
      </p>

    </section>

    <SteelCalculator />



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

<td>میلگرد استیل 304</td>

<td>Ø10</td>

<td>0.62 kg</td>

</tr>

<tr>

<td>میلگرد استیل 304</td>

<td>Ø20</td>

<td>2.49 kg</td>

</tr>

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

<tr>

<td>ورق استیل</td>

<td>1 mm</td>

<td>7.93 kg/m²</td>

</tr>

<tr>

<td>ورق استیل</td>

<td>2 mm</td>

<td>15.86 kg/m²</td>

</tr>

<tr>

<td>ورق استیل</td>

<td>3 mm</td>

<td>23.79 kg/m²</td>

</tr>

<tr>

<td>ورق استیل</td>

<td>5 mm</td>

<td>39.65 kg/m²</td>

</tr>

</tbody>

</table>

</div>



    <section class="calculator-seo w-[50%] m-auto mb-[5rem]">
      <h2>محاسبه وزن استیل به صورت آنلاین</h2>
        
      <p>
        ماشین حساب وزن استیل استیل مهفا امکان محاسبه سریع و دقیق وزن انواع
        مقاطع استیل را بر اساس ابعاد واقعی فراهم می‌کند. این ابزار برای
        مهندسان، پیمانکاران، تولیدکنندگان، مجریان پروژه و خریداران استیل
        طراحی شده است تا بدون نیاز به جدول‌های وزنی بتوانند وزن تقریبی هر
        قطعه را تنها با وارد کردن ابعاد محاسبه کنند.
      </p>
    
      <p>
        تمامی فرمول‌های استفاده شده در این ابزار بر اساس روابط مهندسی و
        چگالی استاندارد استیل طراحی شده‌اند و نتایج ارائه شده برای برآورد
        وزن، قیمت و حمل بار کاملاً مناسب هستند.
      </p>
    
      <h2>محاسبه وزن ورق استیل</h2>
    
      <p>
        برای محاسبه وزن ورق استیل کافی است طول، عرض و ضخامت ورق را وارد کنید.
        ماشین حساب به صورت خودکار وزن ورق را بر اساس چگالی گریدهای مختلف
        استیل محاسبه می‌کند.
      </p>
    
      <h2>محاسبه وزن لوله استیل</h2>
    
      <p>
        در محاسبه وزن لوله استیل قطر خارجی، ضخامت دیواره و طول لوله در نظر
        گرفته می‌شود. این ابزار برای انواع لوله‌های صنعتی، دکوراتیو و
        صنایع غذایی مناسب است.
      </p>
    
      <h2>محاسبه وزن میلگرد استیل</h2>
    
      <p>
        برای محاسبه وزن میلگرد استیل تنها کافی است قطر و طول شاخه را وارد
        کنید. این محاسبه برای میلگردهای استیل 304، 316، 310 و 420 نیز قابل
        استفاده است.
      </p>
    
      <h2>محاسبه وزن پروفیل استیل</h2>
    
      <p>
        ماشین حساب وزن پروفیل استیل برای انواع قوطی و پروفیل‌های صنعتی و
        دکوراتیو قابل استفاده است و وزن را بر اساس ابعاد واقعی مقطع محاسبه
        می‌کند.
      </p>
    
      <h2>چرا محاسبه وزن استیل اهمیت دارد؟</h2>
    
      <ul>
        <li>برآورد هزینه خرید</li>
        <li>محاسبه قیمت نهایی پروژه</li>
        <li>تخمین هزینه حمل و نقل</li>
        <li>انتخاب مناسب تجهیزات جابجایی</li>
        <li>کاهش خطای سفارش</li>
      </ul>
    </section>

    <section class="faq-section">

      <h2>سوالات متداول درباره محاسبه وزن استیل</h2>

      <div class="faq-item">
      <h3>آیا محاسبه وزن استیل دقیق است؟</h3>
      
      <p>
      این ماشین حساب بر اساس فرمول‌های مهندسی و چگالی استاندارد استیل طراحی شده است.
      نتیجه برای برآورد وزن، قیمت و حمل بار کاملاً مناسب است، اما ممکن است با توجه به
      تلرانس تولید کارخانه اختلاف بسیار جزئی وجود داشته باشد.
      </p>
      </div>

      <div class="faq-item">
      <h3>این ابزار از چه گریدهایی پشتیبانی می‌کند؟</h3>
      
      <p>
      محاسبه وزن برای تمامی گریدهای رایج استیل مانند 304، 304L، 310، 310S،
      316، 316L، 321، 420، 430 و سایر گریدها قابل استفاده است.
      </p>

      </div>

      <div class="faq-item">
      
      <h3>آیا ماشین حساب قیمت را هم محاسبه می‌کند؟</h3>
      
      <p>
      
      بله.
      کافی است قیمت هر کیلوگرم استیل را وارد کنید تا قیمت کل قطعه به صورت
      خودکار محاسبه شود.
      
      </p>

      </div>

      <div class="faq-item">
      
      <h3>آیا این ابزار برای پروفیل، لوله و میلگرد استیل مناسب است؟</h3>
      
      <p>
      
      بله.
      در حال حاضر امکان محاسبه وزن ورق استیل، لوله استیل، میلگرد استیل،
      پروفیل استیل و شش پر استیل وجود دارد.
      
      </p>

      </div>

      <div class="faq-item">
      
      <h3>چرا وزن محاسبه شده با جدول وزن استیل تفاوت دارد؟</h3>
      
      <p>
      
      وزن واقعی هر قطعه ممکن است به دلیل تلرانس ضخامت، تلرانس قطر،
      نوع تولید و استاندارد کارخانه چند درصد اختلاف داشته باشد.
      ماشین حساب بر اساس ابعاد اسمی قطعه محاسبه انجام می‌دهد.
      
      </p>

      </div>

    </section>


    <section class="calculator-cta">

        <h2>
        استعلام قیمت روز استیل
        </h2>

        <p>
        
        اگر پس از محاسبه وزن، قصد خرید ورق استیل، لوله استیل،
        میلگرد استیل، پروفیل استیل یا سایر مقاطع استیل را دارید،
        کارشناسان فروش استیل مهفا آماده ارائه قیمت روز و مشاوره تخصصی هستند.
        
        </p>

        <a
        href="tel:02166394159"
        class="call-button"
        >

        تماس با کارشناسان فروش
        021-66394159

        </a>

    </section>

  </main>
</template>
<style>
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
    width: 80%;
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