function words(value) {
  return String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

export function productMatchesSearch(product, query) {
  const queryWords = words(query);
  if (!queryWords.length) return false;

  const categoryFields = [product.categoryName, product.subCategory, product.section].filter(Boolean);
  // A combined category is searchable as a whole, not as each of its products.
  // Otherwise every rice product in "Atta, Rice, Daal" also matches "atta".
  if (categoryFields.some((field) => words(field).join(" ") === queryWords.join(" "))) return true;

  const searchableWords = words([
    product.name,
    product.brand,
    ...categoryFields.filter((field) => !/[,/&|+]|\band\b/i.test(field)),
    ...(product.tags || []),
    ...(product.variants || []).map((variant) => variant.variantName || variant.label)
  ].filter(Boolean).join(" "));

  return queryWords.every((term) => searchableWords.some((word) => word.startsWith(term)));
}
