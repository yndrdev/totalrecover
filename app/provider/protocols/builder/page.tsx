"use client";

import React from "react";
import { HealthcareLayout } from "@/components/layout/healthcare-layout";
import ProtocolBuilder from "@/components/protocols/protocol-builder";

export default function ProviderProtocolBuilderPage() {
  return (
    <HealthcareLayout>
      <ProtocolBuilder />
    </HealthcareLayout>
  );
}
