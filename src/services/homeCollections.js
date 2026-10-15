export const HOME_COLLECTIONS = [
  { title: "Snacks & Drinks", subtitle: "Something crunchy. Something refreshing.", emoji: "🍿", match: /\b(snacks?|namkeen|chips|crisps|popcorn|biscuits?|cookies|drinks?|beverages?|juice|juices|soda|cola|lemonade)\b/i },
  { title: "Olive Oils", subtitle: "A little goodness in every drizzle", emoji: "🫒", match: /\bolive\s+oils?\b/i },
  { title: "Chips & Crisps", subtitle: "Your next movie-night companion", emoji: "🥔", match: /\b(chips|crisps|wafers|nachos|tortilla chips)\b/i },
  { title: "Juices & Healthy Drinks", subtitle: "Refreshing picks for your everyday", emoji: "🧃", match: /\b(juices?|smoothies?|coconut water|kombucha|healthy drinks?|health drinks?|fruit drinks?|aloe vera drink)\b/i },
  { title: "Instant Foods", subtitle: "Little prep. Lots of comfort.", emoji: "🍜", match: /\b(instant|noodles?|pasta|ready[ -]to[ -](eat|cook)|cup soup|cup noodles|maggi|ramen|vermicelli)\b/i },
  { title: "Tea, Coffee & more", subtitle: "For your favourite pause of the day", emoji: "☕", match: /\b(tea|coffee|chai|matcha|cocoa|hot chocolate)\b/i },
  { title: "Spreads & Sauces", subtitle: "Small additions. Big flavour.", emoji: "🍯", match: /\b(spreads?|sauces?|ketchup|mayonnaise|mayo|jam|jams|marmalade|peanut butter|almond butter|chocolate spread|chutney|chutneys|mustard|honey)\b/i }
];

export const SEASONAL_COLLECTIONS = [
  { title: "Seasonal Fruits", subtitle: "Fresh fruit picks for your basket", emoji: "🍎", match: /\bfruits?\b/i },
  { title: "Seasonal Vegetables", subtitle: "Fresh greens and everyday veggie favourites", emoji: "🥬", match: /\b(vegetables?|veggies)\b/i }
];

export const EXPLORE_COLLECTIONS = [
  { title: "Breakfast club", subtitle: "Start the day right", emoji: "🥣", color: "#FFF1DA", match: /\b(breakfast|milk|bread|eggs?|oats|cereals?|cornflakes|muesli)\b/i },
  { title: "Snack break", subtitle: "A little pick-me-up", emoji: "🍿", color: "#F1EBFF", match: HOME_COLLECTIONS[0].match },
  { title: "Kitchen staples", subtitle: "Keep the pantry happy", emoji: "🛍️", color: "#EAF5E9", match: /\b(atta|rice|dal|daal|lentils?|flour|oils?|spices?|salt|sugar)\b/i },
  { title: "Sip & unwind", subtitle: "Find your favourite sip", emoji: "☕", color: "#FDEBE4", match: /\b(tea|coffee|chai|juices?|drinks?|beverages?|smoothies?)\b/i }
];

export function productsForCollection(products, categories, match) {
  const categoryNames = new Map();
  const addCategories = (items) => items.forEach((category) => {
    categoryNames.set(category.id, category.name);
    addCategories(category.subcategories || []);
  });
  addCategories(categories);
  return products.filter((product) => match.test([
    product.name, product.categoryName, product.subCategory, product.section,
    categoryNames.get(product.category), categoryNames.get(product.subCategoryPublicId),
    ...(Array.isArray(product.tags) ? product.tags : [])
  ].filter(Boolean).join(" ")));
}

export function buyAgainProducts(products, orders, mobile, isLoggedIn) {
  if (!isLoggedIn || !mobile) return [];
  const productMap = new Map(products.map((product) => [product.id, product]));
  const seen = new Set();
  return orders
    .filter((order) => order.userMobile === mobile && order.status !== "Cancelled")
    .slice()
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
    .flatMap((order) => order.lines || [])
    .flatMap((line) => {
      const id = line.productId || line.product?.id;
      if (seen.has(id) || !productMap.has(id)) return [];
      seen.add(id);
      return [productMap.get(id)];
    });
}

export function featuredProducts(products) {
  const tagged = products.filter((product) => (product.tags || []).some((tag) => /^(featured|bestseller|best seller)$/i.test(tag)));
  return tagged.length ? tagged : [...products].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || (parseInt(b.discount, 10) || 0) - (parseInt(a.discount, 10) || 0));
}

export function curatedProducts(products, recent, purchased, wishlistIds) {
  const favourites = new Set([...recent, ...purchased, ...products.filter((product) => wishlistIds.includes(product.id))].map((product) => product.category).filter(Boolean));
  const score = (product) => (favourites.has(product.category) ? 10 : 0) + (wishlistIds.includes(product.id) ? 5 : 0) + (Number(product.rating) || 0);
  return [...products].sort((a, b) => score(b) - score(a));
}
