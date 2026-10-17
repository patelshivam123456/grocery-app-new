import test from "node:test";
import assert from "node:assert/strict";
import { productMatchesSearch } from "../src/services/productSearch.js";

const staples = [
  { name: "Whole Wheat Atta", brand: "Aashirvaad", subCategory: "Atta & Flour" },
  { name: "Basmati Rice", brand: "India Gate", subCategory: "Rice" },
  { name: "Toor Daal", subCategory: "Daal" }
].map((product) => ({ ...product, categoryName: "Atta, Rice, Daal", section: "Atta, Rice, Daal" }));

test("individual staple searches exclude unrelated products in a combined category", () => {
  for (const [query, expected] of [["atta", "Whole Wheat Atta"], ["rice", "Basmati Rice"], ["daal", "Toor Daal"]]) {
    assert.deepEqual(staples.filter((product) => productMatchesSearch(product, query)).map((product) => product.name), [expected]);
  }
});

test("the full combined category still returns all its products", () => {
  for (const query of ["Atta, Rice, Daal", " atta rice daal "]) {
    assert.ok(staples.every((product) => productMatchesSearch(product, query)));
  }
});

test("combined subcategories and sections do not introduce unrelated matches", () => {
  const product = { name: "Basmati Rice", subCategory: "Atta & Rice", section: "Atta and Rice" };
  assert.equal(productMatchesSearch(product, "atta"), false);
  assert.equal(productMatchesSearch(product, "rice"), true);
});

test("search supports brands, tags, variants, single categories and partial words", () => {
  assert.equal(productMatchesSearch(staples[0], " AASHIRVAAD   att "), true);
  assert.equal(productMatchesSearch({ name: "Carrot", categoryName: "Fresh Vegetables" }, "vegetable"), true);
  assert.equal(productMatchesSearch({ name: "Flour", tags: ["atta"] }, "atta"), true);
  assert.equal(productMatchesSearch({ name: "Flour", variants: [{ variantName: "Whole wheat atta 5 kg" }] }, "atta 5 kg"), true);
  assert.equal(productMatchesSearch({ name: "Flour", variants: [{ label: "Whole wheat atta" }] }, "atta"), true);
});

test("search uses word beginnings and handles punctuation and empty input", () => {
  assert.equal(productMatchesSearch({ name: "Wheat Atta" }, "wheat-atta"), true);
  assert.equal(productMatchesSearch({ name: "Premium Flour", brand: "Patta" }, "atta"), false);
  assert.equal(productMatchesSearch({}, "atta"), false);
  assert.equal(productMatchesSearch(staples[0], " "), false);
  assert.equal(productMatchesSearch(staples[0], "..."), false);
});
