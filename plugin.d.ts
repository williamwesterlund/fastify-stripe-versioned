import { FastifyPluginCallback } from "fastify"
import { PostHog, PostHogOptions } from "posthog-node"

/**
 * @docs https://posthog.com/docs/libraries/node
 */
export interface FastifyPostHogOptions extends PostHogOptions {
  /**
   * PostHog API Key
   * @docs https://posthog.com/docs/libraries/node
   */
  apiKey: string

  /**
   * fastify-posthog instance name, for supporting multiple instances
   */
  name?: string
}

export interface FastifyPostHogNamedInstance {
  [name: string]: PostHog;
}

export type FastifyPostHog = FastifyPostHogNamedInstance & PostHog;

declare module "fastify" {
  interface FastifyInstance {
    posthog: FastifyPostHog
  }
}

export const FastifyPostHogPlugin: FastifyPluginCallback<FastifyPostHogOptions>
export default FastifyPostHogPlugin
