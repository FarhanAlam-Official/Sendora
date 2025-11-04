"use client"

import CertificateGeneratorStandalone from "@/components/certificate-generator-standalone"

/**
 * Certificates Page Component
 * 
 * This is a simple wrapper page that renders the CertificateGeneratorStandalone component.
 * It provides a dedicated route for the certificate generation functionality.
 * 
 * The actual certificate generation logic is encapsulated in the CertificateGeneratorStandalone
 * component, which handles all the UI and functionality for creating certificates.
 */
export default function CertificatesPage() {
  return <CertificateGeneratorStandalone />
}