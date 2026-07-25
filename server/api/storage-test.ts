import { useStorage } from 'nitropack/runtime'

export default defineEventHandler(async () => {

  const storage = useStorage('cache')

  console.log(storage)

  return {
    ok: true
  }
})