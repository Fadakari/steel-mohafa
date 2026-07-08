export default defineCachedEventHandler(async () => {
    console.log('Globals API executed', new Date())
  try {
    // گرفتن اطلاعات مستقیما از API دایرکتوس
    // چون Single Collection است، آدرس آن /items/globals است
    const response = await $fetch<{ data: any }>('http://127.0.0.1:8055/items/globals')
    
    return response.data
  } catch (error) {
    console.error('Error fetching globals from Directus:', error)
    return null
  }
}, {
  maxAge: 60, // کش کردن اطلاعات برای ۱ ساعت تا سرعت سایت نور باشد
  swr: true,
  name: 'globals-cache',
})