export default defineCachedEventHandler(async () => {
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
  maxAge: 3600, // کش کردن اطلاعات برای ۱ ساعت تا سرعت سایت نور باشد
  swr: false,
  name: 'globals-cache'
})