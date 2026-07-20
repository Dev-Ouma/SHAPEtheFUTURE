"use client";

import React from "react";
import AlumniLayout from "@/components/alumni/AlumniLayout";
import AlumniHome from "@/components/alumni/AlumniHome";

/** Client island for the alumni hub (forms, motion, interactive UI). */
export default function AlumniLandingClient() {
  return (
    <AlumniLayout>
      <AlumniHome />
    </AlumniLayout>
  );
}
