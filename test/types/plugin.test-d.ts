import Fastify from "fastify"
import { expectAssignable, expectType } from "tsd"
import { PostHog, type PostHogOptions } from "posthog-node"
// import fastifyPostHog, { FastifyPostHogNamedInstance } from "../../plugin"

// const app = Fastify()
// app.register(fastifyPostHog, {
//   apiKey: "test_posthog_api_key",
// })

// app.ready(() => {
//   expectAssignable<PostHog>(app.posthog)
//   expectType<PostHogOptions>(app.posthog.options)

//   app.close()
// })

// const appProd = Fastify()
// appProd.register(fastifyPostHog, {
//   apiKey: "test_posthog_api_key",
//   name: "prod"
// })

// appProd.ready(() => {
//   expectAssignable<FastifyPostHogNamedInstance>(appProd.posthog)
//   expectType<PostHog>(appProd.posthog.prod)
//   expectType<PostHogOptions>(appProd.posthog.prod.options)

//   appProd.close()
// })
