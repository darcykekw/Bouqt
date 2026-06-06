"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/ui/footer";
import { Flower2, Package, UserPlus, Info, Truck, Mail, Scale, Handshake, Phone, MapPin } from "lucide-react";

export default function FooterWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <Footer
      brand={{
        name: "Bouqt",
        description:
          "Fresh, handpicked bouquets made with care — ready for pickup or delivered to your door.",
      }}
      socialLinks={[
        { name: "Instagram", href: "https://www.instagram.com/" },
        { name: "Facebook", href: "https://www.facebook.com/" },
      ]}
      columns={[
        {
          title: "Shop",
          links: [
            { name: "Browse Bouquets", Icon: Flower2, href: "/bouquets" },
            { name: "My Orders", Icon: Package, href: "/orders" },
            { name: "Register", Icon: UserPlus, href: "/register" },
          ],
        },
        {
          title: "Legal",
          links: [
            { name: "Privacy Policy", Icon: Scale, href: "/legal/privacy" },
            { name: "Terms of Service", Icon: Handshake, href: "/legal/terms" },
          ],
        },
        {
          title: "Contact",
          links: [
            { name: "hello@bouqt.com", Icon: Mail, href: "mailto:hello@bouqt.com" },
            { name: "+63 912 345 6789", Icon: Phone, href: "https://wa.me/639123456789" },
            { name: "123 Jasmine Street", Icon: MapPin, href: "#" },
          ],
        },
      ]}
      copyright={`Bouqt © ${new Date().getFullYear()}. All rights reserved.`}
    />
  );
}
