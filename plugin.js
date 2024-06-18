"use strict"

const fp = require("fastify-plugin")

const fastifyStripe = (fastify, options, done) => {
  const { apiKey, name, ...stripeOptions } = options

  if (!apiKey) {
    return done(new Error("You must provide a Stripe API key"))
  }

  const stripe = require("stripe")(apiKey, stripeOptions)

  if (name) {
    if (stripe[name]) {
      return done(
        new Error(`fastify-stripe-versioned '${name}' is a reserved keyword`)
      )
    } else if (!fastify.stripe) {
      fastify.decorate("stripe", Object.create(null))
    } else if (Object.prototype.hasOwnProperty.call(fastify.stripe, name)) {
      return done(
        new Error(`Stripe '${name}' instance name has already been registered`)
      )
    }

    fastify.stripe[name] = stripe
  } else {
    if (fastify.stripe) {
      return done(
        new Error("fastify-stripe-versioned has already been registered")
      )
    } else {
      fastify.decorate("stripe", stripe)
    }
  }

  done()
}

module.exports = fp(fastifyStripe, {
  fastify: ">=4.0.0",
  name: "fastify-stripe-versioned",
})
