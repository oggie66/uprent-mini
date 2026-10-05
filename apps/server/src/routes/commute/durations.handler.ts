import { app, res } from '@/handler'
import { t, DurationsSchema } from '@schemas'
import { parseAddresses } from '~core/commute'
import { randomInt } from '~core/helpers'

const resDTO = t.Object({
  results: t.Array(
    t.Object({
      address: t.String(),
      durations: DurationsSchema,
    }),
  ),
})

export const commuteDurationsEndpointHandler = app.post(
  '/durations',
  ({ body, res }) => {
    let addresses: string[]
    try {
      addresses = parseAddresses(body.addresses)
    } catch (error) {
      return res.badRequest(
        error instanceof Error ? error.message : 'Invalid addresses.',
      )
    }

    return res.ok({
      results: addresses.map(address => ({
        address,
        durations: {
          walking: randomInt(45, 90),
          biking: randomInt(25, 60),
          driving: randomInt(10, 30),
          transit: randomInt(10, 30),
        },
      })),
    })
  },
  {
    body: t.Object({
      addresses: t.Array(t.String({ minLength: 1, maxLength: 200 }), {
        minItems: 1,
        maxItems: 2,
      }),
    }),
    response: res(resDTO),
  },
)
