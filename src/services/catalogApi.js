import { productService } from "./product.service";

const PLACEHOLDER_IMAGE = "▣";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "";

export const endpoints = {
  categories: "/e-comm-admin/category/v1/get-all",
  products: "/e-comm-admin/product/v1/get-all?filter=all",
  productsByCategory: (categoryPublicId) =>
    `/e-comm-admin/product/v1/get-all?filter=all&categoryPublicId=${encodeURIComponent(categoryPublicId)}`
};

export const catalogApi = {
  getCategories: () => productService.getCategories().then((payload) => payload?.data || []),
  getProducts: () => productService.getProducts().then((payload) => payload?.data || []),
  getProductsByCategory: (categoryPublicId) => productService.getProductsByCategory(categoryPublicId).then((payload) => payload?.data || [])
};

const toTagArray = (tags) => {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (!tags) return [];
  return String(tags).split(",").map((tag) => tag.trim()).filter(Boolean);
};

const toImageUrl = (value) => {
  if (typeof value !== "string") return null;
  const image = value.trim();
  if (!image) return null;
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return `${API_URL}${image}`;
  return `${API_URL}/${image}`;
};

const imageListForVariant = (variant = {}) =>
  [variant.productImage1, variant.productImage2, variant.productImage3, variant.productImage4, variant.productImage5]
    .map(toImageUrl)
    .filter(Boolean);

const displayAmount = (variant = {}) => {
  const amount = variant.amount ? String(variant.amount).trim() : "";
  const unit = variant.measuringUnit ? String(variant.measuringUnit).trim() : "";
  return variant.variantName || [amount, unit].filter(Boolean).join(" ") || unit || "1 unit";
};

export function normalizeCategories(rawCategories = []) {
  return rawCategories.map((category) => {
    const subcategories = normalizeCategories(category.subCategoryDtoList || []);
    return {
      ...category,
      id: category.categoryPublicId,
      name: category.categoryName,
      description: category.categoryDescription,
      iconUrl: toImageUrl(category.categoryIconUrl),
      emoji: toImageUrl(category.categoryIconUrl) || "▣",
      sections: subcategories.map((item) => item.name),
      tags: toTagArray(category.tags),
      subcategories,
      subCategoryDtoList: subcategories
    };
  });
}

export function normalizeProduct(rawProduct = {}, categories = []) {
  const variants = (rawProduct.productVariantList || [])
    .filter((variant) => variant?.isActive !== false)
    .map((variant) => {
      const images = imageListForVariant(variant);
      return {
        ...variant,
        id: variant.productVariantPublicId,
        label: displayAmount(variant),
        quantity: displayAmount(variant),
        price: Number(variant.sellingPrice) || 0,
        mrp: Number(variant.mrp) || Number(variant.sellingPrice) || 0,
        discount: `${Math.round(Number(variant.discountPercentage) || 0)}%`,
        discountValue: Number(variant.discountPercentage) || 0,
        rating: Number(variant.rating) || 0,
        stock: Number(variant.stockQuantity) || 0,
        weight: variant.amount || variant.variantName || "",
        unit: variant.measuringUnit || variant.variantName || "",
        amount: variant.amount || "",
        imageGallery: images,
        image: images[0] || PLACEHOLDER_IMAGE,
        returnable: Boolean(variant.isReturnable),
        codAvailable: Boolean(variant.isCodAvailable)
      };
    });
  const activeVariant = variants[0] || {
    id: rawProduct.productPublicId,
    label: "1 unit",
    quantity: "1 unit",
    price: 0,
    mrp: 0,
    discount: "0%",
    rating: 0,
    stock: 0,
    imageGallery: [],
    image: PLACEHOLDER_IMAGE
  };
  const categoryIds = rawProduct.categoryPublicIdList || [];
  const parentCategory = categories.find((category) => categoryIds.includes(category.id));
  const subCategory = categories
    .flatMap((category) => category.subcategories || [])
    .find((category) => categoryIds.includes(category.id));
  const tags = toTagArray(rawProduct.tags);

  return {
    ...rawProduct,
    id: rawProduct.productPublicId,
    name: rawProduct.name || activeVariant.productName || "Product",
    category: parentCategory?.id || categoryIds[0] || "",
    categoryName: parentCategory?.name || "",
    subCategory: subCategory?.name || "",
    subCategoryPublicId: subCategory?.id || "",
    section: subCategory?.name || parentCategory?.name || "",
    brand: rawProduct.brand || "Just Harvst",
    desc: rawProduct.shortDescription || rawProduct.description || "",
    shortDescription: rawProduct.shortDescription || "",
    description: rawProduct.description || rawProduct.shortDescription || "",
    hsn: rawProduct.hsnCode,
    additionalDetails: rawProduct.additionalDetails || {},
    countryOfOrigin: rawProduct.additionalDetails?.countryOfOrigin || "India",
    tags,
    productVariantList: variants,
    variants,
    selectedVariant: activeVariant,
    quantity: activeVariant.quantity,
    price: activeVariant.price,
    discountPrice: activeVariant.price,
    mrp: activeVariant.mrp,
    discount: activeVariant.discount,
    rating: activeVariant.rating,
    stock: activeVariant.stock,
    weight: activeVariant.weight,
    unit: activeVariant.unit,
    amount: activeVariant.amount,
    image: activeVariant.image,
    imageGallery: activeVariant.imageGallery,
    returnable: activeVariant.returnable,
    codAvailable: activeVariant.codAvailable,
    totalReviews: 0,
    deliveryTime: "8-15 mins",
    features: [
      rawProduct.brand,
      parentCategory?.name,
      subCategory?.name,
      ...tags
    ].filter(Boolean)
  };
}

export function applyVariant(product, variant) {
  if (!product || !variant) return product;
  return {
    ...product,
    selectedVariant: variant,
    quantity: variant.quantity,
    price: variant.price,
    discountPrice: variant.price,
    mrp: variant.mrp,
    discount: variant.discount,
    rating: variant.rating,
    stock: variant.stock,
    weight: variant.weight,
    unit: variant.unit,
    amount: variant.amount,
    image: variant.image,
    imageGallery: variant.imageGallery,
    returnable: variant.returnable,
    codAvailable: variant.codAvailable
  };
}

export { PLACEHOLDER_IMAGE };
