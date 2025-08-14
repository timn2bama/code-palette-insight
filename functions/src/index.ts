import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

// Helper function to map weather conditions to icons
const getWeatherIcon = (condition: string): string => {
  const lowerCaseCondition = condition.toLowerCase();
  if (lowerCaseCondition.includes("sun") || lowerCaseCondition.includes("clear")) {
    return "☀️";
  }
  if (lowerCaseCondition.includes("cloud")) {
    return "☁️";
  }
  if (lowerCaseCondition.includes("rain") || lowerCaseCondition.includes("drizzle")) {
    return "🌧️";
  }
  if (lowerCaseCondition.includes("thunder") || lowerCaseCondition.includes("storm")) {
    return "⛈️";
  }
  if (lowerCaseCondition.includes("snow")) {
    return "❄️";
  }
  if (lowerCaseCondition.includes("mist") || lowerCaseCondition.includes("fog") || lowerCaseCondition.includes("haze")) {
    return "🌫️";
  }
  return "🌤️"; // Default for partly cloudy etc.
};

export const getWeather = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated if you want to protect the function
  // if (!context.auth) {
  //   throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  // }

  const { latitude, longitude } = data;

  // Input validation
  if (!latitude || !longitude || typeof latitude !== "number" || typeof longitude !== "number") {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with two arguments 'latitude' and 'longitude'.");
  }

  const apiKey = functions.config().weatherapi?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError("internal", "Weather API key not configured.");
  }

  const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=6&aqi=no&alerts=no`;

  try {
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Process forecast data
    const dailyForecasts = weatherData.forecast.forecastday
      .slice(1, 6) // Skip today, get next 5 days
      .map((day: any) => ({
        day: new Date(day.date).toLocaleDateString("en-US", { weekday: "long" }),
        high: Math.round(day.day.maxtemp_f),
        low: Math.round(day.day.mintemp_f),
        condition: day.day.condition.text,
        icon: getWeatherIcon(day.day.condition.text),
      }));

    // Format the result to match the client's expectation
    const result = {
      current: {
        temperature: Math.round(weatherData.current.temp_f),
        condition: weatherData.current.condition.text,
        humidity: weatherData.current.humidity,
        windSpeed: Math.round(weatherData.current.wind_mph),
        icon: getWeatherIcon(weatherData.current.condition.text),
        city: weatherData.location.name,
      },
      forecast: dailyForecasts,
    };

    return result;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch weather data.");
  }
});

export const getWeatherMultiple = functions.https.onCall(async (data, context) => {
  const { locations } = data;

  if (!Array.isArray(locations) || locations.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'locations' array.");
  }

  const apiKey = functions.config().weatherapi?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError("internal", "Weather API key not configured.");
  }

  const weatherPromises = locations.map(async (location: any) => {
    try {
      const { latitude, longitude } = location;
      if (!latitude || !longitude) {
        throw new Error("Invalid location object. Missing latitude or longitude.");
      }

      const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=6&aqi=no&alerts=no`;
      const weatherResponse = await axios.get(weatherUrl);
      const weatherData = weatherResponse.data;

      const dailyForecasts = weatherData.forecast.forecastday
        .slice(1, 6)
        .map((day: any) => ({
          day: new Date(day.date).toLocaleDateString("en-US", { weekday: "long" }),
          high: Math.round(day.day.maxtemp_f),
          low: Math.round(day.day.mintemp_f),
          condition: day.day.condition.text,
          icon: getWeatherIcon(day.day.condition.text),
        }));

      return {
        location: location.name || weatherData.location.name,
        latitude,
        longitude,
        current: {
          temperature: Math.round(weatherData.current.temp_f),
          condition: weatherData.current.condition.text,
          humidity: weatherData.current.humidity,
          windSpeed: Math.round(weatherData.current.wind_mph),
          icon: getWeatherIcon(weatherData.current.condition.text),
          city: weatherData.location.name,
        },
        forecast: dailyForecasts,
      };
    } catch (error) {
      console.error(`Error fetching weather for location: ${location.name}`, error);
      return {
        location: location.name || "Unknown",
        latitude: location.latitude,
        longitude: location.longitude,
        error: "Failed to fetch weather data for this location.",
      };
    }
  });

  try {
    const results = await Promise.all(weatherPromises);
    return { locations: results };
  } catch (error) {
    console.error("Error fetching multiple weather data:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch multiple weather data.");
  }
});

export const checkSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { uid, token } = context.auth;
  const { email } = token;

  if (!email) {
    throw new functions.https.HttpsError("internal", "User email not available.");
  }

  const stripeKey = functions.config().stripe?.secret_key;
  if (!stripeKey) {
    throw new functions.https.HttpsError("internal", "Stripe secret key not configured.");
  }

  const stripe = new (await import("stripe")).default(stripeKey, { apiVersion: "2023-10-16" });

  try {
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    const subscribersRef = admin.database().ref(`/subscribers/${uid}`);

    if (customers.data.length === 0) {
      await subscribersRef.set({
        email: email,
        subscribed: false,
        stripe_customer_id: null,
        updated_at: admin.database.ServerValue.TIMESTAMP,
      });
      return { subscribed: false };
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      subscriptionTier = (price.unit_amount || 0) <= 500 ? "Premium" : "Enterprise";
    }

    await subscribersRef.update({
      email: email,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: admin.database.ServerValue.TIMESTAMP,
    });

    return {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
    };
  } catch (error) {
    console.error("Error checking subscription:", error);
    throw new functions.https.HttpsError("internal", "Failed to check subscription status.");
  }
});

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const { email } = context.auth.token;
  if (!email) {
    throw new functions.https.HttpsError("internal", "User email not available.");
  }

  const stripeKey = functions.config().stripe?.secret_key;
  if (!stripeKey) {
    throw new functions.https.HttpsError("internal", "Stripe secret key not configured.");
  }
  const stripe = new (await import("stripe")).default(stripeKey, { apiVersion: "2023-10-16" });

  const customers = await stripe.customers.list({ email: email, limit: 1 });
  let customerId;
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : email,
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "Premium Wardrobe Subscription" },
        unit_amount: 600, // $6.00
        recurring: { interval: "month" },
      },
      quantity: 1,
    }],
    mode: "subscription",
    success_url: `${data.origin}/subscription?success=true`,
    cancel_url: `${data.origin}/subscription?canceled=true`,
  });

  return { url: session.url };
});

export const createCustomerPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const { email } = context.auth.token;
  if (!email) {
    throw new functions.https.HttpsError("internal", "User email not available.");
  }

  const stripeKey = functions.config().stripe?.secret_key;
  if (!stripeKey) {
    throw new functions.https.HttpsError("internal", "Stripe secret key not configured.");
  }
  const stripe = new (await import("stripe")).default(stripeKey, { apiVersion: "2023-10-16" });

  const customers = await stripe.customers.list({ email: email, limit: 1 });
  if (customers.data.length === 0) {
    throw new functions.https.HttpsError("not-found", "No Stripe customer found for this user.");
  }
  const customerId = customers.data[0].id;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${data.origin}/subscription`,
  });

  return { url: portalSession.url };
});
