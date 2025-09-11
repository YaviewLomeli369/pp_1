
import { db } from "../server/db";
import { pageContents } from "../shared/schema";

async function seedPageContents() {
  if (!db) {
    console.error("Database not available");
    return;
  }

  console.log("🌱 Seeding page contents...");

  try {
    // Servicios page content
    const serviciosContent = [
      {
        pageId: "servicios",
        sectionKey: "hero",
        type: "text",
        title: "Servicios Digitales para Impulsar tu Negocio",
        content: "Diseño, SEO y soporte para que tu marca brille en internet.",
        order: 0,
        isActive: true,
      },
      {
        pageId: "servicios",
        sectionKey: "services",
        type: "text",
        title: "Nuestros Servicios",
        content: "Soluciones integrales para tu presencia digital",
        order: 0,
        isActive: true,
      },
      {
        pageId: "servicios",
        sectionKey: "services",
        type: "card",
        title: "Desarrollo Web a Medida",
        content: "Creamos sitios web modernos y escalables.",
        order: 1,
        isActive: true,
      },
      {
        pageId: "servicios",
        sectionKey: "services",
        type: "card",
        title: "Marketing Digital",
        content: "Estrategias para atraer clientes y crecer en línea.",
        order: 2,
        isActive: true,
      },
      {
        pageId: "servicios",
        sectionKey: "services",
        type: "card",
        title: "Consultoría Tecnológica",
        content: "Acompañamos a tu empresa en su transformación digital.",
        order: 3,
        isActive: true,
      },
    ];

    // Conocenos page content
    const conocenosContent = [
      {
        pageId: "conocenos",
        sectionKey: "hero",
        type: "text",
        title: "Conócenos",
        content: "Somos un equipo comprometido con el crecimiento de tu negocio.",
        order: 0,
        isActive: true,
      },
      {
        pageId: "conocenos",
        sectionKey: "mission",
        type: "text",
        title: "Nuestra Misión",
        content: "Brindar soluciones digitales accesibles y de alto impacto.",
        order: 0,
        isActive: true,
      },
      {
        pageId: "conocenos",
        sectionKey: "vision",
        type: "text",
        title: "Nuestra Visión",
        content: "Ser líderes en innovación tecnológica para PYMES en LATAM.",
        order: 0,
        isActive: true,
      },
      {
        pageId: "conocenos",
        sectionKey: "values",
        type: "text",
        title: "Nuestros Valores",
        content: "Innovación, compromiso, transparencia.",
        order: 0,
        isActive: true,
      },
      {
        pageId: "conocenos",
        sectionKey: "team",
        type: "text",
        title: "Nuestro Equipo",
        content: "Detrás de cada proyecto hay personas apasionadas, listas para ayudarte a crecer.",
        order: 0,
        isActive: true,
      },
    ];

    // Insert servicios content
    for (const content of serviciosContent) {
      await db.insert(pageContents).values(content);
    }

    // Insert conocenos content
    for (const content of conocenosContent) {
      await db.insert(pageContents).values(content);
    }

    console.log("✅ Page contents seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding page contents:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedPageContents().then(() => {
    console.log("🎉 Seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
}

export { seedPageContents };
