"use client";

import React from "react";
import StudentLayout from "@/components/students/StudentLayout";
import StudentHome from "@/components/students/StudentHome";

export default function StudentsLandingPage() {
  return (
    <StudentLayout>
      <StudentHome />
    </StudentLayout>
  );
}
