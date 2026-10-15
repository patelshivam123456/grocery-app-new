import { createSelector } from "@reduxjs/toolkit";

const EMPTY_CART = Object.freeze({});
const EMPTY_PRODUCTS = Object.freeze([]);
const EMPTY_REVIEWS = Object.freeze([]);

export const selectProductById = (state, id) => state.products.items.find((item) => item.id === id);
export const selectProductReviews = (state, id) => state.products.reviews?.[id] || EMPTY_REVIEWS;
export const FREE_DELIVERY_MIN = 99;

export const selectWishlistProducts = createSelector(
  [(state) => state.products.items, (state) => state.wishlist.ids],
  (products, ids) => products.filter((product) => ids.includes(product.id))
);

export const selectUserOrders = createSelector(
  [(state) => state.orders.items, (state) => state.auth.isLoggedIn, (state) => state.auth.mobile],
  (orders, isLoggedIn, mobile) => orders.filter((order) => isLoggedIn && order.userMobile === mobile)
);

export const selectCartLines = createSelector(
  [
    (state) => state.cart?.items || EMPTY_CART,
    (state) => state.cart?.units || EMPTY_CART,
    (state) => state.products?.items || EMPTY_PRODUCTS
  ],
  (items, units, products) => Object.entries(items)
    .map(([key, qty]) => {
      const productId = key.split("::")[0];
      const product = products.find((item) => item.id === productId);
      if (!product || !qty) return null;
      const unit = units[key];
      const unitPrice = Number(unit?.price);
      const unitMrp = Number(unit?.mrp);
      const cartProduct = unit
        ? {
            ...product,
            quantity: unit.label || product.quantity,
            price: Number.isFinite(unitPrice) ? unitPrice : product.price,
            mrp: Number.isFinite(unitMrp) ? unitMrp : product.mrp,
            image: unit.image || product.image,
            imageGallery: unit.imageGallery?.length ? unit.imageGallery : product.imageGallery
          }
        : product;
      const price = Number(cartProduct.price) || 0;
      return { cartKey: key, product: cartProduct, productId, unit, qty, lineTotal: price * qty };
    })
    .filter(Boolean)
);

export const selectCartTotals = createSelector(
  [selectCartLines, (state) => state.cart?.coupon],
  (lines, coupon) => {
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const delivery = subtotal >= FREE_DELIVERY_MIN || subtotal === 0 ? 0 : 25;
    const platform = subtotal ? 7 : 0;
    const discount = coupon && subtotal >= coupon.min ? coupon.discount : 0;
    return {
      subtotal,
      delivery,
      platform,
      discount,
      total: Math.max(subtotal + delivery + platform - discount, 0),
      count: lines.reduce((sum, line) => sum + line.qty, 0)
    };
  }
);

export const selectSelectedAddress = (state) =>
  state.location.addresses.find((item) => item.id === state.location.selectedAddressId) || null;

export const selectIsLoggedIn = (state) => Boolean(state.auth?.isLoggedIn);

export const selectWalletBalance = (state) => Number(state.user?.wallet) || 0;

export const selectVisibleWalletBalance = (state) => (selectIsLoggedIn(state) ? selectWalletBalance(state) : 0);
