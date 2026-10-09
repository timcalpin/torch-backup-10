import { IntakeLogViewer } from "./IntakeLogViewer";
export function IntakeLogsViewer({ logs }: { logs: import("@/types/intakeTests").IntakeDebugLog[] }) { return <IntakeLogViewer logs={logs} />; }
