"use strict"

const { test } = require("tap")
const Fastify = require("fastify")
const fastifyStripe = require("../plugin") // Adjust the path as necessary

test("fastify.stripe namespace should exist", async (t) => {
  t.plan(7)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
    apiVersion: "2024-04-10",
    maxNetworkRetries: 3,
    timeout: 20000,
    port: 8080,
  })

  await fastify.ready()

  t.ok(fastify.stripe)
  t.ok(fastify.stripe.balance)
  t.ok(fastify.stripe.customers)

  t.equal(fastify.stripe._api.maxNetworkRetries, 3)
  t.equal(fastify.stripe._api.timeout, 20000)
  t.equal(fastify.stripe._api.version, "2024-04-10")
  t.equal(fastify.stripe._api.port, 8080)
})

test("fastify.stripe should allow for named instances", async (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
    apiVersion: "2024-04-10",
    maxNetworkRetries: 3,
    timeout: 20000,
    port: 8080,
    name: "testInstance",
  })

  await fastify.ready()

  t.ok(fastify.stripe.testInstance)
  t.notOk(
    fastify.stripe.customers,
    "Default instance should not exist when named instance is used"
  )
})

test("it should fail without a Stripe API key", async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifyStripe, {})

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(err.message, "You must provide a Stripe API key")
  }
})

test("it should not allow reserved keyword as instance name", async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
    name: "customers", // Using 'customers' as it's a method on PostHog instance
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(
      err.message,
      "fastify-stripe-versioned 'customers' is a reserved keyword"
    )
  }
})

test("it should not allow registering the same named instance more than once", async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
    name: "testInstance",
  })

  fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
    name: "testInstance",
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(
      err.message,
      "Stripe 'testInstance' instance name has already been registered"
    )
  }
})

test("it should not allow registering more than one unnamed instance", async (t) => {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  await fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
  })

  fastify.register(fastifyStripe, {
    apiKey: "test_stripe_api_key",
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.equal(err.message, "fastify-stripe-versioned has already been registered")
  }
})

test("fastify-stripe-versioned should not throw if registered within different scopes (with and without named instances)", (t) => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(function scopeOne(instance, opts, done) {
    instance.register(fastifyStripe, {
      apiKey: "test_stripe_api_key",
    })

    done()
  })

  fastify.register(function scopeTwo(instance, opts, done) {
    instance.register(fastifyStripe, {
      apiKey: "test_stripe_api_key",
      name: "testInstance",
    })

    instance.register(fastifyStripe, {
      apiKey: "test_stripe_api_key",
      name: "anotherTestInstance",
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
