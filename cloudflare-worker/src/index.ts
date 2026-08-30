// src/index.ts

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    // Your triggers array fires at both 9:00 and 10:00 UTC to cover
    // EST/EDT — this check makes sure only the one that's actually
    // 5am Eastern right now does anything.
    const easternHour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      }).format(new Date())
    )

    if (easternHour !== 5) {
      console.log(`Skipping — it's ${easternHour}:00 Eastern, not 5am`)
      return
    }

    console.log('5am ET — triggering GSB rebuild')

    const res = await fetch(env.CF_DEPLOY_HOOK_URL, {
      method: 'POST',
    })

    if (res.ok) {
      console.log('✅ Deploy hook triggered successfully')
    } else {
      console.error(`❌ Deploy hook failed: ${res.status} ${res.statusText}`)
    }
  },
} satisfies ExportedHandler<Env>

interface Env {
  CF_DEPLOY_HOOK_URL: string
}