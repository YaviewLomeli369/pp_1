import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { ContactInfo, SiteConfig } from "@shared/schema";

export function Footer() {
  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact/info"],
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const configData = (config?.config as any) || {};
  const appearance = configData?.appearance || {};
  const themeConfig = configData?.theme || {};


  return (
    <footer className={`${themeConfig.backgroundColor || "bg-gray-900"} ${themeConfig.textColor || "text-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className={`${themeConfig.brandNameColor || "text-lg font-semibold mb-4"}`}>{appearance.brandName || "Sistema Modular"}</h3>
            <p className={`${themeConfig.taglineColor || "text-gray-300 text-sm"}`}>
              {appearance.tagline || "Plantilla web modular y reutilizable para crear sitios completos configurables por JSON."}
            </p>
          </div>

          <div>
            <h3 className={`${themeConfig.headingColor || "text-lg font-semibold mb-4"}`}>Contacto</h3>
            <div className="space-y-2 text-sm">
              {contactInfo?.email && (
                <p className={themeConfig.contactInfoColor || "text-gray-300"}>
                  <strong>Email:</strong> {contactInfo.email}
                </p>
              )}
              {contactInfo?.phone && (
                <p className={themeConfig.contactInfoColor || "text-gray-300"}>
                  <strong>Teléfono:</strong> {contactInfo.phone}
                </p>
              )}
              {contactInfo?.address && (
                <div className={themeConfig.contactInfoColor || "text-gray-300"}>
                  <strong>Dirección:</strong>
                  <div style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>
                    {contactInfo.address}
                  </div>
                </div>
              )}
              {contactInfo?.hours && (
                <div className={themeConfig.contactInfoColor || "text-gray-300"}>
                  <strong>Horarios:</strong>
                  <div style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>
                    {contactInfo.hours}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className={`${themeConfig.headingColor || "text-lg font-semibold mb-4"}`}>Redes Sociales</h3>
            <div className="flex flex-wrap gap-4">
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.facebook && (
                <a
                  href={(contactInfo.socialLinks as any).facebook}
                  className={`${themeConfig.socialLinkColor || "text-gray-300 hover:text-white transition-colors"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              )}
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.instagram && (
                <a
                  href={(contactInfo.socialLinks as any).instagram}
                  className={`${themeConfig.socialLinkColor || "text-gray-300 hover:text-white transition-colors"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.twitter && (
                <a
                  href={(contactInfo.socialLinks as any).twitter}
                  className={`${themeConfig.socialLinkColor || "text-gray-300 hover:text-white transition-colors"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              )}
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.linkedin && (
                <a
                  href={(contactInfo.socialLinks as any).linkedin}
                  className={`${themeConfig.socialLinkColor || "text-gray-300 hover:text-white transition-colors"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.youtube && (
                <a
                  href={(contactInfo.socialLinks as any).youtube}
                  className={`${themeConfig.socialLinkColor || "text-gray-300 hover:text-white transition-colors"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              )}
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.tiktok && (
                <a
                  href={(contactInfo.socialLinks as any).tiktok}
                  className={`${themeConfig.socialLinkColor || "text-gray-300 hover:text-white transition-colors"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={`border-t ${themeConfig.footerBorderColor || "border-gray-800"} mt-8 pt-8 text-center text-sm`}>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className={themeConfig.copyrightColor || "text-gray-300"}>&copy; 2024 {appearance.brandName || "Sistema Modular"}. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link
                href="/aviso-privacidad"
                className={`${themeConfig.linkColor || "text-gray-300 hover:text-white transition-colors underline"}`}
              >
                Aviso de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}