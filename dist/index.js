var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  blogCategories: () => blogCategories,
  blogPosts: () => blogPosts,
  cartItems: () => cartItems,
  contactInfo: () => contactInfo,
  contactMessages: () => contactMessages,
  customerAddresses: () => customerAddresses,
  customers: () => customers,
  emailConfig: () => emailConfig,
  faqCategories: () => faqCategories,
  faqs: () => faqs,
  insertBlogCategorySchema: () => insertBlogCategorySchema,
  insertBlogPostSchema: () => insertBlogPostSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertContactInfoSchema: () => insertContactInfoSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertCustomerAddressSchema: () => insertCustomerAddressSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertEmailConfigSchema: () => insertEmailConfigSchema,
  insertFaqCategorySchema: () => insertFaqCategorySchema,
  insertFaqSchema: () => insertFaqSchema,
  insertInventoryMovementSchema: () => insertInventoryMovementSchema,
  insertNavbarConfigSchema: () => insertNavbarConfigSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertProductCategorySchema: () => insertProductCategorySchema,
  insertProductSchema: () => insertProductSchema,
  insertProductVariantSchema: () => insertProductVariantSchema,
  insertReservationSchema: () => insertReservationSchema,
  insertReservationSettingsSchema: () => insertReservationSettingsSchema,
  insertSectionSchema: () => insertSectionSchema,
  insertShipmentSchema: () => insertShipmentSchema,
  insertSiteConfigSchema: () => insertSiteConfigSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryMovements: () => inventoryMovements,
  mediaFiles: () => mediaFiles,
  navbarConfig: () => navbarConfig,
  orderItems: () => orderItems,
  orders: () => orders,
  pageCustomizations: () => pageCustomizations,
  paymentConfig: () => paymentConfig,
  payments: () => payments,
  productCategories: () => productCategories,
  productVariants: () => productVariants,
  products: () => products,
  reservationSettings: () => reservationSettings,
  reservations: () => reservations,
  sections: () => sections,
  shipments: () => shipments,
  siteConfig: () => siteConfig,
  testimonials: () => testimonials,
  users: () => users,
  visualCustomizations: () => visualCustomizations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, siteConfig, testimonials, faqCategories, faqs, contactMessages, paymentConfig, contactInfo, productCategories, products, productVariants, inventoryMovements, cartItems, orders, orderItems, customers, customerAddresses, payments, shipments, reservations, reservationSettings, blogPosts, blogCategories, sections, mediaFiles, emailConfig, insertUserSchema, insertSiteConfigSchema, insertTestimonialSchema, insertFaqCategorySchema, insertFaqSchema, insertContactMessageSchema, insertContactInfoSchema, insertProductCategorySchema, insertProductSchema, insertProductVariantSchema, insertInventoryMovementSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertCustomerSchema, insertCustomerAddressSchema, insertPaymentSchema, insertShipmentSchema, insertReservationSchema, insertReservationSettingsSchema, insertEmailConfigSchema, insertBlogPostSchema, insertBlogCategorySchema, insertSectionSchema, pageCustomizations, visualCustomizations, navbarConfig, insertNavbarConfigSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      role: text("role").notNull().default("cliente"),
      // superuser, admin, staff, cliente
      isActive: boolean("is_active").notNull().default(true)
    });
    siteConfig = pgTable("site_config", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      config: jsonb("config").notNull(),
      version: text("version").notNull().default("1.0.0"),
      lastUpdated: timestamp("last_updated").notNull().defaultNow(),
      updatedBy: varchar("updated_by").references(() => users.id)
    });
    testimonials = pgTable("testimonials", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      email: text("email"),
      content: text("content").notNull(),
      rating: integer("rating").default(5),
      isApproved: boolean("is_approved").default(false),
      isFeatured: boolean("is_featured").default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    faqCategories = pgTable("faq_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      order: integer("order").default(0)
    });
    faqs = pgTable("faqs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      categoryId: varchar("category_id").references(() => faqCategories.id),
      isPublished: boolean("is_published").default(false),
      views: integer("views").default(0),
      helpfulVotes: integer("helpful_votes").default(0),
      order: integer("order").default(0)
    });
    contactMessages = pgTable("contact_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      email: text("email").notNull(),
      subject: text("subject"),
      message: text("message").notNull(),
      isRead: boolean("is_read").default(false),
      isArchived: boolean("is_archived").default(false),
      isReplied: boolean("is_replied").default(false),
      reply: text("reply"),
      repliedAt: timestamp("replied_at"),
      repliedBy: varchar("replied_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    paymentConfig = pgTable("payment_config", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      stripePublicKey: text("stripe_public_key"),
      stripeSecretKey: text("stripe_secret_key"),
      isActive: boolean("is_active").default(false),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      updatedBy: varchar("updated_by").references(() => users.id)
    });
    contactInfo = pgTable("contact_info", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      phone: text("phone"),
      email: text("email"),
      address: text("address"),
      hours: text("hours"),
      socialLinks: jsonb("social_links"),
      mapsUrl: text("maps_url")
    });
    productCategories = pgTable("product_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      isActive: boolean("is_active").default(true)
    });
    products = pgTable("products", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      shortDescription: text("short_description"),
      price: integer("price").notNull(),
      // in cents
      currency: text("currency").default("MXN"),
      // Currency for the product
      comparePrice: integer("compare_price"),
      // original price for discounts
      categoryId: varchar("category_id").references(() => productCategories.id),
      stock: integer("stock").default(0),
      lowStockThreshold: integer("low_stock_threshold").default(5),
      sku: text("sku").unique(),
      weight: integer("weight"),
      // in grams
      dimensions: jsonb("dimensions"),
      // {length, width, height}
      isActive: boolean("is_active").default(true),
      isFeatured: boolean("is_featured").default(false),
      images: jsonb("images"),
      variants: jsonb("variants"),
      // {size, color, etc.}
      tags: jsonb("tags"),
      seoTitle: text("seo_title"),
      seoDescription: text("seo_description"),
      stripeProductId: text("stripe_product_id"),
      stripePriceId: text("stripe_price_id"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    productVariants = pgTable("product_variants", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      productId: varchar("product_id").references(() => products.id),
      name: text("name").notNull(),
      // e.g., "Size", "Color"
      value: text("value").notNull(),
      // e.g., "Large", "Red"
      price: integer("price"),
      // additional price
      sku: text("sku"),
      stock: integer("stock").default(0),
      isActive: boolean("is_active").default(true)
    });
    inventoryMovements = pgTable("inventory_movements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      productId: varchar("product_id").references(() => products.id),
      variantId: varchar("variant_id").references(() => productVariants.id),
      type: text("type").notNull(),
      // "in", "out", "adjustment"
      quantity: integer("quantity").notNull(),
      reason: text("reason"),
      // "sale", "restock", "damage", "adjustment"
      notes: text("notes"),
      orderId: varchar("order_id"),
      // if related to an order
      createdAt: timestamp("created_at").notNull().defaultNow(),
      createdBy: varchar("created_by").references(() => users.id)
    });
    cartItems = pgTable("cart_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id),
      sessionId: text("session_id"),
      // for anonymous users
      productId: varchar("product_id").references(() => products.id),
      variantId: varchar("variant_id").references(() => productVariants.id),
      quantity: integer("quantity").notNull().default(1),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    orders = pgTable("orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderNumber: text("order_number").notNull().unique(),
      userId: varchar("user_id").references(() => users.id),
      guestEmail: text("guest_email"),
      // for guest checkouts
      items: jsonb("items").notNull(),
      subtotal: integer("subtotal").notNull(),
      // in cents
      tax: integer("tax").default(0),
      // in cents
      shipping: integer("shipping").default(0),
      // in cents
      discount: integer("discount").default(0),
      // in cents
      total: integer("total").notNull(),
      // in cents
      currency: text("currency").default("USD"),
      status: text("status").default("pending"),
      // pending, confirmed, processing, shipped, delivered, cancelled, refunded
      paymentStatus: text("payment_status").default("pending"),
      // pending, paid, failed, refunded
      paymentMethod: text("payment_method"),
      paymentId: text("payment_id"),
      // from payment processor
      shippingAddress: jsonb("shipping_address"),
      billingAddress: jsonb("billing_address"),
      shippingMethod: text("shipping_method"),
      trackingNumber: text("tracking_number"),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    orderItems = pgTable("order_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id),
      productId: varchar("product_id").references(() => products.id),
      variantId: varchar("variant_id").references(() => productVariants.id),
      productName: text("product_name").notNull(),
      // snapshot at time of order
      variantName: text("variant_name"),
      quantity: integer("quantity").notNull(),
      unitPrice: integer("unit_price").notNull(),
      // in cents
      totalPrice: integer("total_price").notNull()
      // in cents
    });
    customers = pgTable("customers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id),
      firstName: text("first_name"),
      lastName: text("last_name"),
      phone: text("phone"),
      dateOfBirth: timestamp("date_of_birth"),
      defaultShippingAddress: jsonb("default_shipping_address"),
      defaultBillingAddress: jsonb("default_billing_address"),
      totalOrders: integer("total_orders").default(0),
      totalSpent: integer("total_spent").default(0),
      // in cents
      averageOrderValue: integer("average_order_value").default(0),
      lastOrderDate: timestamp("last_order_date"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    customerAddresses = pgTable("customer_addresses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      customerId: varchar("customer_id").references(() => customers.id),
      type: text("type").notNull(),
      // "shipping", "billing"
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      company: text("company"),
      address1: text("address_1").notNull(),
      address2: text("address_2"),
      city: text("city").notNull(),
      state: text("state").notNull(),
      zipCode: text("zip_code").notNull(),
      country: text("country").notNull().default("US"),
      phone: text("phone"),
      isDefault: boolean("is_default").default(false)
    });
    payments = pgTable("payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id),
      amount: integer("amount").notNull(),
      // in cents
      currency: text("currency").default("USD"),
      status: text("status").default("pending"),
      // pending, completed, failed, refunded
      method: text("method").notNull(),
      // credit_card, paypal, stripe, etc.
      transactionId: text("transaction_id"),
      gatewayResponse: jsonb("gateway_response"),
      refundedAmount: integer("refunded_amount").default(0),
      refundReason: text("refund_reason"),
      processedAt: timestamp("processed_at"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    shipments = pgTable("shipments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id),
      trackingNumber: text("tracking_number"),
      carrier: text("carrier"),
      // UPS, FedEx, USPS, etc.
      service: text("service"),
      // Ground, Express, etc.
      status: text("status").default("pending"),
      // pending, shipped, in_transit, delivered, exception
      shippedAt: timestamp("shipped_at"),
      estimatedDelivery: timestamp("estimated_delivery"),
      deliveredAt: timestamp("delivered_at"),
      shippingCost: integer("shipping_cost"),
      // in cents
      weight: integer("weight"),
      // in grams
      dimensions: jsonb("dimensions"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    reservations = pgTable("reservations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      date: timestamp("date").notNull(),
      timeSlot: text("time_slot").notNull(),
      service: text("service"),
      notes: text("notes"),
      status: text("status").default("pending"),
      // pending, confirmed, cancelled, completed
      duration: integer("duration").default(60),
      // Duration in minutes
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    reservationSettings = pgTable("reservation_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      businessHours: jsonb("business_hours").notNull().default({
        monday: { enabled: true, open: "09:00", close: "18:00" },
        tuesday: { enabled: true, open: "09:00", close: "18:00" },
        wednesday: { enabled: true, open: "09:00", close: "18:00" },
        thursday: { enabled: true, open: "09:00", close: "18:00" },
        friday: { enabled: true, open: "09:00", close: "18:00" },
        saturday: { enabled: false, open: "09:00", close: "18:00" },
        sunday: { enabled: false, open: "09:00", close: "18:00" }
      }),
      defaultDuration: integer("default_duration").default(60),
      // Default duration in minutes
      bufferTime: integer("buffer_time").default(15),
      // Buffer between appointments in minutes
      maxAdvanceDays: integer("max_advance_days").default(30),
      // How far in advance bookings can be made
      allowedServices: jsonb("allowed_services").notNull().default([
        "Consulta general",
        "Cita especializada",
        "Reuni\xF3n"
      ]),
      isActive: boolean("is_active").default(true),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    blogPosts = pgTable("blog_posts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      slug: text("slug").notNull().unique(),
      content: text("content").notNull(),
      excerpt: text("excerpt"),
      featuredImage: text("featured_image"),
      authorId: varchar("author_id").references(() => users.id),
      categoryId: varchar("category_id"),
      tags: jsonb("tags").default(sql`'[]'::jsonb`),
      isPublished: boolean("is_published").default(false),
      isFeatured: boolean("is_featured").default(false),
      views: integer("views").default(0),
      seoTitle: text("seo_title"),
      seoDescription: text("seo_description"),
      publishedAt: timestamp("published_at"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    blogCategories = pgTable("blog_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      slug: text("slug").notNull().unique(),
      description: text("description"),
      order: integer("order").default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    sections = pgTable("sections", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      title: text("title"),
      content: text("content"),
      type: text("type").notNull(),
      // hero, services, about, gallery, etc.
      order: integer("order").default(0),
      isActive: boolean("is_active").default(true),
      config: jsonb("config")
      // additional configuration for the section
    });
    mediaFiles = pgTable("media_files", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      filename: text("filename").notNull(),
      originalName: text("original_name").notNull(),
      mimeType: text("mime_type").notNull(),
      size: integer("size").notNull(),
      // in bytes
      url: text("url").notNull(),
      // URL to serve the media
      objectKey: text("object_key").notNull(),
      // Key for object identification
      data: text("data"),
      // Binary data stored as base64 string (optional for direct DB storage)
      alt: text("alt"),
      description: text("description"),
      uploadedBy: varchar("uploaded_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    emailConfig = pgTable("email_config", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      fromEmail: text("from_email").notNull(),
      replyToEmail: text("reply_to_email").notNull(),
      smtpHost: text("smtp_host").notNull(),
      smtpPort: integer("smtp_port").default(587),
      smtpSecure: boolean("smtp_secure").default(false),
      smtpUser: text("smtp_user").notNull(),
      smtpPass: text("smtp_pass").notNull(),
      isActive: boolean("is_active").default(false),
      lastTested: timestamp("last_tested"),
      testStatus: text("test_status"),
      // 'success', 'failed', 'pending'
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true
    }).extend({
      securityCode: z.string().optional(),
      password: z.string().min(8, "La contrase\xF1a debe tener al menos 8 caracteres").regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "La contrase\xF1a debe contener al menos: 1 may\xFAscula, 1 min\xFAscula, 1 n\xFAmero y 1 s\xEDmbolo (@$!%*?&)"
      )
    });
    insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
      id: true,
      lastUpdated: true
    });
    insertTestimonialSchema = createInsertSchema(testimonials).omit({
      id: true,
      createdAt: true
    });
    insertFaqCategorySchema = createInsertSchema(faqCategories).omit({
      id: true
    });
    insertFaqSchema = createInsertSchema(faqs).omit({
      id: true
    });
    insertContactMessageSchema = createInsertSchema(contactMessages).omit({
      id: true,
      createdAt: true
    });
    insertContactInfoSchema = createInsertSchema(contactInfo).omit({
      id: true
    });
    insertProductCategorySchema = createInsertSchema(productCategories).omit({
      id: true
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProductVariantSchema = createInsertSchema(productVariants).omit({
      id: true
    });
    insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
      id: true,
      createdAt: true
    }).extend({
      type: z.enum(["in", "out", "adjustment"]),
      reason: z.enum(["sale", "restock", "damage", "adjustment", "return"]).optional()
    });
    insertCartItemSchema = createInsertSchema(cartItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true
    });
    insertCustomerSchema = createInsertSchema(customers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCustomerAddressSchema = createInsertSchema(customerAddresses).omit({
      id: true
    });
    insertPaymentSchema = createInsertSchema(payments).omit({
      id: true,
      createdAt: true
    });
    insertShipmentSchema = createInsertSchema(shipments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertReservationSchema = createInsertSchema(reservations).omit({
      id: true,
      createdAt: true
    }).extend({
      date: z.coerce.date()
      // Allow string to date conversion
    });
    insertReservationSettingsSchema = createInsertSchema(reservationSettings).omit({
      id: true,
      updatedAt: true
    });
    insertEmailConfigSchema = createInsertSchema(emailConfig).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastTested: true,
      testStatus: true
    });
    insertBlogPostSchema = createInsertSchema(blogPosts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
      id: true,
      createdAt: true
    });
    insertSectionSchema = createInsertSchema(sections).omit({
      id: true
    });
    pageCustomizations = pgTable("page_customizations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      pageId: varchar("page_id").notNull(),
      // URL path or page identifier
      userId: varchar("user_id").notNull().references(() => users.id),
      elements: jsonb("elements").notNull().default({}),
      // Customized element values
      styles: jsonb("styles").notNull().default({}),
      // Custom CSS styles
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    visualCustomizations = pgTable("visual_customizations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      pageId: varchar("page_id").notNull(),
      // home, contact, blog, etc.
      elementSelector: varchar("element_selector").notNull(),
      // CSS selector or unique identifier
      elementType: varchar("element_type").notNull(),
      // text, color, size, spacing, image, section
      property: varchar("property").notNull(),
      // content, backgroundColor, fontSize, margin, etc.
      value: text("value").notNull(),
      // the actual value
      label: varchar("label").notNull(),
      // user-friendly label
      updatedBy: varchar("updated_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    navbarConfig = pgTable("navbar_config", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      moduleKey: text("module_key").notNull(),
      label: text("label").notNull(),
      href: text("href").notNull(),
      isVisible: boolean("is_visible").default(true),
      order: integer("order").default(0),
      isRequired: boolean("is_required").default(false),
      // For required items like "Inicio"
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      updatedBy: varchar("updated_by").references(() => users.id)
    });
    insertNavbarConfigSchema = createInsertSchema(navbarConfig).omit({
      id: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import dotenv from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("\u26A0\uFE0F  DATABASE_URL not set, database features will be disabled");
    return null;
  }
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Add connection timeout and retry logic
      connectionTimeoutMillis: 5e3,
      idleTimeoutMillis: 3e4,
      max: 10
    });
    db = drizzle(pool, { schema: schema_exports });
    pool.query("SELECT NOW()", (err) => {
      if (err) {
        console.error("\u274C Database connection test failed:", err.message);
      } else {
        console.log("\u2705 Database connected successfully");
      }
    });
    return db;
  } catch (error) {
    console.error("\u274C Failed to initialize database:", error instanceof Error ? error.message : error);
    return null;
  }
}
var pool, db, dbInstance;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    dotenv.config();
    pool = null;
    db = null;
    dbInstance = initializeDatabase();
  }
});

