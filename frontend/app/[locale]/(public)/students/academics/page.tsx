"use client";

import React from "react";
import StudentLayout from "@/components/students/StudentLayout";
import StudentAcademics from "@/components/students/StudentAcademics";

export default function StudentAcademicsPage() {
  return (
    <StudentLayout>
      <StudentAcademics />
    </StudentLayout>
  );
}
