import { PatientChat } from "@/components/patient/patient-chat";

// Test page that bypasses authentication for development
export default function PatientTestPage() {
  // Use a test user ID and conversation ID
  const testUserId = "test-user-123";
  const testConversationId = "test-conversation-123";

  return <PatientChat userId={testUserId} conversationId={testConversationId} tenantId="test-tenant" patientId="test-patient" />;
}