import test from "node:test";
import assert from "node:assert/strict";
import { productsForCategory } from "../src/services/categoryProducts.js";

const vegetables = { id: "veg", subcategories: [{ id: "leafy", subcategories: [{ id: "herbs" }] }] };
const fruit = { id: "fruit" };
const products = [
  { id: "carrot", category: "veg" },
  { id: "spinach", subCategoryPublicId: "leafy" },
  { id: "mint", category: "herbs" },
  { id: "apple", category: "fruit" },
  { id: "mixed", category: "other", categoryPublicIdList: ["veg", "fruit"] },
  { id: "other" }
];

test("All shows the full catalog before and after switching categories", () => {
  assert.strictEqual(productsForCategory(products, null), products);
  productsForCategory(products, vegetables);
  assert.strictEqual(productsForCategory(products, null), products);
});

test("a category includes its products, nested subcategories and multiple memberships", () => {
  assert.deepEqual(productsForCategory(products, vegetables).map((product) => product.id), ["carrot", "spinach", "mint", "mixed"]);
  assert.deepEqual(productsForCategory(products, fruit).map((product) => product.id), ["apple", "mixed"]);
  assert.equal(products.length, 6);
});

test("an empty category returns no unrelated products", () => {
  assert.deepEqual(productsForCategory(products, { id: "dairy" }), []);
  assert.deepEqual(productsForCategory([], vegetables), []);
});
