'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const fastifyPostHog = require('../plugin') // Adjust the path as necessary

test('fastify.posthog namespace should exist', async (t) => {
  t.plan(4)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key',
    host: 'https://eu.posthog.com',
    maxBatchSize: 1337
  })

  await fastify.ready()

  t.ok(fastify.posthog)
  t.ok(typeof fastify.posthog.capture === 'function')
  t.ok(fastify.posthog.options.host === 'https://eu.posthog.com')
  t.ok(fastify.posthog.options.maxBatchSize === 1337)
})

test('fastify.posthog should allow for named instances', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key',
    host: 'https://eu.posthog.com',
    name: 'testInstance'
  })

  await fastify.ready()

  t.ok(fastify.posthog.testInstance)
  t.ok(typeof fastify.posthog.testInstance.capture === 'function')
  t.notOk(
    fastify.posthog.capture,
    'Default instance should not exist when named instance is used'
  )
})

test('it should fail without a PostHog API key', async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifyPostHog, {})

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(err.message, 'You must provide a PostHog API key')
  }
})

test('it should not allow reserved keyword as instance name', async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key',
    name: 'capture' // Using 'capture' as it's a method on PostHog instance
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(err.message, "fastify-posthog 'capture' is a reserved keyword")
  }
})

test('it should not allow registering the same named instance more than once', async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key',
    name: 'testInstance'
  })

  fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key',
    name: 'testInstance'
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(err.message, "Posthog 'testInstance' instance name has already been registered")
  }
})

test('it should not allow registering more than one unnamed instance', async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key'
  })

  fastify.register(fastifyPostHog, {
    apiKey: 'test_posthog_api_key'
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(err.message, 'fastify-posthog has already been registered')
  }
})

test('fastify-posthog should not throw if registered within different scopes (with and without named instances)', (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(function scopeOne (instance, opts, done) {
    instance.register(fastifyPostHog, {
      apiKey: 'test_posthog_api_key'
    })

    done()
  })

  fastify.register(function scopeTwo (instance, opts, done) {
    instance.register(fastifyPostHog, {
      apiKey: 'test_posthog_api_key',
      name: 'testInstance'
    })

    instance.register(fastifyPostHog, {
      apiKey: 'test_posthog_api_key',
      name: 'anotherTestInstance'
    })

    done()
  })

  fastify.ready((err) => {
    // Ensuring no errors are thrown during the plugin registration
    t.error(err)
    // Explicitly checking if `err` is undefined
    t.equal(err, null)
  })
})
