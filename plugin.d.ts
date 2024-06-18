import { FastifyPluginCallback } from "fastify"
import Stripe from "stripe"

/**
 * @docs https://stripe.com/docs
 */
export interface FastifyStripeOptions extends Stripe.StripeConfig {
  /**
   * Stripe API Key
   *
   * @docs https://stripe.com/docs/api/authentication
   * @docs https://stripe.com/docs/keys
   */
  apiKey: string

  /**
   * fastify-stripe-versioned instance name, for supporting multiple instances
   */
  name?: string
}

export interface FastifyStripeNamedInstance {
  [name: string]: Stripe
}

export type FastifyStripe = FastifyStripeNamedInstance & Stripe

declare module "fastify" {
  interface FastifyInstance {
    stripe: FastifyStripe
  }
}

export const FastifyStripePlugin: FastifyPluginCallback<FastifyStripeOptions>
export default FastifyStripePlugin
