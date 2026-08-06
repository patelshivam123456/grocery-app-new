export const selectProductById = (state, id) => state.products.items.find((item) => item.id === id);
export const FREE_DELIVERY_MIN = 99;

export const selectCartLines = (state) =>
  Object.entries(state.cart?.items || {})
    .map(([key, qty]) => {
      const productId = key.split("::")[0];
      const product = selectProductById(state, productId);
      if (!product || !qty) return null;
      const unit = state.cart?.units?.[key];
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
    .filter(Boolean);

export const selectCartTotals = (state) => {
  const lines = selectCartLines(state);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = subtotal >= FREE_DELIVERY_MIN || subtotal === 0 ? 0 : 25;
  const platform = subtotal ? 7 : 0;
  const discount = state.cart.coupon ? state.cart.coupon.discount : 0;
  return {
    subtotal,
    delivery,
    platform,
    discount,
    total: Math.max(subtotal + delivery + platform - discount, 0),
    count: lines.reduce((sum, line) => sum + line.qty, 0)
  };
};

export const selectSelectedAddress = (state) =>
  state.location.addresses.find((item) => item.id === state.location.selectedAddressId) || null;
