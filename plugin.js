'use strict'

const fp = require('fastify-plugin')

const fastifyPostHog = (fastify, options, done) => {
  const { apiKey, name, ...postHogOptions } = options

  if (!apiKey) {
    return done(new Error('You must provide a PostHog API key'))
  }

  const { PostHog } = require('posthog-node')
  const posthog = new PostHog(apiKey, postHogOptions)

  if (name) {
    if (posthog[name]) {
      return done(new Error(`fastify-posthog '${name}' is a reserved keyword`))
    } else if (!fastify.posthog) {
      fastify.decorate('posthog', Object.create(null))
    } else if (Object.prototype.hasOwnProperty.call(fastify.posthog, name)) {
      return done(new Error(`Posthog '${name}' instance name has already been registered`))
    }

    fastify.posthog[name] = posthog
  } else {
    if (fastify.posthog) {
      return done(new Error('fastify-posthog has already been registered'))
    } else {
      fastify.decorate('posthog', posthog)
    }
  }

  done()
}

module.exports = fp(fastifyPostHog, {
  fastify: '>=4.0.0',
  name: 'fastify-posthog'
})
