export function productsForCategory(products, category) {
  if (!category) return products;
  const categoryIds = new Set();
  const collectIds = (item) => {
    categoryIds.add(item.id);
    (item.subcategories || []).forEach(collectIds);
  };
  collectIds(category);
  return products.filter((product) => [
    product.category,
    product.subCategoryPublicId,
    ...(product.categoryPublicIdList || [])
  ].some((id) => id != null && categoryIds.has(id)));
}
