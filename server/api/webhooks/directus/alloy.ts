import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // NOTE: Pricing Sync is now handled directly by MySQL Trigger 'after_alloy_update'
  // This endpoint remains active to prevent Directus webhook timeout errors, 
  // but the actual heavy lifting (3500+ product updates) happens instantaneously in the DB.
  
  return { 
    status: 'success', 
    message: 'Acknowledged. Pricing sync executed automatically by MySQL Database Trigger.' 
  }
})
