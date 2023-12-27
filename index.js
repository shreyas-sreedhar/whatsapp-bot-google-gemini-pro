const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const s3 = require("./s3"); //Adding the aws s3 connection file.
const wapi = require("./whatsapp")

// Access your API key as an environment variable (see "Set up your API key" above)

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Write a story about a Lord Ganesh and his travel around the world in 200 words."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run();