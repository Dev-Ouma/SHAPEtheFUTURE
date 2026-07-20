import type { Metadata } from "next";
import ServiceCharterPage from "./page";

export const metadata: Metadata = {
  title: "Service Charter | Open University of Kenya",
  description:
    "OUK's official digital Service Charter — explore service standards, timelines, downloadable documents, video guides, FAQs, and contact information for all institutional services.",
  openGraph: {
    title: "Service Charter | Open University of Kenya",
    description:
      "Our public commitment to delivering excellent, timely and transparent services to students, staff, partners and the public.",
    url: "https://www.ouk.ac.ke/service-charter",
  },
};

export { ServiceCharterPage as default };
