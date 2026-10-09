export interface IntakeTest {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  intake_version?: string | number;
  status: string;
  intake_status?: string;
  current_step: number;
  created_at: string;
  updated_at?: string;
}

export interface IntakeDebugLog {
  source_file: string;
  line: number;
  timestamp?: string;
  level: "debug" | "info" | "warning" | "error" | string;
  event: string;
  message: string;
  section?: number | string;
  request?: { request_id?: string; method?: string; endpoint?: string; body?: unknown };
  response?: { status_code?: number; duration_ms?: number; body?: unknown };
  data?: Record<string, unknown>;
}

export interface IntakeUpload {
  upload_id: string;
  id?: string;
  client_upload_id?: string;
  intake_session_id?: string;
  upload_sequence: number;
  original_filename: string;
  file_size: number;
  checksum?: string;
  is_final: boolean;
  status: "uploaded" | "failed" | "rejected" | string;
  created_at: string;
  uploaded_at?: string;
  s3_key: string;
  logs_endpoint: string;
  log_count?: number;
  logs?: IntakeDebugLog[];
  error?: string;
}

export interface IntakeTestDetail extends IntakeTest {
  uploads: IntakeUpload[];
  logs: IntakeDebugLog[];
  intake_version: number;
  intake_status: string;
  updated_at: string;
  logs_by_section: Record<string, IntakeDebugLog[]>;
  archive_error?: string;
}