// server/database-storage.ts
var database_storage_exports = {};
__export(database_storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { randomUUID } from "crypto";
import { eq, desc, asc, and, or, sql as sql2 } from "drizzle-orm";
function isDatabaseAvailable() {
  return dbInstance !== null && dbInstance !== void 0;
}
function throwDatabaseError(operation) {
  throw new Error(`Database operation '${operation}' failed: Database not available. Check your DATABASE_URL configuration.`);
}
var DatabaseStorage, storage;
var init_database_storage = __esm({
  "server/database-storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DatabaseStorage = class {
      // Users
      async getUser(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getUser");
        }
        const [user] = await dbInstance.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByUsername(username) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getUserByUsername");
        }
        const [user] = await dbInstance.select().from(users).where(eq(users.username, username));
        return user;
      }
      async getUserByEmail(email) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getUserByEmail");
        }
        const [user] = await dbInstance.select().from(users).where(eq(users.email, email));
        return user;
      }
      async createUser(user) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createUser");
        }
        const id = randomUUID();
        const [newUser] = await dbInstance.insert(users).values({ id, ...user }).returning();
        return newUser;
      }
      async updateUser(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateUser");
        }
        const [updatedUser] = await dbInstance.update(users).set(updates).where(eq(users.id, id)).returning();
        return updatedUser;
      }
      async getAllUsers() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllUsers");
        }
        return await dbInstance.select().from(users).orderBy(desc(users.username));
      }
      // Site Config
      async getSiteConfig() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getSiteConfig");
        }
        const [config] = await dbInstance.select().from(siteConfig).orderBy(desc(siteConfig.lastUpdated)).limit(1);
        return config;
      }
      async createSiteConfig(config) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createSiteConfig");
        }
        const id = randomUUID();
        const [newConfig] = await dbInstance.insert(siteConfig).values({
          id,
          ...config,
          lastUpdated: /* @__PURE__ */ new Date()
        }).returning();
        return newConfig;
      }
      async updateSiteConfig(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateSiteConfig");
        }
        const [updatedConfig] = await dbInstance.update(siteConfig).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where(eq(siteConfig.id, id)).returning();
        return updatedConfig;
      }
      // Testimonials
      async getAllTestimonials() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllTestimonials");
        }
        return await dbInstance.select().from(testimonials).orderBy(desc(testimonials.createdAt));
      }
      async getTestimonial(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getTestimonial");
        }
        const [testimonial] = await dbInstance.select().from(testimonials).where(eq(testimonials.id, id));
        return testimonial;
      }
      async createTestimonial(testimonial) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createTestimonial");
        }
        const id = randomUUID();
        const [newTestimonial] = await dbInstance.insert(testimonials).values({
          id,
          ...testimonial,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newTestimonial;
      }
      async updateTestimonial(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateTestimonial");
        }
        const [updatedTestimonial] = await dbInstance.update(testimonials).set(updates).where(eq(testimonials.id, id)).returning();
        return updatedTestimonial;
      }
      async deleteTestimonial(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteTestimonial");
        }
        const result = await dbInstance.delete(testimonials).where(eq(testimonials.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // FAQ Categories
      async getAllFaqCategories() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllFaqCategories");
        }
        return await dbInstance.select().from(faqCategories).orderBy(asc(faqCategories.order));
      }
      async getFaqCategory(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getFaqCategory");
        }
        const [category] = await dbInstance.select().from(faqCategories).where(eq(faqCategories.id, id));
        return category;
      }
      async createFaqCategory(category) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createFaqCategory");
        }
        const id = randomUUID();
        const [newCategory] = await dbInstance.insert(faqCategories).values({ id, ...category }).returning();
        return newCategory;
      }
      async updateFaqCategory(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateFaqCategory");
        }
        const [updatedCategory] = await dbInstance.update(faqCategories).set(updates).where(eq(faqCategories.id, id)).returning();
        return updatedCategory;
      }
      async deleteFaqCategory(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteFaqCategory");
        }
        const result = await dbInstance.delete(faqCategories).where(eq(faqCategories.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // FAQs
      async getAllFaqs() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllFaqs");
        }
        return await dbInstance.select().from(faqs).orderBy(asc(faqs.order));
      }
      async getFaq(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getFaq");
        }
        const [faq] = await dbInstance.select().from(faqs).where(eq(faqs.id, id));
        return faq;
      }
      async getFaqsByCategory(categoryId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getFaqsByCategory");
        }
        return await dbInstance.select().from(faqs).where(eq(faqs.categoryId, categoryId)).orderBy(asc(faqs.order));
      }
      async createFaq(faq) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createFaq");
        }
        const id = randomUUID();
        const [newFaq] = await dbInstance.insert(faqs).values({ id, ...faq }).returning();
        return newFaq;
      }
      async updateFaq(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateFaq");
        }
        const [updatedFaq] = await dbInstance.update(faqs).set(updates).where(eq(faqs.id, id)).returning();
        return updatedFaq;
      }
      async deleteFaq(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteFaq");
        }
        const result = await dbInstance.delete(faqs).where(eq(faqs.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Contact Messages
      async getAllContactMessages() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllContactMessages");
        }
        return await dbInstance.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
      }
      async getContactMessage(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getContactMessage");
        }
        const [message] = await dbInstance.select().from(contactMessages).where(eq(contactMessages.id, id));
        return message;
      }
      async createContactMessage(message) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createContactMessage");
        }
        const id = randomUUID();
        const [newMessage] = await dbInstance.insert(contactMessages).values({
          id,
          ...message,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newMessage;
      }
      async updateContactMessage(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateContactMessage");
        }
        const [updatedMessage] = await dbInstance.update(contactMessages).set(updates).where(eq(contactMessages.id, id)).returning();
        return updatedMessage;
      }
      async deleteContactMessage(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteContactMessage");
        }
        const result = await dbInstance.delete(contactMessages).where(eq(contactMessages.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Contact Info
      async getContactInfo() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getContactInfo");
        }
        const [info] = await dbInstance.select().from(contactInfo).limit(1);
        return info;
      }
      async createContactInfo(info) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createContactInfo");
        }
        const id = randomUUID();
        const [newInfo] = await dbInstance.insert(contactInfo).values({ id, ...info }).returning();
        return newInfo;
      }
      async updateContactInfo(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateContactInfo");
        }
        const [updatedInfo] = await dbInstance.update(contactInfo).set(updates).where(eq(contactInfo.id, id)).returning();
        return updatedInfo;
      }
      // Product Categories
      async getAllProductCategories() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllProductCategories");
        }
        return await dbInstance.select().from(productCategories).where(eq(productCategories.isActive, true));
      }
      async getProductCategory(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getProductCategory");
        }
        const [category] = await dbInstance.select().from(productCategories).where(eq(productCategories.id, id));
        return category;
      }
      async createProductCategory(category) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createProductCategory");
        }
        const id = randomUUID();
        const [newCategory] = await dbInstance.insert(productCategories).values({ id, ...category }).returning();
        return newCategory;
      }
      async updateProductCategory(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateProductCategory");
        }
        const [updatedCategory] = await dbInstance.update(productCategories).set(updates).where(eq(productCategories.id, id)).returning();
        return updatedCategory;
      }
      async deleteProductCategory(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteProductCategory");
        }
        const result = await dbInstance.delete(productCategories).where(eq(productCategories.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Products
      async getAllProducts() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllProducts");
        }
        return await dbInstance.select().from(products).orderBy(desc(products.createdAt));
      }
      async getProduct(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getProduct");
        }
        const [product] = await dbInstance.select().from(products).where(eq(products.id, id));
        return product;
      }
      async getProductBySku(sku) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getProductBySku");
        }
        const [product] = await dbInstance.select().from(products).where(eq(products.sku, sku));
        return product;
      }
      async getProductsByCategory(categoryId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getProductsByCategory");
        }
        return await dbInstance.select().from(products).where(and(eq(products.categoryId, categoryId), eq(products.isActive, true))).orderBy(desc(products.createdAt));
      }
      async getFeaturedProducts() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getFeaturedProducts");
        }
        return await dbInstance.select().from(products).where(and(eq(products.isFeatured, true), eq(products.isActive, true))).orderBy(desc(products.createdAt));
      }
      async getActiveProducts() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getActiveProducts");
        }
        return await dbInstance.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
      }
      async createProduct(product) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createProduct");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [newProduct] = await dbInstance.insert(products).values({
          id,
          ...product,
          createdAt: now,
          updatedAt: now
        }).returning();
        return newProduct;
      }
      async updateProduct(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateProduct");
        }
        const [updatedProduct] = await dbInstance.update(products).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
        return updatedProduct;
      }
      async deleteProduct(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteProduct");
        }
        await this.deleteInventoryMovementsByProduct(id);
        await this.deleteCartItemsByProduct(id);
        const result = await dbInstance.delete(products).where(eq(products.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async updateProductStock(productId, quantity) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateProductStock");
        }
        const result = await dbInstance.update(products).set({
          stock: quantity,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(products.id, productId));
        return (result.rowCount ?? 0) > 0;
      }
      async getLowStockProducts() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getLowStockProducts");
        }
        return await dbInstance.select().from(products).where(and(
          eq(products.isActive, true),
          sql2`${products.stock} <= ${products.lowStockThreshold}`
        )).orderBy(asc(products.stock));
      }
      // Product Variants
      async getProductVariants(productId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getProductVariants");
        }
        return await dbInstance.select().from(productVariants).where(eq(productVariants.productId, productId));
      }
      async getProductVariant(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getProductVariant");
        }
        const [variant] = await dbInstance.select().from(productVariants).where(eq(productVariants.id, id));
        return variant;
      }
      async createProductVariant(variant) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createProductVariant");
        }
        const id = randomUUID();
        const [newVariant] = await dbInstance.insert(productVariants).values({ id, ...variant }).returning();
        return newVariant;
      }
      async updateProductVariant(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateProductVariant");
        }
        const [updatedVariant] = await dbInstance.update(productVariants).set(updates).where(eq(productVariants.id, id)).returning();
        return updatedVariant;
      }
      async deleteProductVariant(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteProductVariant");
        }
        const result = await dbInstance.delete(productVariants).where(eq(productVariants.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Inventory
      async getInventoryMovements(productId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getInventoryMovements");
        }
        const query = dbInstance.select().from(inventoryMovements);
        if (productId) {
          return await query.where(eq(inventoryMovements.productId, productId)).orderBy(desc(inventoryMovements.createdAt));
        }
        return await query.orderBy(desc(inventoryMovements.createdAt));
      }
      async createInventoryMovement(movement) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createInventoryMovement");
        }
        const id = randomUUID();
        const [newMovement] = await dbInstance.insert(inventoryMovements).values({
          id,
          ...movement,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newMovement;
      }
      async deleteInventoryMovement(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteInventoryMovement");
        }
        const result = await dbInstance.delete(inventoryMovements).where(eq(inventoryMovements.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
      }
      async deleteInventoryMovementsByProduct(productId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteInventoryMovementsByProduct");
        }
        const result = await dbInstance.delete(inventoryMovements).where(eq(inventoryMovements.productId, productId));
        return true;
      }
      async deleteCartItemsByProduct(productId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteCartItemsByProduct");
        }
        const result = await dbInstance.delete(cartItems).where(eq(cartItems.productId, productId));
        return true;
      }
      async deleteOrderItemsByProduct(productId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteOrderItemsByProduct");
        }
        const result = await dbInstance.delete(orderItems).where(eq(orderItems.productId, productId));
        return true;
      }
      // Cart
      async getCartItems(userId, sessionId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getCartItems");
        }
        const conditions = [];
        if (userId) conditions.push(eq(cartItems.userId, userId));
        if (sessionId) conditions.push(eq(cartItems.sessionId, sessionId));
        if (conditions.length === 0) return [];
        return await dbInstance.select().from(cartItems).where(or(...conditions)).orderBy(desc(cartItems.createdAt));
      }
      async addToCart(item) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("addToCart");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [newItem] = await dbInstance.insert(cartItems).values({
          id,
          ...item,
          createdAt: now,
          updatedAt: now
        }).returning();
        return newItem;
      }
      async updateCartItem(id, quantity) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateCartItem");
        }
        const [updatedItem] = await dbInstance.update(cartItems).set({
          quantity,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(cartItems.id, id)).returning();
        return updatedItem;
      }
      async removeFromCart(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("removeFromCart");
        }
        const result = await dbInstance.delete(cartItems).where(eq(cartItems.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async clearCart(userId, sessionId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("clearCart");
        }
        const whereConditions = [];
        if (userId) {
          whereConditions.push(eq(cartItems.userId, userId));
        }
        if (sessionId) {
          whereConditions.push(eq(cartItems.sessionId, sessionId));
        }
        if (whereConditions.length === 0) {
          return false;
        }
        const result = await dbInstance.delete(cartItems).where(or(...whereConditions));
        return (result.rowCount ?? 0) > 0;
      }
      async getAllCartItems() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllCartItems");
        }
        return await dbInstance.select().from(cartItems);
      }
      // Orders
      async getAllOrders() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllOrders");
        }
        return await dbInstance.select().from(orders).orderBy(desc(orders.createdAt));
      }
      async getOrder(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getOrder");
        }
        const [order] = await dbInstance.select().from(orders).where(eq(orders.id, id));
        return order;
      }
      async getOrderByNumber(orderNumber) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getOrderByNumber");
        }
        const [order] = await dbInstance.select().from(orders).where(eq(orders.orderNumber, orderNumber));
        return order;
      }
      async getUserOrders(userId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getUserOrders");
        }
        return await dbInstance.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
      }
      async createOrder(order) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createOrder");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const [newOrder] = await dbInstance.insert(orders).values({
          id,
          orderNumber,
          ...order,
          createdAt: now,
          updatedAt: now
        }).returning();
        return newOrder;
      }
      async updateOrder(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateOrder");
        }
        console.log("Database updateOrder called:", {
          id,
          updates,
          updatesType: typeof updates,
          updatesKeys: Object.keys(updates)
        });
        try {
          const existingOrder = await dbInstance.select().from(orders).where(eq(orders.id, id)).limit(1);
          if (existingOrder.length === 0) {
            console.error("Order not found in database during update:", id);
            return void 0;
          }
          console.log("Order found, proceeding with update");
          const [updatedOrder] = await dbInstance.update(orders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
          console.log("Order updated successfully:", {
            id: updatedOrder.id,
            oldStatus: existingOrder[0].status,
            newStatus: updatedOrder.status
          });
          return updatedOrder;
        } catch (error) {
          console.error("Error in updateOrder database operation:", {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : void 0,
            id,
            updates
          });
          throw error;
        }
      }
      async updateOrderStatus(id, status) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateOrderStatus");
        }
        console.log("Database updateOrderStatus called:", { id, status });
        try {
          const existingOrder = await this.getOrder(id);
          if (!existingOrder) {
            console.error("Order not found in database:", id);
            return void 0;
          }
          console.log("Existing order found:", {
            id: existingOrder.id,
            currentStatus: existingOrder.status,
            newStatus: status
          });
          const result = await this.updateOrder(id, { status });
          console.log("Order status update result:", result);
          return result;
        } catch (error) {
          console.error("Error in updateOrderStatus:", error);
          throw error;
        }
      }
      async deleteOrder(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteOrder");
        }
        const result = await dbInstance.delete(orders).where(eq(orders.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Order Items
      async getOrderItems(orderId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getOrderItems");
        }
        return await dbInstance.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      }
      async createOrderItem(item) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createOrderItem");
        }
        const id = randomUUID();
        const [newItem] = await dbInstance.insert(orderItems).values({ id, ...item }).returning();
        return newItem;
      }
      // Customers
      async getAllCustomers() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllCustomers");
        }
        return await dbInstance.select().from(customers).orderBy(desc(customers.createdAt));
      }
      async getCustomer(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getCustomer");
        }
        const [customer] = await dbInstance.select().from(customers).where(eq(customers.id, id));
        return customer;
      }
      async getCustomerByUserId(userId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getCustomerByUserId");
        }
        const [customer] = await dbInstance.select().from(customers).where(eq(customers.userId, userId));
        return customer;
      }
      async createCustomer(customer) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createCustomer");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [newCustomer] = await dbInstance.insert(customers).values({
          id,
          ...customer,
          createdAt: now,
          updatedAt: now
        }).returning();
        return newCustomer;
      }
      async updateCustomer(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateCustomer");
        }
        const [updatedCustomer] = await dbInstance.update(customers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, id)).returning();
        return updatedCustomer;
      }
      // Customer Addresses
      async getCustomerAddresses(customerId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getCustomerAddresses");
        }
        return await dbInstance.select().from(customerAddresses).where(eq(customerAddresses.customerId, customerId));
      }
      async createCustomerAddress(address) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createCustomerAddress");
        }
        const id = randomUUID();
        const [newAddress] = await dbInstance.insert(customerAddresses).values({ id, ...address }).returning();
        return newAddress;
      }
      async updateCustomerAddress(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateCustomerAddress");
        }
        const [updatedAddress] = await dbInstance.update(customerAddresses).set(updates).where(eq(customerAddresses.id, id)).returning();
        return updatedAddress;
      }
      async deleteCustomerAddress(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteCustomerAddress");
        }
        const result = await dbInstance.delete(customerAddresses).where(eq(customerAddresses.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Payments
      async getOrderPayments(orderId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getOrderPayments");
        }
        return await dbInstance.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
      }
      async getPayment(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getPayment");
        }
        const [payment] = await dbInstance.select().from(payments).where(eq(payments.id, id));
        return payment;
      }
      async createPayment(payment) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createPayment");
        }
        const id = randomUUID();
        const [newPayment] = await dbInstance.insert(payments).values({
          id,
          ...payment,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newPayment;
      }
      async updatePayment(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updatePayment");
        }
        const [updatedPayment] = await dbInstance.update(payments).set(updates).where(eq(payments.id, id)).returning();
        return updatedPayment;
      }
      // Shipments
      async getOrderShipments(orderId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getOrderShipments");
        }
        return await dbInstance.select().from(shipments).where(eq(shipments.orderId, orderId)).orderBy(desc(shipments.createdAt));
      }
      async getShipment(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getShipment");
        }
        const [shipment] = await dbInstance.select().from(shipments).where(eq(shipments.id, id));
        return shipment;
      }
      async createShipment(shipment) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createShipment");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [newShipment] = await dbInstance.insert(shipments).values({
          id,
          ...shipment,
          createdAt: now,
          updatedAt: now
        }).returning();
        return newShipment;
      }
      async updateShipment(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateShipment");
        }
        const [updatedShipment] = await dbInstance.update(shipments).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(shipments.id, id)).returning();
        return updatedShipment;
      }
      // Reservations
      async getAllReservations() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllReservations");
        }
        return await dbInstance.select().from(reservations).orderBy(desc(reservations.createdAt));
      }
      async getReservation(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getReservation");
        }
        const [reservation] = await dbInstance.select().from(reservations).where(eq(reservations.id, id));
        return reservation;
      }
      async getUserReservations(userId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getUserReservations");
        }
        return await dbInstance.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
      }
      async createReservation(reservation) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createReservation");
        }
        const id = randomUUID();
        const [newReservation] = await dbInstance.insert(reservations).values({
          id,
          ...reservation,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newReservation;
      }
      async updateReservation(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateReservation");
        }
        try {
          console.log("Database updateReservation:", id, updates);
          const allowedFields = ["name", "email", "phone", "service", "date", "timeSlot", "status", "notes"];
          const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([key]) => allowedFields.includes(key))
          );
          console.log("Clean updates for DB:", cleanUpdates);
          const [updatedReservation] = await dbInstance.update(reservations).set({
            ...cleanUpdates,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(reservations.id, id)).returning();
          return updatedReservation;
        } catch (error) {
          console.error("Database error updating reservation:", error);
          throw error;
        }
      }
      async deleteReservation(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteReservation");
        }
        const result = await dbInstance.delete(reservations).where(eq(reservations.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async getReservationsForDate(date) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getReservationsForDate");
        }
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        return await dbInstance.select().from(reservations).where(and(
          sql2`date(${reservations.date}) = ${date}`,
          eq(reservations.status, "confirmed")
        )).orderBy(asc(reservations.date));
      }
      // Email Configuration
      async getEmailConfig() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getEmailConfig");
        }
        const [config] = await dbInstance.select().from(emailConfig).orderBy(desc(emailConfig.updatedAt)).limit(1);
        return config;
      }
      async updateEmailConfig(configData) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateEmailConfig");
        }
        const existingConfig = await this.getEmailConfig();
        if (existingConfig) {
          const [updatedConfig] = await dbInstance.update(emailConfig).set({
            ...configData,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(emailConfig.id, existingConfig.id)).returning();
          return updatedConfig;
        } else {
          const id = randomUUID();
          const [newConfig] = await dbInstance.insert(emailConfig).values({
            id,
            ...configData,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newConfig;
        }
      }
      async updateEmailTestStatus(status) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateEmailTestStatus");
        }
        const existingConfig = await this.getEmailConfig();
        if (existingConfig) {
          await dbInstance.update(emailConfig).set({
            testStatus: status,
            lastTested: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(emailConfig.id, existingConfig.id));
        }
      }
      // Reservation Settings
      async getReservationSettings() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getReservationSettings");
        }
        try {
          const [settings] = await dbInstance.select().from(reservationSettings).orderBy(desc(reservationSettings.updatedAt)).limit(1);
          if (!settings) {
            const defaultBusinessHours = {
              monday: { enabled: true, open: "09:00", close: "17:00" },
              tuesday: { enabled: true, open: "09:00", close: "17:00" },
              wednesday: { enabled: true, open: "09:00", close: "17:00" },
              thursday: { enabled: true, open: "09:00", close: "17:00" },
              friday: { enabled: true, open: "09:00", close: "17:00" },
              saturday: { enabled: false, open: "09:00", close: "17:00" },
              sunday: { enabled: false, open: "09:00", close: "17:00" }
            };
            const id = randomUUID();
            const [defaultSettings] = await dbInstance.insert(reservationSettings).values({
              id,
              businessHours: defaultBusinessHours,
              defaultDuration: 60,
              bufferTime: 15,
              maxAdvanceDays: 30,
              allowedServices: ["Consulta general", "Cita especializada", "Reuni\xF3n"],
              isActive: true,
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).returning();
            return defaultSettings;
          }
          return settings;
        } catch (error) {
          console.error("Error fetching reservation settings:", error);
          return void 0;
        }
      }
      async createReservationSettings(settings) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createReservationSettings");
        }
        const id = randomUUID();
        const [newSettings] = await dbInstance.insert(reservationSettings).values({
          id,
          ...settings,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newSettings;
      }
      async updateReservationSettings(updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateReservationSettings");
        }
        try {
          const currentSettings = await this.getReservationSettings();
          let newSettings;
          if (currentSettings) {
            const [updatedSettings] = await dbInstance.update(reservationSettings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(reservationSettings.id, currentSettings.id)).returning();
            newSettings = updatedSettings;
          } else {
            const defaultBusinessHours = {
              monday: { enabled: true, open: "09:00", close: "17:00" },
              tuesday: { enabled: true, open: "09:00", close: "17:00" },
              wednesday: { enabled: true, open: "09:00", close: "17:00" },
              thursday: { enabled: true, open: "09:00", close: "17:00" },
              friday: { enabled: true, open: "09:00", close: "17:00" },
              saturday: { enabled: false, open: "09:00", close: "17:00" },
              sunday: { enabled: false, open: "09:00", close: "17:00" }
            };
            const id = randomUUID();
            const [createdSettings] = await dbInstance.insert(reservationSettings).values({
              id,
              businessHours: updates.businessHours || defaultBusinessHours,
              defaultDuration: updates.defaultDuration || 60,
              bufferTime: updates.bufferTime || 15,
              maxAdvanceDays: updates.maxAdvanceDays || 30,
              allowedServices: updates.allowedServices || ["Consulta general", "Cita especializada"],
              isActive: updates.isActive !== void 0 ? updates.isActive : true,
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).returning();
            newSettings = createdSettings;
          }
          return newSettings;
        } catch (error) {
          console.error("Error updating reservation settings:", error);
          return void 0;
        }
      }
      // Sections
      async getAllSections() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllSections");
        }
        return await dbInstance.select().from(sections).orderBy(asc(sections.order));
      }
      async getSection(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getSection");
        }
        const [section] = await dbInstance.select().from(sections).where(eq(sections.id, id));
        return section;
      }
      async createSection(section) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createSection");
        }
        const id = randomUUID();
        const [newSection] = await dbInstance.insert(sections).values({ id, ...section }).returning();
        return newSection;
      }
      async updateSection(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateSection");
        }
        const [updatedSection] = await dbInstance.update(sections).set(updates).where(eq(sections.id, id)).returning();
        return updatedSection;
      }
      async deleteSection(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteSection");
        }
        const result = await dbInstance.delete(sections).where(eq(sections.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Blog Posts implementation
      async getAllBlogPosts() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getAllBlogPosts");
        }
        const posts = await dbInstance.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
        return posts.map((post) => ({
          ...post,
          authorName: "Admin"
          // Add default author name
        }));
      }
      async getBlogPost(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getBlogPost");
        }
        const [post] = await dbInstance.select().from(blogPosts).where(eq(blogPosts.id, id));
        return post ? { ...post, authorName: "Admin" } : void 0;
      }
      async getBlogPostBySlug(slug) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getBlogPostBySlug");
        }
        const [post] = await dbInstance.select().from(blogPosts).where(eq(blogPosts.slug, slug));
        return post ? { ...post, authorName: "Admin" } : void 0;
      }
      async createBlogPost(post) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createBlogPost");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [newPost] = await dbInstance.insert(blogPosts).values({
          id,
          ...post,
          createdAt: now,
          updatedAt: now
        }).returning();
        return { ...newPost, authorName: "Admin" };
      }
      async updateBlogPost(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateBlogPost");
        }
        const { createdAt, updatedAt, ...cleanUpdates } = updates;
        const [updatedPost] = await dbInstance.update(blogPosts).set({
          ...cleanUpdates,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(blogPosts.id, id)).returning();
        return updatedPost ? { ...updatedPost, authorName: "Admin" } : void 0;
      }
      async deleteBlogPost(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteBlogPost");
        }
        const result = await dbInstance.delete(blogPosts).where(eq(blogPosts.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async incrementBlogPostViews(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("incrementBlogPostViews");
        }
        try {
          await dbInstance.update(blogPosts).set({
            views: sql2`COALESCE(${blogPosts.views}, 0) + 1`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(blogPosts.id, id));
          return true;
        } catch (error) {
          console.error("Error incrementing blog post views:", error);
          return false;
        }
      }
      // Page Customizations
      async getPageCustomization(pageId, userId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getPageCustomization");
        }
        const [customization] = await dbInstance.select().from(pageCustomizations).where(and(
          eq(pageCustomizations.pageId, pageId),
          eq(pageCustomizations.userId, userId),
          eq(pageCustomizations.isActive, true)
        ));
        return customization;
      }
      async getPageCustomizations(userId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getPageCustomizations");
        }
        return await dbInstance.select().from(pageCustomizations).where(and(
          eq(pageCustomizations.userId, userId),
          eq(pageCustomizations.isActive, true)
        )).orderBy(desc(pageCustomizations.updatedAt));
      }
      async createPageCustomization(customization) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createPageCustomization");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [newCustomization] = await dbInstance.insert(pageCustomizations).values({
          id,
          ...customization,
          createdAt: now,
          updatedAt: now
        }).returning();
        return newCustomization;
      }
      async updatePageCustomization(pageId, userId, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updatePageCustomization");
        }
        const [updatedCustomization] = await dbInstance.update(pageCustomizations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(pageCustomizations.pageId, pageId),
          eq(pageCustomizations.userId, userId)
        )).returning();
        return updatedCustomization;
      }
      async deletePageCustomization(pageId, userId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deletePageCustomization");
        }
        try {
          await dbInstance.update(pageCustomizations).set({ isActive: false }).where(and(
            eq(pageCustomizations.pageId, pageId),
            eq(pageCustomizations.userId, userId)
          ));
          return true;
        } catch (error) {
          console.error("Error deleting page customization:", error);
          return false;
        }
      }
      // Visual Customizations for inline editor
      async getVisualCustomizations(pageId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getVisualCustomizations");
        }
        return await dbInstance.select().from(visualCustomizations).where(eq(visualCustomizations.pageId, pageId)).orderBy(desc(visualCustomizations.updatedAt));
      }
      async getVisualCustomization(elementSelector, pageId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getVisualCustomization");
        }
        const [customization] = await dbInstance.select().from(visualCustomizations).where(and(
          eq(visualCustomizations.elementSelector, elementSelector),
          eq(visualCustomizations.pageId, pageId)
        ));
        return customization;
      }
      async createVisualCustomization(customization) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createVisualCustomization");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const existing = await this.getVisualCustomization(customization.elementSelector, customization.pageId);
        if (existing) {
          const [updated] = await dbInstance.update(visualCustomizations).set({
            value: customization.value,
            property: customization.property,
            userId: customization.userId,
            updatedAt: now
          }).where(eq(visualCustomizations.id, existing.id)).returning();
          return updated;
        } else {
          const [newCustomization] = await dbInstance.insert(visualCustomizations).values({
            id,
            ...customization,
            createdAt: now,
            updatedAt: now
          }).returning();
          return newCustomization;
        }
      }
      async saveVisualCustomization(customization) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("saveVisualCustomization");
        }
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const existing = await this.getVisualCustomization(customization.elementSelector, customization.pageId);
        if (existing) {
          const [updated] = await dbInstance.update(visualCustomizations).set({
            value: customization.value,
            property: customization.property,
            updatedBy: customization.updatedBy,
            updatedAt: now
          }).where(eq(visualCustomizations.id, existing.id)).returning();
          return updated;
        } else {
          const [newCustomization] = await dbInstance.insert(visualCustomizations).values({
            id,
            ...customization,
            createdAt: now,
            updatedAt: now
          }).returning();
          return newCustomization;
        }
      }
      async updateVisualCustomization(id, updates) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateVisualCustomization");
        }
        const [updatedCustomization] = await dbInstance.update(visualCustomizations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(visualCustomizations.id, id)).returning();
        return updatedCustomization;
      }
      async deleteVisualCustomization(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteVisualCustomization");
        }
        const result = await dbInstance.delete(visualCustomizations).where(eq(visualCustomizations.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async deleteAllVisualCustomizations(pageId) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteAllVisualCustomizations");
        }
        try {
          await dbInstance.delete(visualCustomizations).where(eq(visualCustomizations.pageId, pageId));
          return true;
        } catch (error) {
          console.error("Error deleting visual customizations:", error);
          return false;
        }
      }
      // Navbar Configuration
      async getNavbarConfig() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getNavbarConfig");
        }
        return await dbInstance.select().from(navbarConfig).orderBy(asc(navbarConfig.order));
      }
      async createNavbarConfig(data) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("createNavbarConfig");
        }
        const id = randomUUID();
        const [config] = await dbInstance.insert(navbarConfig).values({ id, ...data, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).returning();
        return config;
      }
      async updateNavbarConfig(id, data) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateNavbarConfig");
        }
        const [config] = await dbInstance.update(navbarConfig).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(navbarConfig.id, id)).returning();
        return config;
      }
      async deleteNavbarConfig(id) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("deleteNavbarConfig");
        }
        const result = await dbInstance.delete(navbarConfig).where(eq(navbarConfig.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async updateNavbarOrder(items) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updateNavbarOrder");
        }
        try {
          const promises = items.map(
            (item) => dbInstance.update(navbarConfig).set({ order: item.order, updatedAt: /* @__PURE__ */ new Date() }).where(eq(navbarConfig.id, item.id))
          );
          await Promise.all(promises);
          return true;
        } catch (error) {
          console.error("Error updating navbar order:", error);
          return false;
        }
      }
      // Payment Configuration
      async getPaymentConfig() {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("getPaymentConfig");
        }
        try {
          const [config] = await dbInstance.select().from(paymentConfig).limit(1);
          return config;
        } catch (error) {
          console.error("Error getting payment config:", error);
          return void 0;
        }
      }
      async updatePaymentConfig(configData) {
        if (!isDatabaseAvailable()) {
          throwDatabaseError("updatePaymentConfig");
        }
        try {
          const existing = await this.getPaymentConfig();
          if (existing) {
            const [updated] = await dbInstance.update(paymentConfig).set({ ...configData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(paymentConfig.id, existing.id)).returning();
            return updated;
          } else {
            const [created] = await dbInstance.insert(paymentConfig).values(configData).returning();
            return created;
          }
        } catch (error) {
          console.error("Error updating payment config:", error);
          throw error;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/email.ts
var email_exports = {};
__export(email_exports, {
  resetTransporter: () => resetTransporter,
  sendContactReply: () => sendContactReply,
  sendEmail: () => sendEmail
});
import nodemailer from "nodemailer";
async function getStorageEmailConfig() {
  try {
    const { storage: storage2 } = await Promise.resolve().then(() => (init_database_storage(), database_storage_exports));
    return await storage2.getEmailConfig();
  } catch (error) {
    console.error("Error getting email config from storage:", error);
    return null;
  }
}
function resetTransporter() {
  transporter = null;
}
async function createTransporter() {
  if (transporter) return transporter;
  try {
    const dbConfig = await getStorageEmailConfig();
    let config = fallbackConfig;
    if (dbConfig && dbConfig.isActive) {
      console.log("Using email configuration from database");
      config = {
        from: dbConfig.fromEmail,
        replyTo: dbConfig.replyToEmail,
        host: dbConfig.smtpHost,
        port: dbConfig.smtpPort || 587,
        secure: dbConfig.smtpSecure || false,
        user: dbConfig.smtpUser,
        pass: dbConfig.smtpPass
      };
    } else {
      console.log("No active email configuration found in database, using fallback");
    }
    if (!config.user || !config.pass) {
      console.log("No email credentials found, creating test account...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log("Test email account created:", testAccount.user);
      console.log("Preview emails at: https://ethereal.email");
    } else {
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
    }
    await transporter.verify();
    console.log("Email transporter ready");
    return transporter;
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    throw error;
  }
}
async function sendEmail(options) {
  try {
    const emailTransporter = await createTransporter();
    const dbConfig = await getStorageEmailConfig();
    let activeConfig = fallbackConfig;
    if (dbConfig && dbConfig.isActive) {
      activeConfig = {
        from: dbConfig.fromEmail,
        replyTo: dbConfig.replyToEmail,
        host: dbConfig.smtpHost,
        port: dbConfig.smtpPort || 587,
        secure: dbConfig.smtpSecure || false,
        user: dbConfig.smtpUser,
        pass: dbConfig.smtpPass
      };
    }
    const mailOptions = {
      from: activeConfig.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || activeConfig.replyTo
    };
    const info = await emailTransporter.sendMail(mailOptions);
    if (info.messageId && info.messageId.includes("@ethereal.email")) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
async function sendContactReply(to, originalSubject, replyContent) {
  const subject = `Re: ${originalSubject}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Respuesta a tu mensaje de contacto</h2>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <div style="color: #495057; line-height: 1.6; white-space: pre-wrap;">${replyContent}</div>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
        <p>Este es un mensaje autom\xE1tico enviado desde nuestro sistema de contacto.</p>
        <p>Si tienes m\xE1s preguntas, puedes responder directamente a este correo.</p>
      </div>
    </div>
  `;
  const text2 = `Respuesta a tu mensaje de contacto:

${replyContent}

Este es un mensaje autom\xE1tico enviado desde nuestro sistema de contacto.
Si tienes m\xE1s preguntas, puedes responder directamente a este correo.`;
  return await sendEmail({
    to,
    subject,
    text: text2,
    html
  });
}
var fallbackConfig, transporter;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    fallbackConfig = {
      from: process.env.EMAIL_FROM || "noreply@tuempresa.com",
      replyTo: process.env.EMAIL_REPLY_TO || "contacto@tuempresa.com",
      host: process.env.EMAIL_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    };
    transporter = null;
  }
});

// server/index.ts
import dotenv2 from "dotenv";
import express5 from "express";
import path5 from "path";
import fs4 from "fs";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_database_storage();
init_database_storage();

// server/routes.ts
init_schema();
import express from "express";
import Stripe from "stripe";

// server/objectStorage.ts
import { randomUUID as randomUUID2 } from "crypto";
import * as fs from "fs";
import * as path from "path";
var UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Upload a file to local storage
  async uploadFile(fileName, data) {
    try {
      const objectName = `uploads/${randomUUID2()}-${fileName}`;
      const fullPath = path.join(UPLOADS_DIR, objectName.replace("uploads/", ""));
      if (typeof data === "string") {
        fs.writeFileSync(fullPath, data, "utf8");
      } else {
        fs.writeFileSync(fullPath, data);
      }
      return objectName;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
  // Generate upload URL for client-side uploads
  async getObjectEntityUploadURL(baseURL) {
    try {
      const objectId = randomUUID2();
      if (baseURL) {
        return `${baseURL}/api/objects/direct-upload/${objectId}`;
      }
      return `/api/objects/direct-upload/${objectId}`;
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
  }
  async handleDirectUpload(objectId, fileBuffer, originalFilename) {
    try {
      let extension = "";
      const lastDotIndex = originalFilename.lastIndexOf(".");
      if (lastDotIndex > 0) {
        extension = originalFilename.substring(lastDotIndex).toLowerCase();
      }
      if (!extension) {
        const header = fileBuffer.toString("hex", 0, 4);
        if (header.startsWith("ffd8ff")) {
          extension = ".jpg";
        } else if (header.startsWith("89504e47")) {
          extension = ".png";
        } else if (header.startsWith("47494638")) {
          extension = ".gif";
        } else if (header.startsWith("52494646") && fileBuffer.toString("ascii", 8, 12) === "WEBP") {
          extension = ".webp";
        } else {
          extension = ".jpg";
        }
      }
      const timestamp2 = Date.now();
      const objectName = `${objectId}-${timestamp2}${extension}`;
      console.log(`Creating object name: ${objectName} from original: ${originalFilename}, extension: ${extension}`);
      const uploadsDir2 = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir2)) {
        fs.mkdirSync(uploadsDir2, { recursive: true });
        console.log(`Created uploads directory: ${uploadsDir2}`);
      }
      const filePath = path.join(uploadsDir2, objectName);
      console.log(`Writing file to: ${filePath}, size: ${fileBuffer.length} bytes`);
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`File saved successfully: ${objectName}, size: ${fileBuffer.length} bytes`);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File was not created at ${filePath}`);
      }
      const stats = fs.statSync(filePath);
      console.log(`File verified: ${objectName}, actual size: ${stats.size} bytes`);
      return objectName;
    } catch (error) {
      console.error("Error in handleDirectUpload:", error);
      throw new Error(`Failed to save uploaded file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  // Download a file from local storage
  async downloadObject(objectName, res) {
    try {
      let fileName = objectName;
      if (fileName.startsWith("uploads/")) {
        fileName = fileName.replace("uploads/", "");
      }
      if (!fileName.includes("-") || !fileName.includes(".")) {
        const files = fs.readdirSync(UPLOADS_DIR);
        const matchingFile = files.find((file) => file.startsWith(fileName));
        if (matchingFile) {
          fileName = matchingFile;
        } else {
          console.error(`No file found for object ID: ${fileName}`);
          console.error(`Available files: ${files.join(", ")}`);
          throw new ObjectNotFoundError();
        }
      }
      const fullPath = path.join(UPLOADS_DIR, fileName);
      console.log(`Attempting to serve file: ${fullPath}`);
      if (!fs.existsSync(fullPath)) {
        console.error(`File not found at path: ${fullPath}`);
        throw new ObjectNotFoundError();
      }
      const data = fs.readFileSync(fullPath);
      const ext = path.extname(fileName).toLowerCase();
      const contentTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".bmp": "image/bmp",
        ".tiff": "image/tiff",
        ".tif": "image/tiff"
      };
      let contentType = contentTypes[ext];
      if (!contentType) {
        const header = data.toString("hex", 0, 4);
        if (header.startsWith("ffd8ff")) {
          contentType = "image/jpeg";
        } else if (header.startsWith("89504e47")) {
          contentType = "image/png";
        } else if (header.startsWith("47494638")) {
          contentType = "image/gif";
        } else if (data.length > 12 && header.startsWith("52494646") && data.toString("ascii", 8, 12) === "WEBP") {
          contentType = "image/webp";
        } else {
          contentType = "application/octet-stream";
        }
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Length", data.length);
      res.send(data);
      console.log(`Successfully served file: ${fileName}, type: ${contentType}, size: ${data.length} bytes`);
    } catch (error) {
      console.error("Error downloading object:", error);
      throw new ObjectNotFoundError();
    }
  }
  // Get a file as bytes
  async getObjectBytes(objectName) {
    try {
      let fileName = objectName;
      if (fileName.startsWith("uploads/")) {
        fileName = fileName.replace("uploads/", "");
      }
      if (!fileName.includes("-") || !fileName.includes(".")) {
        const files = fs.readdirSync(UPLOADS_DIR);
        const matchingFile = files.find((file) => file.startsWith(fileName));
        if (matchingFile) {
          fileName = matchingFile;
        } else {
          console.error(`No file found for object ID: ${fileName}`);
          throw new ObjectNotFoundError();
        }
      }
      const fullPath = path.join(UPLOADS_DIR, fileName);
      if (!fs.existsSync(fullPath)) {
        throw new ObjectNotFoundError();
      }
      const data = fs.readFileSync(fullPath);
      return new Uint8Array(data);
    } catch (error) {
      console.error("Error getting object bytes:", error);
      throw new ObjectNotFoundError();
    }
  }
  // Delete a file from local storage
  async deleteObject(objectName) {
    try {
      const fileName = objectName.replace("uploads/", "");
      const fullPath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  }
  // List objects in storage
  async listObjects() {
    try {
      const files = fs.readdirSync(UPLOADS_DIR);
      return files.map((file) => `uploads/${file}`);
    } catch (error) {
      console.error("Error listing objects:", error);
      return [];
    }
  }
  // Normalize object path for public access
  normalizeObjectEntityPath(path6) {
    if (path6.includes("/api/objects/direct-upload/")) {
      const objectId = path6.split("/api/objects/direct-upload/")[1];
      return `/objects/${objectId}`;
    }
    if (path6.startsWith("http")) {
      try {
        const url = new URL(path6);
        if (url.pathname.startsWith("/objects/")) {
          return url.pathname;
        }
        if (url.pathname.includes("/api/objects/direct-upload/")) {
          const objectId = url.pathname.split("/api/objects/direct-upload/")[1];
          return `/objects/${objectId}`;
        }
      } catch (e) {
      }
    }
    if (path6.startsWith("/objects/")) {
      return path6;
    }
    const cleanPath = path6.replace(/^\/+/, "");
    if (!cleanPath.startsWith("objects/")) {
      return `/objects/${cleanPath}`;
    }
    return `/${cleanPath}`;
  }
  // Get object entity file (for backwards compatibility)
  async getObjectEntityFile(path6) {
    try {
      let objectName = path6;
      if (objectName.startsWith("/objects/")) {
        objectName = objectName.replace("/objects/", "");
      }
      const data = await this.getObjectBytes(objectName);
      return {
        name: objectName,
        data
      };
    } catch (error) {
      throw new ObjectNotFoundError();
    }
  }
  // Search for public object (simplified version)
  async searchPublicObject(filePath) {
    try {
      const data = await this.getObjectBytes(filePath);
      return {
        name: filePath,
        data
      };
    } catch (error) {
      return null;
    }
  }
};
var objectStorageService = new ObjectStorageService();

// server/routes.ts
import crypto from "crypto";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil"
});
var sessions = /* @__PURE__ */ new Map();
var adminCreationCodes = /* @__PURE__ */ new Map();
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function generateSecurityCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function requireAuth(req, res, next) {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.userId = sessions.get(sessionId);
  next();
}
function requireRole(roles) {
  return async (req, res, next) => {
    const user = await storage.getUser(req.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    req.user = user;
    next();
  };
}
async function registerRoutes(app2) {
  app2.use("/api", express.json({
    limit: "10mb",
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf.toString());
      } catch (error) {
        console.error("JSON Parse Error:", {
          error: error.message,
          body: buf.toString(),
          contentType: req.get("Content-Type"),
          url: req.url,
          method: req.method
        });
        throw new Error("Invalid JSON format");
      }
    }
  }));
  app2.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      const sessionId = generateSessionId();
      sessions.set(sessionId, user.id);
      res.json({
        token: sessionId,
        user: { ...user, password: void 0 }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.json({ ...user, password: void 0 });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.post("/api/auth/request-admin-code", async (req, res) => {
    try {
      const { email } = req.body;
      if (email !== "yaview.lomeli@gmail.com") {
        return res.status(403).json({ message: "Email no autorizado para crear cuentas administrativas" });
      }
      const code = generateSecurityCode();
      const expiresAt = Date.now() + 10 * 60 * 1e3;
      adminCreationCodes.set(code, {
        email,
        expiresAt,
        used: false
      });
      console.log(`
\u{1F510} C\xD3DIGO DE SEGURIDAD PARA CREAR ADMIN \u{1F510}`);
      console.log(`Email: ${email}`);
      console.log(`C\xF3digo: ${code}`);
      console.log(`Expira en 10 minutos`);
      console.log(`===============================
`);
      res.json({
        message: "C\xF3digo de seguridad generado. Revisa la consola del servidor.",
        codeGenerated: true
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al generar c\xF3digo" });
    }
  });
  app2.post("/api/auth/create-admin", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const { securityCode } = req.body;
      if (!securityCode) {
        return res.status(400).json({ message: "C\xF3digo de seguridad requerido" });
      }
      const codeData = adminCreationCodes.get(securityCode);
      if (!codeData || codeData.used || Date.now() > codeData.expiresAt) {
        return res.status(400).json({ message: "C\xF3digo de seguridad inv\xE1lido o expirado" });
      }
      if (!["superuser", "admin", "staff"].includes(userData.role || "")) {
        return res.status(400).json({ message: "Invalid role. Only superuser, admin, and staff are allowed." });
      }
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      codeData.used = true;
      const user = await storage.createUser(userData);
      console.log(`\u2705 Nueva cuenta administrativa creada:`);
      console.log(`Rol: ${user.role}`);
      console.log(`Usuario: ${user.username}`);
      console.log(`Email: ${user.email}
`);
      res.json({
        message: `${userData.role} account created successfully`,
        user: { ...user, password: void 0 }
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ ...user, password: void 0 });
  });
  app2.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const updatedUser = await storage.updateUser(userId, { password: newPassword });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/visual-customizations/:pageId", async (req, res) => {
    try {
      const { pageId } = req.params;
      const customizations = await storage.getVisualCustomizations(pageId);
      res.json(customizations);
    } catch (error) {
      console.error("Error fetching customizations:", error);
      res.status(500).json({ message: "Failed to fetch customizations" });
    }
  });
  app2.post("/api/visual-customizations", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "superuser" && user.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const customizationData = {
        ...req.body,
        userId,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const customization = await storage.createVisualCustomization(customizationData);
      res.json(customization);
    } catch (error) {
      console.error("Error saving customization:", error);
      res.status(500).json({ message: "Failed to save customization" });
    }
  });
  app2.get("/api/config", async (req, res) => {
    const config = await storage.getSiteConfig();
    res.json(config);
  });
  app2.put("/api/config", requireAuth, requireRole(["superuser", "admin"]), async (req, res) => {
    try {
      const config = await storage.getSiteConfig();
      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }
      const updatedConfig = await storage.updateSiteConfig(config.id, {
        config: req.body.config,
        updatedBy: req.userId
      });
      res.json(updatedConfig);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    const users2 = await storage.getAllUsers();
    res.json(users2.map((user) => ({ ...user, password: void 0 })));
  });
  app2.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;
      const currentUser = await storage.getUser(currentUserId);
      if (currentUserId !== id && !["admin", "superuser"].includes(currentUser?.role || "")) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      const updates = { ...req.body };
      if (currentUser?.role !== "superuser" && currentUser?.role !== "admin") {
        delete updates.role;
        delete updates.isActive;
      }
      delete updates.password;
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...updatedUser, password: void 0 });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/testimonials", async (req, res) => {
    const testimonials2 = await storage.getAllTestimonials();
    res.json(testimonials2);
  });
  app2.post("/api/testimonials", async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.json(testimonial);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/testimonials/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTestimonial = await storage.updateTestimonial(id, req.body);
      if (!updatedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(updatedTestimonial);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/testimonials/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteTestimonial(id);
    if (!deleted) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted successfully" });
  });
  app2.get("/api/faq-categories", async (req, res) => {
    const categories = await storage.getAllFaqCategories();
    res.json(categories);
  });
  app2.post("/api/faq-categories", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const categoryData = insertFaqCategorySchema.parse(req.body);
      const category = await storage.createFaqCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/faq-categories/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCategory = await storage.updateFaqCategory(id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/faq-categories/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteFaqCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });
  app2.get("/api/faqs", async (req, res) => {
    const { categoryId } = req.query;
    let faqs2;
    if (categoryId) {
      faqs2 = await storage.getFaqsByCategory(categoryId);
    } else {
      faqs2 = await storage.getAllFaqs();
    }
    res.json(faqs2);
  });
  app2.post("/api/faqs", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const faqData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(faqData);
      res.json(faq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/faqs/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedFaq = await storage.updateFaq(id, req.body);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/faqs/:id/increment-views", async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await storage.getFaq(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      const updatedFaq = await storage.updateFaq(id, {
        views: (faq.views || 0) + 1
      });
      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/faqs/:id/vote-helpful", async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await storage.getFaq(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      const updatedFaq = await storage.updateFaq(id, {
        helpfulVotes: (faq.helpfulVotes || 0) + 1
      });
      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/faqs/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteFaq(id);
    if (!deleted) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json({ message: "FAQ deleted successfully" });
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      try {
        const emailConfig2 = await storage.getEmailConfig();
        if (emailConfig2 && emailConfig2.isActive && emailConfig2.fromEmail) {
          const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          const emailSubject = messageData.subject ? `Nuevo mensaje de contacto: ${messageData.subject}` : "Nuevo mensaje de contacto desde el sitio web";
          const emailContent = `
Has recibido un nuevo mensaje de contacto desde tu sitio web:

Nombre: ${messageData.name}
Email: ${messageData.email}
${messageData.phone ? `Tel\xE9fono: ${messageData.phone}` : ""}
${messageData.subject ? `Asunto: ${messageData.subject}` : ""}

Mensaje:
${messageData.message}

---
Este mensaje fue enviado desde el formulario de contacto de tu sitio web.
Puedes responder directamente a este email o gestionar el mensaje desde el panel de administraci\xF3n.
          `;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #333; margin-top: 0;">Nuevo mensaje de contacto</h2>
                <p style="color: #666; margin-bottom: 0;">Has recibido un nuevo mensaje desde tu sitio web</p>
              </div>

              <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Nombre:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.email}</td>
                  </tr>
                  ${messageData.phone ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Tel\xE9fono:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.phone}</td>
                  </tr>
                  ` : ""}
                  ${messageData.subject ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Asunto:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.subject}</td>
                  </tr>
                  ` : ""}
                </table>

                <div style="margin-top: 20px;">
                  <strong>Mensaje:</strong>
                  <div style="margin-top: 10px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; white-space: pre-wrap;">${messageData.message}</div>
                </div>
              </div>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
                <p>Este mensaje fue enviado desde el formulario de contacto de tu sitio web.</p>
                <p>Puedes responder directamente a este email o gestionar el mensaje desde el panel de administraci\xF3n.</p>
              </div>
            </div>
          `;
          await sendEmail2({
            to: emailConfig2.fromEmail,
            subject: emailSubject,
            text: emailContent,
            html: emailHtml,
            replyTo: messageData.email
          });
          console.log(`\u{1F4E7} Contact notification email sent to: ${emailConfig2.fromEmail}`);
        }
      } catch (emailError) {
        console.error("Error sending contact notification email:", emailError);
      }
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/contact/messages", async (req, res) => {
    const messages = await storage.getAllContactMessages();
    res.json(messages);
  });
  app2.post("/api/contact/messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      try {
        const emailConfig2 = await storage.getEmailConfig();
        if (emailConfig2 && emailConfig2.isActive && emailConfig2.fromEmail) {
          const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          const emailSubject = messageData.subject ? `Nuevo mensaje de contacto: ${messageData.subject}` : "Nuevo mensaje de contacto desde el sitio web";
          const emailContent = `
