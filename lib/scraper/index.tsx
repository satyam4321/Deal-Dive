"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice, extractDescription, extractCurrency } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  // BrightData proxy configuration
  //   const username = String(process.env.BRIGHT_DATA_USERNAME);
  //   const password = String(process.env.BRIGHT_DATA_PASSWORD);
  //   const port = 22225;
  //   const session_id = (1000000 * Math.random()) | 0;

  //   const options = {
  //     auth: {
  //       username: `${username}-session-${session_id}`,
  //       password,
  //     },
  //     host: 'brd.superproxy.io',
  //     port,
  //     rejectUnauthorized: false,
  //   }

  try {
    // Fetch the product page
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    // console.log(response.data);
  
    // console.log("Data: ", response);
    // Extract the product title
    const title = $("#productTitle").text().trim();
    const currency = extractCurrency($(".a-price-symbol"));
    const currentPrice = extractPrice(
      currency,
      $('.a-price .a-offscreen'),
      $('.a-section .priceToPay .a-offscreen'),
      $('.a.size.base.a-color-price'),
      $('.apexPriceToPay.a-price.a-text-price span.a-offscreen'),
      $(".a-button-selected .a-color-base")
    );

    const originalPrice = extractPrice(
      currency,
      $('#priceblock_ourprice'),
      $('.basisPrice .a-price.a-text-price span.a-offscreen'),
      $('#corePrice_desktop .a-price.a-text-price span.a-offscreen'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(images));

    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

    const description = extractDescription($);

    // // Construct data object with scraped information
    const data = {
      url,
      currency: currency || "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: "category",
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };
    // console.log("Data: ", data);
    return data;
  } catch (error: any) {
    console.log(error);
  }
}
