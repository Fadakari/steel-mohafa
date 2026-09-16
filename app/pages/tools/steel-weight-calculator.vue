<script setup lang="ts">

useSeoMeta({
  title: 'محاسبه وزن استیل و قیمت استیل آنلاین | ماشین حساب استیل',
  description:
    'محاسبه آنلاین وزن ورق، میلگرد، لوله، قوطی و شش پر استیل با امکان محاسبه قیمت بر اساس وزن.',
  keywords:
    'محاسبه وزن استیل، وزن ورق استیل، وزن میلگرد استیل، قیمت استیل'
})


useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://steelmahfa.ir/tools/steel-weight-calculator'
    }
  ]
})


const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ماشین حساب وزن استیل',
  applicationCategory: 'Calculator',
  operatingSystem: 'Web',
  description:
    'ابزار آنلاین محاسبه وزن و قیمت مقاطع استیل'
}


useHead({
  script:[
    {
      type:'application/ld+json',
      children: JSON.stringify(jsonLd)
    }
  ]
})

</script>


<template>

<section class="container mx-auto py-10">

<h1>
محاسبه وزن استیل و قیمت استیل آنلاین
</h1>


<p>
با استفاده از ماشین حساب استیل مهفا می‌توانید وزن تقریبی ورق،
میلگرد، لوله و پروفیل استیل را محاسبه کنید.
</p>


<SteelCalculator />


</section>


</template>