Has recibido un nuevo mensaje de contacto desde tu sitio web:

Nombre: ${messageData.name}
Email: ${messageData.email}
${messageData.phone ? `Tel\xE9fono: ${messageData.phone}` : ""}
${messageData.subject ? `Asunto: ${messageData.subject}` : ""}

Mensaje:
${messageData.message}

---
Este mensaje fue enviado desde el formulario de contacto de tu sitio web.
Puedes responder directamente a este email o gestionar el mensaje desde el panel de administraci\xF3n.
          `;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #333; margin-top: 0;">Nuevo mensaje de contacto</h2>
                <p style="color: #666; margin-bottom: 0;">Has recibido un nuevo mensaje desde tu sitio web</p>
              </div>

              <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Nombre:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.email}</td>
                  </tr>
                  ${messageData.phone ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Tel\xE9fono:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.phone}</td>
                  </tr>
                  ` : ""}
                  ${messageData.subject ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Asunto:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${messageData.subject}</td>
                  </tr>
                  ` : ""}
                </table>

                <div style="margin-top: 20px;">
                  <strong>Mensaje:</strong>
                  <div style="margin-top: 10px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; white-space: pre-wrap;">${messageData.message}</div>
                </div>
              </div>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
                <p>Este mensaje fue enviado desde el formulario de contacto de tu sitio web.</p>
                <p>Puedes responder directamente a este email o gestionar el mensaje desde el panel de administraci\xF3n.</p>
              </div>
            </div>
          `;
          await sendEmail2({
            to: emailConfig2.fromEmail,
            subject: emailSubject,
            text: emailContent,
            html: emailHtml,
            replyTo: messageData.email
          });
          console.log(`\u{1F4E7} Contact notification email sent to: ${emailConfig2.fromEmail}`);
        }
      } catch (emailError) {
        console.error("Error sending contact notification email:", emailError);
      }
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/contact/messages/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, req.body);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/contact/messages/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteContactMessage(id);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  });
  app2.put("/api/contact/messages/:id/read", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isRead: true });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/contact/messages/:id/unread", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isRead: false });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/contact/messages/:id/archive", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isArchived: true });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/contact/messages/:id/unarchive", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isArchived: false });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.post("/api/contact/messages/:id/reply", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      if (!reply) {
        return res.status(400).json({ message: "Reply content is required" });
      }
      const originalMessage = await storage.getContactMessage(id);
      if (!originalMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      const updatedMessage = await storage.updateContactMessage(id, {
        reply,
        isReplied: true,
        isRead: true,
        repliedAt: /* @__PURE__ */ new Date(),
        repliedBy: req.userId
      });
      try {
        const { sendContactReply: sendContactReply2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        const emailSent = await sendContactReply2(
          originalMessage.email,
          originalMessage.subject || "Respuesta a tu consulta",
          reply
        );
        if (emailSent) {
          console.log(`Email reply sent successfully to ${originalMessage.email}`);
        } else {
          console.log(`Failed to send email reply to ${originalMessage.email}`);
        }
      } catch (emailError) {
        console.error("Error sending email reply:", emailError);
      }
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error replying to message:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/contact/info", async (req, res) => {
    try {
      const contactInfo2 = await storage.getContactInfo();
      res.json(contactInfo2 || {});
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({ message: "Error fetching contact info" });
    }
  });
  app2.get("/api/sections", async (req, res) => {
    const sections2 = await storage.getAllSections();
    res.json(sections2);
  });
  app2.post("/api/sections", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(sectionData);
      res.json(section);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/sections/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSection = await storage.updateSection(id, req.body);
      if (!updatedSection) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(updatedSection);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/sections/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteSection(id);
    if (!deleted) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json({ message: "Section deleted successfully" });
  });
  app2.get("/api/reservations", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const reservations2 = await storage.getAllReservations();
    res.json(reservations2);
  });
  app2.post("/api/reservations", async (req, res) => {
    try {
      console.log("Received reservation data:", JSON.stringify(req.body, null, 2));
      const reservationData = insertReservationSchema.parse(req.body);
      const settings = await storage.getReservationSettings();
      if (!settings) {
        return res.status(400).json({ message: "Reservation system not configured" });
      }
      const requestDate = new Date(reservationData.date);
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayOfWeek = dayNames[requestDate.getDay()];
      const businessHours = settings.businessHours;
      if (!businessHours[dayOfWeek]?.enabled) {
        return res.status(400).json({ message: "Service not available on this day" });
      }
      const dateStr = requestDate.toISOString().split("T")[0];
      const existingReservations = await storage.getReservationsForDate(dateStr);
      const timeSlot = reservationData.timeSlot;
      const isConflict = existingReservations.some(
        (existing) => existing.timeSlot === timeSlot
      );
      if (isConflict) {
        return res.status(400).json({ message: "Time slot not available" });
      }
      const reservation = await storage.createReservation(reservationData);
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/reservations/available-slots/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const settings = await storage.getReservationSettings();
      if (!settings) {
        return res.status(400).json({ message: "Reservation system not configured" });
      }
      const requestDate = new Date(date);
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayName = dayNames[requestDate.getDay()];
      const businessHours = settings.businessHours;
      console.log(`Checking availability for ${date}, day: ${dayName}, enabled: ${businessHours[dayName]?.enabled}`);
      if (!businessHours[dayName]?.enabled) {
        return res.json({ availableSlots: [], businessHours: null });
      }
      const dayHours = businessHours[dayName];
      const startTime = dayHours.open;
      const endTime = dayHours.close;
      const slots = [];
      const start = /* @__PURE__ */ new Date(`2000-01-01T${startTime}:00`);
      const end = /* @__PURE__ */ new Date(`2000-01-01T${endTime}:00`);
      const duration = settings.defaultDuration;
      const buffer = settings.bufferTime;
      while (start < end) {
        const timeSlot = start.toTimeString().substring(0, 5);
        slots.push(timeSlot);
        start.setMinutes(start.getMinutes() + (duration || 60) + (buffer || 15));
      }
      const existingReservations = await storage.getReservationsForDate(date);
      const bookedSlots = existingReservations.map((r) => r.timeSlot);
      const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));
      res.json({ availableSlots, businessHours: dayHours });
    } catch (error) {
      res.status(500).json({ message: "Error fetching available slots" });
    }
  });
  app2.put("/api/reservations/:id", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating reservation:", id, "with data:", JSON.stringify(req.body, null, 2));
      const { id: bodyId, createdAt, updatedAt, userId, ...cleanData } = req.body;
      if (cleanData.date && typeof cleanData.date === "string") {
        cleanData.date = new Date(cleanData.date);
      }
      console.log("Clean data for update:", JSON.stringify(cleanData, null, 2));
      const updatedReservation = await storage.updateReservation(id, cleanData);
      if (!updatedReservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      res.json(updatedReservation);
    } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/reservations/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteReservation(id);
    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation deleted successfully" });
  });
  app2.get("/api/reservation-settings", async (req, res) => {
    try {
      const settings = await storage.getReservationSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservation settings" });
    }
  });
  app2.put("/api/reservation-settings", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const settingsData = insertReservationSettingsSchema.parse(req.body);
      const settings = await storage.updateReservationSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/blog", async (req, res) => {
    const posts = await storage.getAllBlogPosts();
    res.json(posts);
  });
  app2.post("/api/blog", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const cleanData = { ...req.body };
      if (cleanData.publishedAt !== void 0) {
        if (cleanData.publishedAt === null || cleanData.publishedAt === "") {
          cleanData.publishedAt = null;
        } else if (typeof cleanData.publishedAt === "string") {
          cleanData.publishedAt = new Date(cleanData.publishedAt);
        }
      }
      if (cleanData.isPublished && !cleanData.publishedAt) {
        cleanData.publishedAt = /* @__PURE__ */ new Date();
      }
      const postData = {
        ...cleanData,
        authorId: req.userId,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/blog/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { updatedAt, createdAt, authorName, views, id: bodyId, ...cleanData } = req.body;
      if (cleanData.publishedAt !== void 0) {
        if (cleanData.publishedAt === null || cleanData.publishedAt === "") {
          cleanData.publishedAt = null;
        } else if (typeof cleanData.publishedAt === "string") {
          cleanData.publishedAt = new Date(cleanData.publishedAt);
        }
      }
      const postData = {
        ...cleanData,
        updatedBy: req.userId
      };
      const updatedPost = await storage.updateBlogPost(id, postData);
      if (!updatedPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/blog/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json({ message: "Blog post deleted successfully" });
  });
  app2.get("/api/blog/slug/:slug", async (req, res) => {
    const { slug } = req.params;
    const post = await storage.getBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json(post);
  });
  app2.put("/api/blog/:id/view", async (req, res) => {
    const { id } = req.params;
    const updated = await storage.incrementBlogPostViews(id);
    if (!updated) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json({ message: "Views incremented" });
  });
  app2.get("/api/store/categories", async (req, res) => {
    const categories = await storage.getAllProductCategories();
    res.json(categories);
  });
  app2.post("/api/store/categories", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/categories/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCategory = await storage.updateProductCategory(id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/store/categories/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteProductCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });
  app2.get("/api/store/products", async (req, res) => {
    const { category, featured, active } = req.query;
    let products2;
    if (category) {
      products2 = await storage.getProductsByCategory(category);
    } else if (featured === "true") {
      products2 = await storage.getFeaturedProducts();
    } else if (active === "true") {
      products2 = await storage.getActiveProducts();
    } else {
      products2 = await storage.getAllProducts();
    }
    const normalizedProducts = products2.map((product) => ({
      ...product,
      images: Array.isArray(product.images) ? product.images.map((url) => {
        if (typeof url === "string" && url.startsWith("https://storage.googleapis.com/")) {
          try {
            const objectService = new ObjectStorageService();
            return objectService.normalizeObjectEntityPath(url);
          } catch {
            return url;
          }
        }
        return url;
      }) : product.images
    }));
    res.json(normalizedProducts);
  });
  app2.get("/api/store/products/:id", async (req, res) => {
    const { id } = req.params;
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const normalizedProduct = {
      ...product,
      images: Array.isArray(product.images) ? product.images.map((url) => {
        if (typeof url === "string" && url.startsWith("https://storage.googleapis.com/")) {
          try {
            const objectService = new ObjectStorageService();
            return objectService.normalizeObjectEntityPath(url);
          } catch {
            return url;
          }
        }
        return url;
      }) : product.images
    };
    res.json(normalizedProduct);
  });
  app2.post("/api/store/products", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      try {
        const paymentConfig2 = await storage.getPaymentConfig();
        if (paymentConfig2?.isActive && paymentConfig2.stripeSecretKey) {
          const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
            apiVersion: "2025-07-30.basil"
          });
          const imageUrls = Array.isArray(product.images) ? product.images.map((img) => {
            if (img.startsWith("/objects/")) {
              return `${req.protocol}://${req.get("host")}${img}`;
            }
            return img;
          }) : [];
          const stripeProduct = await stripeClient.products.create({
            name: product.name,
            description: product.description ?? void 0,
            metadata: {
              localProductId: product.id
            },
            images: imageUrls
          });
          const stripePrice = await stripeClient.prices.create({
            product: stripeProduct.id,
            unit_amount: product.price,
            // Price is already in cents
            currency: (product.currency || "MXN").toLowerCase()
          });
          const updatedProduct = await storage.updateProduct(product.id, {
            ...product,
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id
          });
          console.log(`Product ${product.name} synced with Stripe:`, {
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id
          });
          res.json(updatedProduct);
        } else {
          res.json(product);
        }
      } catch (stripeError) {
        console.error("Error syncing with Stripe:", stripeError);
        res.json({
          ...product,
          stripeError: "Failed to sync with Stripe: " + stripeError.message
        });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/products/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct = await storage.updateProduct(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      try {
        const paymentConfig2 = await storage.getPaymentConfig();
        if (paymentConfig2?.isActive && paymentConfig2.stripeSecretKey && updatedProduct.stripeProductId) {
          const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
            apiVersion: "2025-07-30.basil"
          });
          const imageUrls = Array.isArray(updatedProduct.images) ? updatedProduct.images.map((img) => {
            if (img.startsWith("/objects/")) {
              return `${req.protocol}://${req.get("host")}${img}`;
            }
            return img;
          }) : [];
          await stripeClient.products.update(updatedProduct.stripeProductId, {
            name: updatedProduct.name,
            description: updatedProduct.description ?? void 0,
            images: imageUrls
          });
          if (updatedProduct.price !== void 0 && updatedProduct.stripePriceId) {
            const originalProduct = await storage.getProduct(id);
            if (originalProduct && (originalProduct.price !== updatedProduct.price || (originalProduct.currency || "MXN") !== (updatedProduct.currency || "MXN"))) {
              try {
                await stripeClient.prices.update(originalProduct.stripePriceId, {
                  active: false
                });
                console.log(`Deactivated old price: ${originalProduct.stripePriceId}`);
              } catch (error) {
                console.warn(`Could not deactivate old price ${originalProduct.stripePriceId}:`, error);
              }
            }
            const stripePrice = await stripeClient.prices.create({
              product: updatedProduct.stripeProductId,
              unit_amount: updatedProduct.price,
              currency: (updatedProduct.currency || "MXN").toLowerCase()
            });
            const finalProduct = await storage.updateProduct(id, {
              ...updatedProduct,
              stripePriceId: stripePrice.id
            });
            console.log(`Product ${updatedProduct.name} updated in Stripe with new price:`, stripePrice.id);
            res.json(finalProduct);
          } else {
            console.log(`Product ${updatedProduct.name} updated in Stripe`);
            res.json(updatedProduct);
          }
        } else {
          res.json(updatedProduct);
        }
      } catch (stripeError) {
        console.error("Error syncing with Stripe:", stripeError);
        res.json({
          ...updatedProduct,
          stripeError: "Failed to sync with Stripe: " + stripeError.message
        });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/store/products/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { force } = req.query;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const orders2 = await storage.getAllOrders();
      const hasOrders = orders2.some(
        (order) => Array.isArray(order.items) && order.items.some((item) => item.productId === id)
      );
      if (hasOrders && force !== "true") {
        return res.status(409).json({
          message: "Este producto tiene pedidos asociados y no puede eliminarse completamente",
          suggestion: "\xBFDeseas desactivarlo en su lugar? Esto lo ocultar\xE1 de la tienda pero mantendr\xE1 el historial de pedidos.",
          hasOrders: true,
          productName: product.name
        });
      }
      try {
        const inventoryMovements2 = await storage.getInventoryMovements(id);
        console.log(`Found ${inventoryMovements2.length} inventory movements to delete for product ${product.name}`);
        for (const movement of inventoryMovements2) {
          await storage.deleteInventoryMovement(movement.id);
        }
        console.log(`Successfully deleted ${inventoryMovements2.length} inventory movements for product ${product.name}`);
      } catch (inventoryError) {
        console.error("Error deleting inventory movements:", inventoryError);
        return res.status(500).json({
          message: "Failed to delete related inventory movements",
          error: inventoryError instanceof Error ? inventoryError.message : "Unknown error"
        });
      }
      try {
        await storage.deleteCartItemsByProduct(id);
        console.log(`Deleted cart items for product ${product.name}`);
      } catch (cartError) {
        console.warn("Error deleting cart items:", cartError);
      }
      try {
        await storage.deleteOrderItemsByProduct(id);
        console.log(`Deleted order items for product ${product.name}`);
      } catch (orderItemsError) {
        console.warn("Error deleting order items:", orderItemsError);
      }
      try {
        const variants = await storage.getProductVariants(id);
        for (const variant of variants) {
          await storage.deleteProductVariant(variant.id);
        }
        console.log(`Deleted ${variants.length} product variants for product ${product.name}`);
      } catch (variantError) {
        console.warn("Error deleting product variants:", variantError);
      }
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      try {
        const paymentConfig2 = await storage.getPaymentConfig();
        if (paymentConfig2?.isActive && paymentConfig2.stripeSecretKey && product.stripeProductId) {
          const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
            apiVersion: "2025-07-30.basil"
          });
          await stripeClient.products.update(product.stripeProductId, {
            active: false
          });
          if (product.stripePriceId) {
            try {
              await stripeClient.prices.update(product.stripePriceId, {
                active: false
              });
            } catch (priceError) {
              console.warn(`Could not deactivate price ${product.stripePriceId}:`, priceError);
            }
          }
          console.log(`Product ${product.name} archived in Stripe: ${product.stripeProductId}`);
        }
      } catch (stripeError) {
        console.error("Error archiving product in Stripe:", stripeError);
      }
      res.json({ message: "Product and all related records deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete product" });
    }
  });
  app2.put("/api/store/products/:id/deactivate", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct = await storage.updateProduct(id, {
        isActive: false,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      try {
        const paymentConfig2 = await storage.getPaymentConfig();
        if (paymentConfig2?.isActive && paymentConfig2.stripeSecretKey && updatedProduct.stripeProductId) {
          const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
            apiVersion: "2025-07-30.basil"
          });
          await stripeClient.products.update(updatedProduct.stripeProductId, {
            active: false
          });
          console.log(`Product ${updatedProduct.name} deactivated in Stripe`);
        }
      } catch (stripeError) {
        console.error("Error deactivating product in Stripe:", stripeError);
      }
      res.json({
        message: "Producto desactivado correctamente",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Error deactivating product:", error);
      res.status(500).json({ message: "Failed to deactivate product" });
    }
  });
  app2.put("/api/store/products/:id/activate", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct = await storage.updateProduct(id, {
        isActive: true,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      try {
        const paymentConfig2 = await storage.getPaymentConfig();
        if (paymentConfig2?.isActive && paymentConfig2.stripeSecretKey && updatedProduct.stripeProductId) {
          const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
            apiVersion: "2025-07-30.basil"
          });
          await stripeClient.products.update(updatedProduct.stripeProductId, {
            active: true
          });
          console.log(`Product ${updatedProduct.name} reactivated in Stripe`);
        }
      } catch (stripeError) {
        console.error("Error reactivating product in Stripe:", stripeError);
      }
      res.json({
        message: "Producto reactivado correctamente",
        product: updatedProduct
      });
    } catch (error) {
      console.error("Error reactivating product:", error);
      res.status(500).json({ message: "Failed to reactivate product" });
    }
  });
  app2.get("/api/store/products/:productId/variants", async (req, res) => {
    const { productId } = req.params;
    const variants = await storage.getProductVariants(productId);
    res.json(variants);
  });
  app2.post("/api/store/products/:productId/variants", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { productId } = req.params;
      const variantData = insertProductVariantSchema.parse({ ...req.body, productId });
      const variant = await storage.createProductVariant(variantData);
      res.json(variant);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/variants/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedVariant = await storage.updateProductVariant(id, req.body);
      if (!updatedVariant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      res.json(updatedVariant);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/store/variants/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteProductVariant(id);
    if (!deleted) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.json({ message: "Variant deleted successfully" });
  });
  app2.get("/api/store/inventory", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const { productId } = req.query;
    const movements = await storage.getInventoryMovements(productId);
    res.json(movements);
  });
  app2.post("/api/store/inventory", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const movementData = insertInventoryMovementSchema.parse({
        ...req.body,
        createdBy: req.userId
      });
      const movement = await storage.createInventoryMovement(movementData);
      if (req.body.type === "adjustment" && req.body.productId) {
        const product = await storage.getProduct(req.body.productId);
        if (product) {
          const newStock = product.stock + req.body.quantity;
          await storage.updateProductStock(req.body.productId, Math.max(0, newStock));
        }
      }
      res.json(movement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/store/inventory/low-stock", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const products2 = await storage.getLowStockProducts();
    res.json(products2);
  });
  app2.get("/api/inventory/movements", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const { productId } = req.query;
    const movements = await storage.getInventoryMovements(productId);
    res.json(movements);
  });
  app2.post("/api/inventory/movements", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const movementData = insertInventoryMovementSchema.parse({
        ...req.body,
        createdBy: req.userId
      });
      const movement = await storage.createInventoryMovement(movementData);
      if (req.body.productId) {
        const product = await storage.getProduct(req.body.productId);
        if (product) {
          let newStock = product.stock;
          if (req.body.type === "in") {
            newStock += req.body.quantity;
          } else if (req.body.type === "out") {
            newStock = Math.max(0, newStock - req.body.quantity);
          } else if (req.body.type === "adjustment") {
            newStock = Math.max(0, req.body.quantity);
          }
          await storage.updateProductStock(req.body.productId, newStock);
        }
      }
      res.json(movement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/store/cart", async (req, res) => {
    const { userId, sessionId } = req.query;
    const items = await storage.getCartItems(userId, sessionId);
    res.json(items);
  });
  app2.post("/api/store/cart", async (req, res) => {
    try {
      const cartData = insertCartItemSchema.parse(req.body);
      const product = await storage.getProduct(cartData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (!product.isActive) {
        return res.status(400).json({ message: "Product is not available" });
      }
      if (product.stock !== null) {
        if (product.stock === 0) {
          return res.status(400).json({ message: "Producto agotado" });
        }
        const existingCartItems2 = await storage.getCartItems(cartData.userId, cartData.sessionId);
        const existingItem2 = existingCartItems2.find((item) => item.productId === cartData.productId);
        const currentCartQuantity = existingItem2 ? existingItem2.quantity : 0;
        const requestedQuantity = cartData.quantity || 1;
        const totalQuantity = currentCartQuantity + requestedQuantity;
        if (totalQuantity > product.stock) {
          return res.status(400).json({
            message: `Stock insuficiente. Disponible: ${product.stock}, En carrito: ${currentCartQuantity}, Solicitado: ${requestedQuantity}`,
            availableStock: product.stock,
            maxCanAdd: Math.max(0, product.stock - currentCartQuantity)
          });
        }
      }
      const existingCartItems = await storage.getCartItems(cartData.userId, cartData.sessionId);
      const existingItem = existingCartItems.find((item) => item.productId === cartData.productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + (cartData.quantity || 1);
        const updatedItem = await storage.updateCartItem(existingItem.id, newQuantity);
        res.json(updatedItem);
      } else {
        const item = await storage.addToCart(cartData);
        res.json(item);
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than 0" });
      }
      const cartItems2 = await storage.getAllCartItems();
      const cartItem = cartItems2.find((item) => item.id === id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const product = await storage.getProduct(cartItem.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (!product.isActive) {
        return res.status(400).json({ message: "Product is not available" });
      }
      if (product.stock !== null && quantity > product.stock) {
        return res.status(400).json({
          message: `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}`,
          availableStock: product.stock,
          maxQuantity: product.stock
        });
      }
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/store/cart/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.removeFromCart(id);
    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed from cart" });
  });
  app2.delete("/api/store/cart", async (req, res) => {
    const { userId, sessionId } = req.query;
    const cleared = await storage.clearCart(userId, sessionId);
    if (!cleared) {
      return res.status(400).json({ message: "Failed to clear cart" });
    }
    res.json({ message: "Cart cleared successfully" });
  });
  app2.get("/api/store/orders", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const orders2 = await storage.getAllOrders();
    res.json(orders2);
  });
  app2.get("/api/store/orders/user/:userId", requireAuth, async (req, res) => {
    const { userId } = req.params;
    const currentUser = await storage.getUser(req.userId);
    if (currentUser?.role === "cliente" && userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const orders2 = await storage.getUserOrders(userId);
    res.json(orders2);
  });
  app2.get("/api/store/orders/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const currentUser = await storage.getUser(req.userId);
    if (currentUser?.role === "cliente" && order.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(order);
  });
  app2.post("/api/store/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
        for (const itemData of req.body.orderItems) {
          await storage.createOrderItem({
            ...itemData,
            orderId: order.id
          });
        }
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/orders/:id", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedOrder = await storage.updateOrder(id, req.body);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/orders/:id/status", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Received order status update request:", {
        orderId: id,
        headers: req.headers,
        body: req.body,
        bodyType: typeof req.body,
        contentType: req.get("Content-Type")
      });
      if (!req.body || typeof req.body !== "object") {
        console.error("Invalid request body:", req.body);
        return res.status(400).json({
          message: "Invalid request body. Expected JSON object.",
          received: typeof req.body,
          body: req.body
        });
      }
      const { status } = req.body;
      if (!status) {
        console.error("Missing status field in request body:", req.body);
        return res.status(400).json({
          message: "Status field is required",
          received: req.body
        });
      }
      const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
      if (!validStatuses.includes(status)) {
        console.error("Invalid status value:", status);
        return res.status(400).json({
          message: "Invalid order status",
          validStatuses,
          received: status
        });
      }
      console.log("Updating order status:", { orderId: id, status });
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        console.error("Order not found:", id);
        return res.status(404).json({ message: "Order not found" });
      }
      console.log("Order status updated successfully:", updatedOrder);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : void 0,
        orderId: req.params.id,
        body: req.body
      });
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });
  app2.get("/api/store/orders/track", async (req, res) => {
    try {
      const { orderNumber, email } = req.query;
      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }
      const orders2 = await storage.getAllOrders();
      const order = orders2.find((o) => o.orderNumber === orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (email && order.shippingAddress) {
        let shippingEmail = null;
        try {
          if (typeof order.shippingAddress === "string") {
            shippingEmail = null;
          } else {
            shippingEmail = order.shippingAddress.email;
          }
        } catch (e) {
        }
      }
      const orderItems2 = await storage.getOrderItems(order.id);
      res.json({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        currency: order.currency || "MXN",
        createdAt: order.createdAt,
        trackingNumber: order.trackingNumber,
        shippingAddress: order.shippingAddress,
        items: orderItems2.map((item) => ({
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      });
    } catch (error) {
      console.error("Error tracking order:", error);
      res.status(500).json({ message: "Error tracking order" });
    }
  });
  app2.get("/api/store/orders/:orderId/items", requireAuth, async (req, res) => {
    const { orderId } = req.params;
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const currentUser = await storage.getUser(req.userId);
    if (currentUser?.role === "cliente" && order.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const items = await storage.getOrderItems(orderId);
    res.json(items);
  });
  app2.get("/api/store/customers", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const customers2 = await storage.getAllCustomers();
    res.json(customers2);
  });
  app2.get("/api/store/customers/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const currentUser = await storage.getUser(req.userId);
    if (currentUser?.role === "cliente" && customer.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(customer);
  });
  app2.post("/api/store/customers", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/customers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const currentUser = await storage.getUser(req.userId);
      if (currentUser?.role === "cliente" && customer.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updatedCustomer = await storage.updateCustomer(id, req.body);
      res.json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/store/customers/:customerId/addresses", requireAuth, async (req, res) => {
    const { customerId } = req.params;
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const currentUser = await storage.getUser(req.userId);
    if (currentUser?.role === "cliente" && customer.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });
  app2.post("/api/store/customers/:customerId/addresses", requireAuth, async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const currentUser = await storage.getUser(req.userId);
      if (currentUser?.role === "cliente" && customer.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const addressData = insertCustomerAddressSchema.parse({
        ...req.body,
        customerId
      });
      const address = await storage.createCustomerAddress(addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/store/orders/:orderId/payments", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    const { orderId } = req.params;
    const payments2 = await storage.getOrderPayments(orderId);
    res.json(payments2);
  });
  app2.post("/api/store/payments", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/store/orders/:orderId/shipments", requireAuth, async (req, res) => {
    const { orderId } = req.params;
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const currentUser = await storage.getUser(req.userId);
    if (currentUser?.role === "cliente" && order.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const shipments2 = await storage.getOrderShipments(orderId);
    res.json(shipments2);
  });
  app2.post("/api/store/shipments", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const shipmentData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(shipmentData);
      res.json(shipment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/store/shipments/:id", requireAuth, requireRole(["admin", "superuser", "staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedShipment = await storage.updateShipment(id, req.body);
      if (!updatedShipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.json(updatedShipment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/store/stats", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalCustomers,
        lowStockProducts
      ] = await Promise.all([
        storage.getAllProducts(),
        storage.getActiveProducts(),
        storage.getAllOrders(),
        storage.getAllOrders().then((orders2) => orders2.filter((o) => o.status === "pending")),
        storage.getAllCustomers(),
        storage.getLowStockProducts()
      ]);
      const validOrders = totalOrders.filter((order) => order.status !== "cancelled");
      const stats = {
        totalProducts: totalProducts.length,
        activeProducts: activeProducts.length,
        totalOrders: totalOrders.length,
        pendingOrders: pendingOrders.length,
        totalCustomers: totalCustomers.length,
        lowStockProducts: lowStockProducts.length,
        totalRevenue: validOrders.reduce((sum2, order) => sum2 + order.total, 0),
        averageOrderValue: validOrders.length > 0 ? validOrders.reduce((sum2, order) => sum2 + order.total, 0) / validOrders.length : 0
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch store statistics" });
    }
  });
  app2.get("/api/customizations/:pageId", requireAuth, async (req, res) => {
    try {
      const { pageId } = req.params;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const customization = await storage.getPageCustomization(pageId, userId);
      res.json(customization || { pageId, elements: {}, styles: {} });
    } catch (error) {
      console.error("Error fetching page customization:", error);
      res.status(500).json({ message: "Error fetching page customization" });
    }
  });
  app2.put("/api/customizations/:pageId", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { pageId } = req.params;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { elements, styles } = req.body;
      const existing = await storage.getPageCustomization(pageId, userId);
      let customization;
      if (existing) {
        customization = await storage.updatePageCustomization(pageId, userId, {
          elements,
          styles
        });
      } else {
        customization = await storage.createPageCustomization({
          pageId,
          userId,
          elements,
          styles
        });
      }
      res.json(customization);
    } catch (error) {
      console.error("Error saving page customization:", error);
      res.status(500).json({ message: "Error saving page customization" });
    }
  });
  app2.delete("/api/customizations/:pageId", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { pageId } = req.params;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const success = await storage.deletePageCustomization(pageId, userId);
      if (success) {
        res.json({ message: "Page customization deleted successfully" });
      } else {
        res.status(404).json({ message: "Page customization not found" });
      }
    } catch (error) {
      console.error("Error deleting page customization:", error);
      res.status(500).json({ message: "Error deleting page customization" });
    }
  });
  app2.get("/api/visual-customizations/:pageId", async (req, res) => {
    try {
      const customizations = await storage.getVisualCustomizations(req.params.pageId);
      res.json(customizations);
    } catch (error) {
      console.error("Error fetching visual customizations:", error);
      res.status(500).json({ message: "Error fetching visual customizations" });
    }
  });
  app2.post("/api/visual-customizations", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const customizationData = {
        ...req.body,
        updatedBy: userId
      };
      const customization = await storage.saveVisualCustomization(customizationData);
      res.json(customization);
    } catch (error) {
      console.error("Error saving visual customization:", error);
      res.status(500).json({ message: "Error saving visual customization" });
    }
  });
  app2.put("/api/visual-customizations/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const updates = {
        ...req.body,
        updatedBy: userId
      };
      const customization = await storage.updateVisualCustomization(req.params.id, updates);
      if (!customization) {
        return res.status(404).json({ message: "Visual customization not found" });
      }
      res.json(customization);
    } catch (error) {
      console.error("Error updating visual customization:", error);
      res.status(500).json({ message: "Error updating visual customization" });
    }
  });
  app2.delete("/api/visual-customizations/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteVisualCustomization(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Visual customization not found" });
      }
      res.json({ message: "Visual customization deleted successfully" });
    } catch (error) {
      console.error("Error deleting visual customization:", error);
      res.status(500).json({ message: "Error deleting visual customization" });
    }
  });
  app2.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService2 = new ObjectStorageService();
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const baseURL = `${protocol}://${host}`;
      const uploadURL = await objectStorageService2.getObjectEntityUploadURL(baseURL);
      console.log("Generated absolute upload URL:", uploadURL);
      res.json({
        uploadURL,
        method: "PUT"
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService2 = new ObjectStorageService();
    try {
      const file = await objectStorageService2.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService2.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService2 = new ObjectStorageService();
    try {
      const objectPath = req.params.objectPath;
      console.log(`\u{1F5BC}\uFE0F Serving public object: ${objectPath}`);
      console.log(`\u{1F4C1} Current working directory: ${process.cwd()}`);
      console.log(`\u{1F4C2} Looking for file in uploads directory...`);
      const fs5 = __require("fs");
      const path6 = __require("path");
      const uploadsDir2 = path6.join(process.cwd(), "uploads");
      if (fs5.existsSync(uploadsDir2)) {
        const files = fs5.readdirSync(uploadsDir2);
        console.log(`\u{1F4CB} Files in uploads (${files.length}):`, files.slice(0, 10).join(", "));
        const targetFile = path6.join(uploadsDir2, objectPath);
        console.log(`\u{1F3AF} Target file path: ${targetFile}`);
        console.log(`\u2705 File exists: ${fs5.existsSync(targetFile)}`);
      } else {
        console.log(`\u274C Uploads directory does not exist: ${uploadsDir2}`);
      }
      await objectStorageService2.downloadObject(objectPath, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({
          error: "Object not found",
          path: req.params.objectPath,
          message: "The requested image could not be found"
        });
        return;
      }
      return res.sendStatus(500);
    }
  });
  app2.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService2 = new ObjectStorageService();
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const baseURL = `${protocol}://${host}`;
      const uploadURL = await objectStorageService2.getObjectEntityUploadURL(baseURL);
      console.log("Generated absolute upload URL:", uploadURL);
      res.json({
        uploadURL,
        method: "PUT"
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
  app2.post("/api/objects/direct-upload/upload", requireAuth, async (req, res) => {
    try {
      const objectId = crypto.randomUUID();
      const objectStorageService2 = new ObjectStorageService();
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          let fileName = req.headers["x-original-filename"] || req.headers["x-filename"] || `upload-${Date.now()}`;
          fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
          console.log(`Processing upload: ${objectId}, fileName: ${fileName}, size: ${fileBuffer.length} bytes`);
          const objectName = await objectStorageService2.handleDirectUpload(objectId, fileBuffer, fileName);
          const protocol = req.protocol || "http";
          const host = req.get("host") || "localhost:5000";
          const servingURL = `${protocol}://${host}/objects/${objectName}`;
          const relativeURL = `/objects/${objectName}`;
          const responseData = {
            success: true,
            objectName,
            url: relativeURL,
            // Serving URL for images
            uploadURL: servingURL,
            // Full serving URL for compatibility
            location: relativeURL,
            // Relative serving path
            relativePath: relativeURL,
            // Relative path for internal use
            name: objectName,
            type: req.headers["content-type"] || "application/octet-stream",
            size: fileBuffer.length
          };
          console.log("\u2705 Upload successful, returning serving URLs:", responseData);
          res.setHeader("Content-Type", "application/json");
          res.status(200).json(responseData);
        } catch (error) {
          console.error("Error in upload processing:", error);
          res.status(500).json({
            success: false,
            error: "Upload failed",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });
      req.on("error", (error) => {
        console.error("Error receiving upload data:", error);
        res.status(500).json({
          success: false,
          error: "Failed to receive upload data",
          message: error.message
        });
      });
    } catch (error) {
      console.error("Error setting up upload:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/objects/direct-upload/:objectId", async (req, res) => {
    try {
      const { objectId } = req.params;
      const objectStorageService2 = new ObjectStorageService();
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          let fileName = req.headers["x-original-filename"] || req.headers["x-filename"] || `upload-${Date.now()}`;
          fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
          console.log(`Processing direct upload: ${objectId}, fileName: ${fileName}, size: ${fileBuffer.length} bytes`);
          const objectName = await objectStorageService2.handleDirectUpload(objectId, fileBuffer, fileName);
          const protocol = req.protocol || "http";
          const host = req.get("host") || "localhost:5000";
          const servingURL = `${protocol}://${host}/objects/${objectName}`;
          const relativeURL = `/objects/${objectName}`;
          try {
            new URL(servingURL);
            console.log(`Valid serving URL created: ${servingURL}`);
          } catch (urlError) {
            console.error(`Invalid URL constructed: ${servingURL}`, urlError);
            throw new Error(`Failed to create valid URL: ${servingURL}`);
          }
          const responseData = {
            success: true,
            objectName,
            url: relativeURL,
            // Serving URL for images
            uploadURL: servingURL,
            // Full serving URL for compatibility
            location: relativeURL,
            // Relative serving path
            relativePath: relativeURL,
            // Relative path for internal use
            name: objectName,
            type: req.headers["content-type"] || "application/octet-stream",
            size: fileBuffer.length
          };
          console.log("\u2705 Upload successful, returning serving URLs:", responseData);
          console.log("\u2705 Primary serving URL:", servingURL);
          console.log("\u2705 Relative serving URL:", relativeURL);
          res.setHeader("Content-Type", "application/json");
          res.status(200).json(responseData);
        } catch (error) {
          console.error("Error in direct upload processing:", error);
          res.status(500).json({
            success: false,
            error: "Upload failed",
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });
      req.on("error", (error) => {
        console.error("Error receiving upload data:", error);
        res.status(500).json({
          success: false,
          error: "Failed to receive upload data",
          message: error.message
        });
      });
    } catch (error) {
      console.error("Error setting up direct upload:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/store/products/:id/image", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { imageURL } = req.body;
      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }
      const objectStorageService2 = new ObjectStorageService();
      const normalizedPath = objectStorageService2.normalizeObjectEntityPath(imageURL);
      const updatedProduct = await storage.updateProduct(id, { images: [normalizedPath] });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({
        message: "Product image updated successfully",
        product: updatedProduct,
        imagePath: normalizedPath
      });
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/products/:id/image", async (req, res) => {
    try {
      const { imageURL } = req.body;
      const productId = req.params.id;
      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const objectStorageService2 = new ObjectStorageService();
      const normalizedPath = objectStorageService2.normalizeObjectEntityPath(imageURL);
      const updatedProduct = await storage.updateProduct(productId, {
        ...product,
        images: [normalizedPath]
      });
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/payment-config", requireAuth, requireRole(["superuser", "admin"]), async (req, res) => {
    try {
      const config = await storage.getPaymentConfig();
      if (config && config.stripeSecretKey) {
        const sanitizedConfig = {
          ...config,
          stripeSecretKey: config.stripeSecretKey ? "***" : ""
        };
        res.json(sanitizedConfig);
      } else {
        res.json(config);
      }
    } catch (error) {
      console.error("Error fetching payment config:", error);
      res.status(500).json({ message: "Failed to fetch payment configuration" });
    }
  });
  app2.put("/api/payment-config", requireAuth, requireRole(["superuser", "admin"]), async (req, res) => {
    try {
      const { stripePublicKey, stripeSecretKey, isActive } = req.body;
      const configData = {
        stripePublicKey,
        stripeSecretKey,
        isActive: Boolean(isActive),
        updatedBy: req.userId
      };
      const updatedConfig = await storage.updatePaymentConfig(configData);
      const sanitizedConfig = {
        ...updatedConfig,
        stripeSecretKey: updatedConfig.stripeSecretKey ? "***" : ""
      };
      res.json(sanitizedConfig);
    } catch (error) {
      console.error("Error updating payment config:", error);
      res.status(500).json({ message: "Failed to update payment configuration" });
    }
  });
  app2.get("/api/payment-config/public", async (req, res) => {
    try {
      const config = await storage.getPaymentConfig();
      res.json({
        stripePublicKey: config?.stripePublicKey || null,
        isActive: config?.isActive || false
      });
    } catch (error) {
      console.error("Error fetching public payment config:", error);
      res.status(500).json({ message: "Failed to fetch payment configuration" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    console.log("Received payment intent request:", req.body);
    try {
      const { amount, currency = "mxn", metadata = {}, cartItems: cartItems2 = [] } = req.body;
      if (cartItems2.length > 0) {
        let calculatedAmount = 0;
        for (const item of cartItems2) {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            return res.status(400).json({
              error: `Producto no encontrado: ${item.productId}`
            });
          }
          if (!product.isActive) {
            return res.status(400).json({
              error: `Producto "${product.name}" no est\xE1 disponible`
            });
          }
          if (product.stock !== null && product.stock < item.quantity) {
            return res.status(400).json({
              error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
            });
          }
          calculatedAmount += product.price / 100 * item.quantity;
        }
        if (calculatedAmount > 0) {
          req.body.amount = calculatedAmount;
        }
      }
      if (!req.body.amount || req.body.amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      const minimumAmounts = {
        "usd": 0.5,
        "mxn": 10,
        "eur": 0.5,
        "cad": 0.5
      };
      const minAmount = minimumAmounts[currency.toLowerCase()] || 0.5;
      if (amount < minAmount) {
        return res.status(400).json({
          error: `Minimum amount is ${minAmount.toLocaleString("en-US", {
            style: "currency",
            currency: currency.toUpperCase()
          })}`
        });
      }
      const paymentConfig2 = await storage.getPaymentConfig();
      if (!paymentConfig2?.isActive || !paymentConfig2.stripeSecretKey) {
        return res.status(400).json({ error: "Payment processing not configured" });
      }
      const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
        apiVersion: "2025-07-30.basil"
      });
      let finalAmount = req.body.amount;
      if (currency.toLowerCase() === "mxn" && finalAmount < 10) {
        finalAmount = 10;
      }
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(finalAmount * 100),
        // Convert to cents
        currency,
        metadata: {
          ...metadata,
          originalAmount: req.body.amount.toString(),
          adjustedAmount: finalAmount.toString(),
          cartItems: JSON.stringify(cartItems2)
        },
        automatic_payment_methods: {
          enabled: true
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        error: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.post("/api/store/checkout", async (req, res) => {
    console.log("Received checkout request:", req.body);
    try {
      const { paymentIntentId, customerInfo, orderItems: orderItems2, shippingAddress } = req.body;
      const paymentConfig2 = await storage.getPaymentConfig();
      if (!paymentConfig2?.isActive || !paymentConfig2.stripeSecretKey) {
        return res.status(400).json({ error: "Payment processing not configured" });
      }
      const stripeClient = new Stripe(paymentConfig2.stripeSecretKey, {
        apiVersion: "2025-07-30.basil"
      });
      const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not completed" });
      }
      let total = 0;
      if (!orderItems2 || orderItems2.length === 0) {
        return res.status(400).json({ error: "Order items are required" });
      }
      for (const item of orderItems2) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({
            error: `Product not found: ${item.productId}`
          });
        }
        if (!product.isActive) {
          return res.status(400).json({
            error: `Product "${product.name}" is not available`
          });
        }
        if (product.stock !== null && product.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }
        total += product.price * item.quantity;
      }
      let customer = null;
      if (customerInfo && (customerInfo.email || customerInfo.firstName)) {
        try {
          const existingCustomers = await storage.getAllCustomers();
          customer = existingCustomers.find(
            (c) => c.firstName === customerInfo.firstName && c.lastName === customerInfo.lastName
          );
          if (!customer) {
            customer = await storage.createCustomer({
              firstName: customerInfo.firstName || "",
              lastName: customerInfo.lastName || "",
              phone: customerInfo.phone || "",
              userId: null
              // Anonymous customer
            });
          }
        } catch (customerError) {
          console.error("Error creating customer:", customerError);
        }
      }
      const order = await storage.createOrder({
        userId: customer?.userId || null,
        status: "confirmed",
        total,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        paymentMethod: "stripe",
        paymentStatus: "paid",
        orderNumber: `ORD-${Date.now()}`,
        subtotal: total,
        items: orderItems2
      });
      for (const item of orderItems2) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity,
            productName: product.name
          });
          if (product.stock !== null) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await storage.updateProductStock(item.productId, newStock);
            await storage.createInventoryMovement({
              productId: item.productId,
              type: "out",
              quantity: item.quantity,
              reason: "sale",
              notes: `Sale - Order ${order.orderNumber}`,
              createdBy: null
              // System generated
            });
          }
        }
      }
      res.json({
        success: true,
        order,
        message: "Order created successfully"
      });
    } catch (error) {
      console.error("Error processing checkout:", error);
      res.status(500).json({
        error: "Error processing checkout: " + error.message
      });
    }
  });
  app2.get("/api/store/orders", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  app2.get("/api/store/orders/:id/items", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      const orderItems2 = await storage.getOrderItems(id);
      res.json(orderItems2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order items" });
    }
  });
  app2.put("/api/store/orders/:id", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const updateData = req.body;
      if (updateData.status) {
        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({ message: "Invalid order status" });
        }
      }
      const updatedOrder = await storage.updateOrder(id, updateData);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Error updating order: " + error.message });
    }
  });
  app2.get("/api/store/customers", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const customers2 = await storage.getAllCustomers();
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers" });
    }
  });
  app2.get("/api/stripe/public-key", (req, res) => {
    res.json({
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY
    });
  });
  app2.get("/api/navbar-config", async (req, res) => {
    try {
      const siteConfig2 = await storage.getSiteConfig();
      const navbarConfig2 = siteConfig2?.config?.navbar || {};
      res.json(navbarConfig2);
    } catch (error) {
      console.error("Error getting navbar config:", error);
      res.status(500).json({ message: "Error getting navbar configuration" });
    }
  });
  app2.get("/api/email/config", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const config = await storage.getEmailConfig();
      if (!config) {
        return res.json({});
      }
      const { smtpPass, ...safeConfig } = config;
      res.json(safeConfig);
    } catch (error) {
      console.error("Error getting email config:", error);
      res.status(500).json({ message: "Error getting email configuration" });
    }
  });
  app2.put("/api/email/config", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { fromEmail, replyToEmail, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, isActive } = req.body;
      const configData = {
        fromEmail,
        replyToEmail,
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpSecure: smtpSecure || false,
        smtpUser,
        smtpPass,
        isActive: isActive || false
      };
      const updatedConfig = await storage.updateEmailConfig(configData);
      const { resetTransporter: resetTransporter2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      resetTransporter2();
      const { smtpPass: _, ...safeConfig } = updatedConfig;
      res.json(safeConfig);
    } catch (error) {
      console.error("Error updating email config:", error);
      res.status(500).json({ message: "Error updating email configuration" });
    }
  });
  app2.post("/api/email/test-connection", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const configData = await storage.getEmailConfig();
      if (!configData || !configData.isActive) {
        return res.status(400).json({
          success: false,
          message: "No active email configuration found"
        });
      }
      const nodemailer2 = (await import("nodemailer")).default;
      const transporter2 = nodemailer2.createTransport({
        host: configData.smtpHost,
        port: configData.smtpPort || 587,
        secure: configData.smtpSecure || false,
        auth: {
          user: configData.smtpUser,
          pass: configData.smtpPass
        }
      });
      await transporter2.verify();
      await storage.updateEmailTestStatus("success");
      res.json({ success: true, message: "Connection successful" });
    } catch (error) {
      console.error("Email connection test failed:", error);
      await storage.updateEmailTestStatus("failed");
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed"
      });
    }
  });
  app2.post("/api/email/send-test", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { to, subject, content } = req.body;
      const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const success = await sendEmail2({
        to,
        subject,
        text: content,
        html: `<p>${content}</p>`
      });
      if (success) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send test email"
      });
    }
  });
  app2.post("/api/objects/normalize-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      const objectStorageService2 = new ObjectStorageService();
      const normalizedUrl = objectStorageService2.normalizeObjectEntityPath(url);
      res.json({ normalizedUrl });
    } catch (error) {
      console.error("Error normalizing URL:", error);
      res.status(500).json({ error: "Failed to normalize URL" });
    }
  });
  app2.get("/api/inventory/movements", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { productId } = req.query;
      const movements = await storage.getInventoryMovements(productId);
      res.json(movements);
    } catch (error) {
      console.error("Error fetching inventory movements:", error);
      res.status(500).json({ message: "Error fetching inventory movements" });
    }
  });
  app2.post("/api/inventory/movements", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const { type, productId, quantity, reason, notes } = req.body;
      const userId = req.user.id;
      const validTypes = ["in", "out", "adjustment"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid movement type" });
      }
      if (!productId || quantity === void 0 || quantity === 0) {
        return res.status(400).json({ message: "Product ID and quantity are required" });
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (type === "out" && product.stock < Math.abs(quantity)) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${Math.abs(quantity)}`
        });
      }
      let newStock = product.stock;
      if (type === "in") {
        newStock += Math.abs(quantity);
      } else if (type === "out") {
        newStock -= Math.abs(quantity);
      } else if (type === "adjustment") {
        newStock = Math.abs(quantity);
      }
      if (newStock < 0) {
        return res.status(400).json({ message: "Stock cannot be negative" });
      }
      const movementData = {
        productId,
        type,
        quantity: Math.abs(quantity),
        reason: reason || (type === "in" ? "restock" : type === "out" ? "sale" : "adjustment"),
        notes: notes || null,
        createdBy: userId
      };
      const movement = await storage.createInventoryMovement(movementData);
      await storage.updateProductStock(productId, newStock);
      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating inventory movement:", error);
      res.status(500).json({ message: "Error creating inventory movement" });
    }
  });
  app2.get("/api/inventory/low-stock", requireAuth, requireRole(["admin", "superuser"]), async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Error fetching low stock products" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/store-setup.ts
async function initializeStoreData() {
  try {
    const existingCategories = await storage.getAllProductCategories();
    if (existingCategories.length > 0) {
      console.log("Store data already initialized");
      return;
    }
    const categories = [
      {
        name: "Electr\xF3nicos",
        description: "Productos electr\xF3nicos y tecnolog\xEDa",
        isActive: true
      },
      {
        name: "Ropa",
        description: "Ropa y accesorios de moda",
        isActive: true
      },
      {
        name: "Hogar",
        description: "Art\xEDculos para el hogar y decoraci\xF3n",
        isActive: true
      },
      {
        name: "Deportes",
        description: "Equipos y ropa deportiva",
        isActive: true
      }
    ];
    const createdCategories = [];
    for (const category of categories) {
      const created = await storage.createProductCategory(category);
      createdCategories.push(created);
    }
    const products2 = [
      {
        name: "iPhone 15 Pro",
        description: "El \xFAltimo modelo de iPhone con c\xE1mara profesional y chip A17 Pro",
        shortDescription: "Smartphone Apple de \xFAltima generaci\xF3n",
        price: 99900,
        // $999.00 in cents
        comparePrice: 109900,
        // $1099.00 in cents
        categoryId: createdCategories[0].id,
        // Electronics
        stock: 50,
        lowStockThreshold: 10,
        sku: "APL-IP15P-128",
        weight: 187,
        dimensions: { length: 146.6, width: 70.6, height: 8.25 },
        isActive: true,
        isFeatured: true,
        images: [
          "/api/placeholder/400/400",
          "/api/placeholder/400/400",
          "/api/placeholder/400/400"
        ],
        variants: [],
        tags: ["smartphone", "apple", "5g", "pro"],
        seoTitle: "iPhone 15 Pro - Comprar Online",
        seoDescription: "Compra el nuevo iPhone 15 Pro con env\xEDo gratis. El mejor precio garantizado."
      },
      {
        name: "Samsung Galaxy S24",
        description: "Smartphone Samsung Galaxy S24 con c\xE1mara AI y pantalla Dynamic AMOLED",
        shortDescription: "Smartphone Samsung de gama alta",
        price: 79900,
        // $799.00 in cents
        comparePrice: 89900,
        categoryId: createdCategories[0].id,
        stock: 30,
        lowStockThreshold: 5,
        sku: "SAM-GS24-256",
        weight: 167,
        dimensions: { length: 147, width: 70.6, height: 7.6 },
        isActive: true,
        isFeatured: true,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["smartphone", "samsung", "android", "ai"],
        seoTitle: "Samsung Galaxy S24 - Comprar Online",
        seoDescription: "Nuevo Samsung Galaxy S24 con AI integrada y c\xE1mara profesional."
      },
      {
        name: "Camiseta Nike Dri-FIT",
        description: "Camiseta deportiva Nike con tecnolog\xEDa Dri-FIT para mantenerte seco",
        shortDescription: "Camiseta deportiva transpirable",
        price: 2999,
        // $29.99 in cents
        comparePrice: 3999,
        categoryId: createdCategories[3].id,
        // Sports
        stock: 100,
        lowStockThreshold: 20,
        sku: "NIKE-DFIT-001",
        weight: 150,
        dimensions: { length: 70, width: 50, height: 2 },
        isActive: true,
        isFeatured: false,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["nike", "deportiva", "dri-fit", "camiseta"],
        seoTitle: "Camiseta Nike Dri-FIT - Ropa Deportiva",
        seoDescription: "Camiseta Nike Dri-FIT original. Perfecta para entrenar y hacer deporte."
      },
      {
        name: "Sof\xE1 Seccional Moderno",
        description: "Sof\xE1 seccional de 3 plazas con tela premium y dise\xF1o moderno",
        shortDescription: "Sof\xE1 c\xF3modo y elegante para sala",
        price: 89900,
        // $899.00 in cents
        comparePrice: 109900,
        categoryId: createdCategories[2].id,
        // Home
        stock: 8,
        lowStockThreshold: 2,
        sku: "SOFA-SEC-GRY",
        weight: 45e3,
        // 45kg
        dimensions: { length: 220, width: 90, height: 85 },
        isActive: true,
        isFeatured: true,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["sof\xE1", "moderno", "sala", "mueble"],
        seoTitle: "Sof\xE1 Seccional Moderno - Muebles de Sala",
        seoDescription: "Sof\xE1 seccional moderno de alta calidad. Perfecto para tu sala de estar."
      },
      {
        name: "Jeans Levi's 501",
        description: "Jeans cl\xE1sicos Levi's 501 de corte recto, 100% algod\xF3n",
        shortDescription: "Jeans cl\xE1sicos de alta calidad",
        price: 6999,
        // $69.99 in cents
        comparePrice: 7999,
        categoryId: createdCategories[1].id,
        // Clothing
        stock: 45,
        lowStockThreshold: 10,
        sku: "LEVI-501-IND",
        weight: 600,
        dimensions: { length: 110, width: 80, height: 3 },
        isActive: true,
        isFeatured: false,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["jeans", "levis", "501", "cl\xE1sico"],
        seoTitle: "Jeans Levi's 501 Original - Ropa Casual",
        seoDescription: "Jeans Levi's 501 originales. El cl\xE1sico que nunca pasa de moda."
      }
    ];
    for (const product of products2) {
      await storage.createProduct(product);
    }
    const sampleOrders = [
      {
        userId: null,
        guestEmail: "cliente@ejemplo.com",
        items: [
          {
            productId: "phone1",
            productName: "iPhone 15 Pro",
            quantity: 1,
            unitPrice: 99900,
            totalPrice: 99900
          }
        ],
        subtotal: 99900,
        tax: 7992,
        // 8% tax
        shipping: 0,
        discount: 0,
        total: 107892,
        currency: "USD",
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "credit_card",
        shippingAddress: {
          firstName: "Juan",
          lastName: "P\xE9rez",
          address1: "123 Calle Principal",
          city: "Ciudad de M\xE9xico",
          state: "CDMX",
          zipCode: "12345",
          country: "MX"
        }
      },
      {
        userId: null,
        guestEmail: "maria@ejemplo.com",
        items: [
          {
            productId: "sofa1",
            productName: "Sof\xE1 Seccional Moderno",
            quantity: 1,
            unitPrice: 89900,
            totalPrice: 89900
          }
        ],
        subtotal: 89900,
        tax: 7192,
        shipping: 5e3,
        discount: 0,
        total: 102092,
        currency: "USD",
        status: "processing",
        paymentStatus: "paid",
        paymentMethod: "credit_card",
        shippingAddress: {
          firstName: "Mar\xEDa",
          lastName: "Garc\xEDa",
          address1: "456 Avenida Central",
          city: "Guadalajara",
          state: "Jalisco",
          zipCode: "44100",
          country: "MX"
        }
      }
    ];
    for (const order of sampleOrders) {
      await storage.createOrder({
        ...order,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
    console.log("Store data initialized successfully");
  } catch (error) {
    console.error("Error initializing store data:", error);
  }
}

// server/site-config-setup.ts
async function initializeSiteConfig() {
  try {
    const existingConfig = await storage.getSiteConfig();
    if (existingConfig) {
      console.log("Site configuration already initialized");
      return;
    }
    const defaultConfig = {
      modules: {
        testimonials: {
          enabled: true,
          showOnHomepage: true,
          requireApproval: true,
          allowRatings: true,
          maxRating: 5
        },
        faqs: {
          enabled: true,
          showCategories: true,
          allowVoting: true,
          requireApproval: false
        },
        contact: {
          enabled: true,
          requireAuth: false,
          autoReply: false,
          notificationEmail: "admin@example.com"
        },
        blog: {
          enabled: true,
          postsPerPage: 10,
          allowComments: false,
          requireApproval: true,
          showAuthor: true,
          showCategories: true
        },
        store: {
          enabled: true,
          currency: "USD",
          taxRate: 0.0825,
          // 8.25%
          shippingEnabled: true,
          inventoryTracking: true,
          guestCheckout: true,
          requireRegistration: false
        },
        reservations: {
          enabled: true,
          requireAuth: false,
          autoConfirm: false,
          timeSlots: [
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
            "5:00 PM"
          ],
          maxAdvanceDays: 30
        },
        sections: {
          enabled: true,
          allowDynamicContent: true,
          showInNavigation: true
        }
      },
      appearance: {
        siteName: "Mi Sitio Web",
        tagline: "Bienvenido a nuestro sitio",
        logo: "",
        favicon: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        fontFamily: "Inter, sans-serif",
        darkMode: false
      },
      seo: {
        metaTitle: "Mi Sitio Web - P\xE1gina Principal",
        metaDescription: "Descripci\xF3n de mi sitio web con todos los servicios disponibles",
        keywords: ["sitio web", "servicios", "empresa"],
        ogImage: "",
        googleAnalytics: "",
        googleTagManager: ""
      },
      social: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        whatsapp: "525512345678"
      },
      business: {
        name: "Mi Empresa",
        description: "Descripci\xF3n de mi empresa",
        phone: "",
        email: "",
        address: "",
        hours: "Lunes a Viernes: 9:00 AM - 6:00 PM",
        timezone: "America/Mexico_City"
      }
    };
    const config = await storage.createSiteConfig({
      config: defaultConfig,
      version: "1.0.0"
    });
    console.log("Site configuration initialized successfully");
    return config;
  } catch (error) {
    console.error("Error initializing site configuration:", error);
    throw error;
  }
}

// server/objectStorageRouter.ts
import express3 from "express";
import fs3 from "fs";
import path4 from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import multer from "multer";
var router = express3.Router();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB
});
router.get("/api/objects/debug", (req, res) => {
  try {
    const files = fs3.readdirSync(uploadsDir);
    const fileDetails = files.map((file) => {
      const filePath = path4.join(uploadsDir, file);
      const stats = fs3.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime,
        url: `/objects/${file}`,
        exists: fs3.existsSync(filePath)
      };
    });
    res.json({
      uploadsDir,
      totalFiles: files.length,
      files: fileDetails.slice(0, 20),
      // Show only first 20 files
      recentFiles: fileDetails.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error reading uploads directory",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var uploadsDir = path4.join(process.cwd(), "uploads");
var publicUploadsDir = path4.join(process.cwd(), "client", "public", "imgs", "uploads");
if (!fs3.existsSync(uploadsDir)) {
  fs3.mkdirSync(uploadsDir, { recursive: true });
  console.log("\u2705 Created uploads directory:", uploadsDir);
}
if (!fs3.existsSync(publicUploadsDir)) {
  fs3.mkdirSync(publicUploadsDir, { recursive: true });
  console.log("\u2705 Created public uploads directory:", publicUploadsDir);
}
router.use(express3.json());
router.post("/api/objects/upload", (req, res) => {
  try {
    const { filename } = req.body || {};
    const ext = filename ? path4.extname(String(filename)).toLowerCase() : "";
    const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
    let finalExt = ext;
    if (!allowedExts.includes(ext)) {
      finalExt = ".jpg";
    }
    const objectName = `${uuidv4()}-${Date.now()}${finalExt}`;
    const relativeUrl = `/objects/${objectName}`;
    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("host");
    const secureProtocol = protocol === "https" || host?.includes("replit.dev") ? "https" : protocol;
    const uploadURL = `${secureProtocol}://${host}${relativeUrl}`;
    console.log(`\u2705 Generated upload params: objectName=${objectName}, uploadURL=${uploadURL}`);
    return res.json({
      success: true,
      objectName,
      url: relativeUrl,
      uploadURL,
      location: relativeUrl
    });
  } catch (err) {
    console.error("Error generating upload params:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});
router.put("/objects/:name", async (req, res) => {
  const name = req.params.name;
  if (name.includes("..") || path4.isAbsolute(name)) {
    return res.status(400).json({ success: false, error: "Invalid name" });
  }
  try {
    let finalName = name;
    if (!path4.extname(name)) {
      const contentType = req.headers["content-type"] || "";
      let extension = "";
      if (contentType.includes("image/jpeg") || contentType.includes("image/jpg")) {
        extension = ".jpg";
      } else if (contentType.includes("image/png")) {
        extension = ".png";
      } else if (contentType.includes("image/gif")) {
        extension = ".gif";
      } else if (contentType.includes("image/webp")) {
        extension = ".webp";
      } else if (contentType.includes("image/avif")) {
        extension = ".avif";
      } else {
        extension = ".jpg";
      }
      finalName = `${name}${extension}`;
    }
    const tempPath = path4.join(uploadsDir, `temp-${finalName}`);
    const finalPath = path4.join(uploadsDir, finalName);
    console.log(`\u{1F4C1} Receiving PUT for object: ${name} \u2192 saving as: ${finalName}`);
    const writeStream = fs3.createWriteStream(tempPath);
    req.pipe(writeStream);
    req.on("end", async () => {
      try {
        const imageInfo = await sharp(tempPath).metadata();
        console.log(`\u{1F4F8} Image metadata:`, {
          format: imageInfo.format,
          width: imageInfo.width,
          height: imageInfo.height,
          size: imageInfo.size
        });
        let processedBuffer;
        if (imageInfo.width && imageInfo.width > 1920) {
          processedBuffer = await sharp(tempPath).resize(1920, 1920, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
        } else {
          if (imageInfo.format === "jpeg" || imageInfo.format === "jpg") {
            processedBuffer = await sharp(tempPath).jpeg({ quality: 85 }).toBuffer();
          } else if (imageInfo.format === "png") {
            processedBuffer = await sharp(tempPath).png({ compressionLevel: 6 }).toBuffer();
          } else {
            processedBuffer = fs3.readFileSync(tempPath);
          }
        }
        fs3.writeFileSync(finalPath, processedBuffer);
        const publicPath = path4.join(publicUploadsDir, finalName);
        fs3.writeFileSync(publicPath, processedBuffer);
        fs3.unlinkSync(tempPath);
        console.log(`\u2705 Image processed and saved in both locations:`);
        console.log(`   \u{1F4C1} Server: ${finalName}, size: ${processedBuffer.length} bytes`);
        console.log(`   \u{1F4C1} Public: client/public/imgs/uploads/${finalName}`);
        return res.status(200).json({
          success: true,
          objectName: finalName,
          url: `/objects/${finalName}`,
          location: `/objects/${finalName}`
        });
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        try {
          fs3.renameSync(tempPath, finalPath);
          const publicPath = path4.join(publicUploadsDir, finalName);
          fs3.copyFileSync(finalPath, publicPath);
          console.log(`\u26A0\uFE0F Image processing failed, saved original in both locations: ${finalName}`);
          return res.status(200).json({
            success: true,
            objectName: finalName,
            url: `/objects/${finalName}`,
            location: `/objects/${finalName}`
          });
        } catch (fallbackError) {
          console.error("Fallback save failed:", fallbackError);
          return res.status(500).json({ success: false, error: "Failed to save image" });
        }
      }
    });
    req.on("error", (err) => {
      console.error("PUT request error:", err);
      if (fs3.existsSync(tempPath)) {
        fs3.unlinkSync(tempPath);
      }
      return res.status(500).json({ success: false, error: "Upload failed" });
    });
    writeStream.on("error", (err) => {
      console.error("Write stream error:", err);
      return res.status(500).json({ success: false, error: "Write failed" });
    });
  } catch (error) {
    console.error("PUT handler error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});
router.post("/api/objects/direct-upload/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("\u{1F4F8} Direct upload endpoint called");
    console.log("\u{1F4CB} Headers:", req.headers);
    console.log("\u{1F4CB} Content-Type:", req.headers["content-type"]);
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
      if (!req.file) {
        console.error("\u274C No file received");
        return res.status(400).json({ success: false, error: "No file received" });
      }
      try {
        const fileBuffer = req.file.buffer;
        const originalFilename = req.file.originalname || "upload.jpg";
        console.log(`\u{1F4C1} Received file: ${fileBuffer.length} bytes`);
        console.log(`\u{1F4DD} Original filename: ${originalFilename}`);
        console.log(`\u{1F50D} File header: ${fileBuffer.slice(0, 16).toString("hex")}`);
        const ext = path4.extname(String(originalFilename)).toLowerCase() || ".jpg";
        const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
        const filePath = path4.join(uploadsDir, uniqueName);
        let processedBuffer = fileBuffer;
        if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"].includes(ext)) {
          try {
            const imageInfo = await sharp(fileBuffer).metadata();
            console.log(`\u{1F4F8} Image metadata:`, {
              format: imageInfo.format,
              width: imageInfo.width,
              height: imageInfo.height,
              size: imageInfo.size
            });
            if (imageInfo.format) {
              if (imageInfo.width && imageInfo.width > 1920) {
                if (imageInfo.format === "jpeg" || imageInfo.format === "jpg") {
                  processedBuffer = await sharp(fileBuffer).resize(1920, 1920, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
                } else if (imageInfo.format === "png") {
                  processedBuffer = await sharp(fileBuffer).resize(1920, 1920, { fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 6 }).toBuffer();
                } else {
                  processedBuffer = await sharp(fileBuffer).resize(1920, 1920, { fit: "inside", withoutEnlargement: true }).toBuffer();
                }
              } else {
                if (imageInfo.format === "jpeg" || imageInfo.format === "jpg") {
                  processedBuffer = await sharp(fileBuffer).jpeg({ quality: 85 }).toBuffer();
                } else if (imageInfo.format === "png") {
                  processedBuffer = await sharp(fileBuffer).png({ compressionLevel: 6 }).toBuffer();
                } else {
                  processedBuffer = fileBuffer;
                }
              }
              console.log(`\u2705 Image processed successfully, size: ${processedBuffer.length} bytes`);
            }
          } catch (sharpError) {
            console.log("\u26A0\uFE0F Sharp processing failed, using original:", sharpError.message);
            processedBuffer = fileBuffer;
          }
        }
        fs3.writeFileSync(filePath, processedBuffer);
        const publicFilePath = path4.join(publicUploadsDir, uniqueName);
        fs3.writeFileSync(publicFilePath, processedBuffer);
        console.log(`\u2705 File saved in both locations:`);
        console.log(`   \u{1F4C1} Server: ${uniqueName}, size: ${processedBuffer.length} bytes`);
        console.log(`   \u{1F4C1} Public: client/public/imgs/uploads/${uniqueName}`);
        const protocol = req.get("x-forwarded-proto") || req.protocol;
        const host = req.get("host");
        const secureProtocol = protocol === "https" || host?.includes("replit.dev") ? "https" : protocol;
        const publicUrl = `/objects/${uniqueName}`;
        const fullUrl = `${secureProtocol}://${host}${publicUrl}`;
        return res.status(200).json({
          success: true,
          url: publicUrl,
          location: publicUrl,
          uploadURL: fullUrl,
          objectName: uniqueName
        });
      } catch (error) {
        console.error("\u274C File processing error:", error);
        return res.status(500).json({ success: false, error: "File processing failed" });
      }
    }
    let body = [];
    let totalSize = 0;
    const maxSize = 10 * 1024 * 1024;
    req.on("data", (chunk) => {
      totalSize += chunk.length;
      if (totalSize > maxSize) {
        return res.status(413).json({ success: false, error: "File too large" });
      }
      body.push(chunk);
    });
    req.on("end", async () => {
      try {
        const fileBuffer = Buffer.concat(body);
        console.log(`\u{1F4C1} Received file: ${fileBuffer.length} bytes`);
        if (fileBuffer.length === 0) {
          throw new Error("Empty file received");
        }
        const originalFilename = req.headers["x-filename"] || req.headers["x-original-filename"] || "upload.jpg";
        console.log(`\u{1F4DD} Original filename: ${originalFilename}`);
        console.log(`\u{1F50D} File header: ${fileBuffer.slice(0, 16).toString("hex")}`);
        const ext = path4.extname(String(originalFilename)).toLowerCase() || ".jpg";
        const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
        const filePath = path4.join(uploadsDir, uniqueName);
        fs3.writeFileSync(filePath, fileBuffer);
        const publicFilePath = path4.join(publicUploadsDir, uniqueName);
        fs3.writeFileSync(publicFilePath, fileBuffer);
        console.log(`\u2705 File saved in both locations:`);
        console.log(`   \u{1F4C1} Server: ${uniqueName}, size: ${fileBuffer.length} bytes`);
        console.log(`   \u{1F4C1} Public: client/public/imgs/uploads/${uniqueName}`);
        const protocol = req.get("x-forwarded-proto") || req.protocol;
        const host = req.get("host");
        const secureProtocol = protocol === "https" || host?.includes("replit.dev") ? "https" : protocol;
        const publicUrl = `/objects/${uniqueName}`;
        const fullUrl = `${secureProtocol}://${host}${publicUrl}`;
        return res.status(200).json({
          success: true,
          url: publicUrl,
          location: publicUrl,
          uploadURL: fullUrl,
          objectName: uniqueName
        });
      } catch (error) {
        console.error("\u274C Upload processing error:", error);
        return res.status(500).json({ success: false, error: "Upload failed" });
      }
    });
    req.on("error", (error) => {
      console.error("\u274C Request error:", error);
      return res.status(500).json({ success: false, error: "Request failed" });
    });
  } catch (error) {
    console.error("\u274C Direct upload error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});
router.use("/objects", express3.static(uploadsDir, {
  dotfiles: "deny",
  index: false,
  maxAge: "1d",
  // Cache por 1 día
  fallthrough: false,
  // Don't fall through if file not found
  setHeaders: (res, filePath) => {
    const ext = path4.extname(filePath).toLowerCase();
    console.log(`\u{1F3AF} Serving static file: ${path4.basename(filePath)} with extension: ${ext}`);
    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".tif": "image/tiff"
    };
    const contentType = contentTypes[ext] || "application/octet-stream";
    console.log(`\u{1F4CB} Setting Content-Type: ${contentType}`);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (contentType.startsWith("image/")) {
      res.setHeader("Accept-Ranges", "bytes");
    }
  }
}));
router.get("/objects/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path4.join(uploadsDir, filename);
  console.log(`\u{1F50D} Fallback handler: Looking for file ${filename} at ${filePath}`);
  if (!fs3.existsSync(filePath)) {
    console.log(`\u274C File not found: ${filePath}`);
    console.log(`\u{1F4C1} Available files in uploads:`, fs3.readdirSync(uploadsDir).slice(0, 10).join(", "));
    return res.status(404).json({
      success: false,
      error: "File not found",
      filename,
      availableFiles: fs3.readdirSync(uploadsDir).length
    });
  }
  try {
    const stats = fs3.statSync(filePath);
    const ext = path4.extname(filename).toLowerCase();
    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon"
    };
    const contentType = contentTypes[ext] || "application/octet-stream";
    console.log(`\u2705 Serving file via fallback: ${filename}, size: ${stats.size}, type: ${contentType}`);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const readStream = fs3.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    console.error(`\u274C Error serving file ${filename}:`, error);
    res.status(500).json({
      success: false,
      error: "Error serving file",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var objectStorageRouter_default = router;

// server/mediaStorageRouter.ts
init_db();
init_schema();
import express4 from "express";
import { eq as eq2 } from "drizzle-orm";
import { v4 as uuidv42 } from "uuid";
import sharp2 from "sharp";
import multer2 from "multer";
var router2 = express4.Router();
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB
});
router2.post("/api/media/upload", upload2.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file received" });
    }
    const { buffer, originalname, mimetype, size } = req.file;
    const fileId = uuidv42();
    let processedBuffer = buffer;
    if (mimetype.startsWith("image/")) {
      try {
        const imageInfo = await sharp2(buffer).metadata();
        if (imageInfo.width && imageInfo.width > 1920) {
          processedBuffer = await sharp2(buffer).resize(1920, 1920, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
        } else {
          processedBuffer = await sharp2(buffer).jpeg({ quality: 85 }).toBuffer();
        }
      } catch (sharpError) {
        console.log("\u26A0\uFE0F Sharp processing failed, using original:", sharpError.message);
        processedBuffer = buffer;
      }
    }
    const url = `/api/media/${fileId}`;
    const objectKey = `media/${fileId}-${originalname}`;
    const [savedFile] = await dbInstance.insert(mediaFiles).values({
      id: fileId,
      filename: `${fileId}-${originalname}`,
      originalName: originalname,
      mimeType: mimetype,
      size: processedBuffer.length,
      url,
      objectKey,
      data: processedBuffer.toString("base64")
    }).returning();
    console.log(`\u2705 Media saved to database: ${savedFile.filename}, size: ${processedBuffer.length} bytes`);
    res.json({
      success: true,
      id: savedFile.id,
      url: savedFile.url,
      location: savedFile.url,
      filename: savedFile.filename,
      size: savedFile.size,
      mimeType: savedFile.mimeType
    });
  } catch (error) {
    console.error("\u274C Media upload error:", error);
    res.status(500).json({
      success: false,
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.get("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [file] = await dbInstance.select().from(mediaFiles).where(eq2(mediaFiles.id, id));
    if (!file) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Disposition", `inline; filename="${file.originalName}"`);
    const binaryData = Buffer.from(file.data, "base64");
    res.send(binaryData);
  } catch (error) {
    console.error("\u274C Error serving media:", error);
    res.status(500).json({ error: "Failed to serve media" });
  }
});
router2.get("/api/media/:id/info", async (req, res) => {
  try {
    const { id } = req.params;
    const [file] = await dbInstance.select({
      id: mediaFiles.id,
      filename: mediaFiles.filename,
      originalName: mediaFiles.originalName,
      mimeType: mediaFiles.mimeType,
      size: mediaFiles.size,
      alt: mediaFiles.alt,
      description: mediaFiles.description,
      createdAt: mediaFiles.createdAt
    }).from(mediaFiles).where(eq2(mediaFiles.id, id));
    if (!file) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.json({
      success: true,
      media: file,
      url: `/api/media/${file.id}`
    });
  } catch (error) {
    console.error("\u274C Error getting media info:", error);
    res.status(500).json({ error: "Failed to get media info" });
  }
});
router2.get("/api/media", async (req, res) => {
  try {
    const files = await dbInstance.select({
      id: mediaFiles.id,
      filename: mediaFiles.filename,
      originalName: mediaFiles.originalName,
      mimeType: mediaFiles.mimeType,
      size: mediaFiles.size,
      alt: mediaFiles.alt,
      description: mediaFiles.description,
      createdAt: mediaFiles.createdAt
    }).from(mediaFiles).orderBy(mediaFiles.createdAt);
    const filesWithUrls = files.map((file) => ({
      ...file,
      url: `/api/media/${file.id}`
    }));
    res.json({
      success: true,
      media: filesWithUrls,
      total: files.length
    });
  } catch (error) {
    console.error("\u274C Error listing media:", error);
    res.status(500).json({ error: "Failed to list media" });
  }
});
router2.delete("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedFile] = await dbInstance.delete(mediaFiles).where(eq2(mediaFiles.id, id)).returning();
    if (!deletedFile) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.json({
      success: true,
      message: "Media deleted successfully",
      deletedFile: {
        id: deletedFile.id,
        filename: deletedFile.filename
      }
    });
  } catch (error) {
    console.error("\u274C Error deleting media:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
});
var mediaStorageRouter_default = router2;

// server/index.ts
dotenv2.config();
var app = express5();
app.use(express5.json());
app.use(express5.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  app.use(objectStorageRouter_default);
  app.use(mediaStorageRouter_default);
  const httpServer = await registerRoutes(app);
  await initializeStoreData();
  await initializeSiteConfig();
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const UPLOADS_DIR2 = path5.join(process.cwd(), "uploads");
  if (!fs4.existsSync(UPLOADS_DIR2)) {
    fs4.mkdirSync(UPLOADS_DIR2, { recursive: true, mode: 493 });
    console.log("\u2705 Created uploads directory:", UPLOADS_DIR2);
  }
  app.use("/uploads", express5.static(UPLOADS_DIR2, {
    setHeaders: (res, filePath) => {
      const ext = path5.extname(filePath).toLowerCase();
      const contentTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon"
      };
      const contentType = contentTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  }));
  app.get("/objects/:objectId/:maybeFilename?", async (req, res) => {
    try {
      const { objectId, maybeFilename } = req.params;
      const files = await fs4.promises.readdir(UPLOADS_DIR2);
      if (!maybeFilename) {
        let match2 = files.find((f) => f === objectId);
        if (!match2) {
          match2 = files.find((f) => f.startsWith(`${objectId}-`) || f.startsWith(`${objectId}`));
        }
        if (!match2) {
          return res.status(404).send("Not found");
        }
        const filePath2 = path5.join(UPLOADS_DIR2, match2);
        if (!fs4.existsSync(filePath2)) return res.status(404).send("Not found");
        const ext2 = path5.extname(filePath2).toLowerCase();
        const contentTypes2 = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".avif": "image/avif",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon"
        };
        const contentType2 = contentTypes2[ext2] || "application/octet-stream";
        res.setHeader("Content-Type", contentType2);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.sendFile(filePath2);
      }
      const candidate1 = `${objectId}-${maybeFilename}`;
      const candidate2 = `${objectId}${maybeFilename.startsWith(".") ? "" : "-"}${maybeFilename}`;
      const candidateExact = `${maybeFilename}`;
      const candidates = [candidate1, candidate2, candidateExact];
      let match = files.find((f) => candidates.includes(f));
      if (!match) {
        match = files.find((f) => f.startsWith(`${objectId}-`) && f.endsWith(path5.extname(maybeFilename)));
      }
      if (!match) {
        match = files.find((f) => f.startsWith(objectId));
      }
      if (!match) return res.status(404).send("Not found");
      const filePath = path5.join(UPLOADS_DIR2, match);
      if (!fs4.existsSync(filePath)) return res.status(404).send("Not found");
      const ext = path5.extname(filePath).toLowerCase();
      const contentTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon"
      };
      const contentType = contentTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.sendFile(filePath);
    } catch (err) {
      console.error("Error serving object:", err);
      return res.status(500).send("Internal error");
    }
  });
  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }
  console.log("ENV PORT:", process.env.PORT);
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
