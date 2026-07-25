export default defineCachedEventHandler(() => {
  console.log('RUNNING API')

  return {
    time: Date.now()
  }
}, {
  maxAge: 300
})