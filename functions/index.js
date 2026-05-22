"use strict";

exports.handler = async (event, context) => {
  const url = process.env.URL;
  if (!url) {
    throw new Error("URL environment variable is not set");
  }

  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
};
