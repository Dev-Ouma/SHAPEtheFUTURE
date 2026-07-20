"use client";

import PortalLayoutInner from "./PortalLayoutInner";
import Chatbot from "@/components/Chatbot";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <PortalLayoutInner>{children}</PortalLayoutInner>
      <Chatbot />
    </div>
  );
}
