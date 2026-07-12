export const GROCERY_STORES = [
  {
    id: "meijer",
    label: "Meijer",
    href: "https://www.meijer.com/",
  },
  {
    id: "publix",
    label: "Publix",
    href: "https://www.publix.com/",
  },
  {
    id: "kroger",
    label: "Kroger",
    href: "https://www.kroger.com/",
  },
  {
    id: "walmart",
    label: "Walmart",
    href: "https://www.walmart.com/",
  },
  {
    id: "amazon",
    label: "Amazon",
    href: "https://www.amazon.com/",
  },
] as const;

/** Popular coupon hubs — no single free national coupon API for all stores. */
export const COUPON_LINKS = [
  {
    id: "coupons-com",
    label: "Coupons.com",
    href: "https://www.coupons.com/",
    hint: "Printable & digital coupons",
  },
  {
    id: "retailmenot",
    label: "RetailMeNot",
    href: "https://www.retailmenot.com/",
    hint: "Store codes and deals",
  },
  {
    id: "meijer-coupons",
    label: "Meijer mPerks",
    href: "https://www.meijer.com/shopping/mperks.html",
    hint: "Meijer digital coupons",
  },
  {
    id: "kroger-coupons",
    label: "Kroger digital coupons",
    href: "https://www.kroger.com/savings/cl/coupons/",
    hint: "Clip before you shop",
  },
  {
    id: "walmart-deals",
    label: "Walmart deals",
    href: "https://www.walmart.com/shop/deals",
    hint: "Weekly savings",
  },
] as const;
