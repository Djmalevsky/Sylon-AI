import { CallLogsTable } from "@/components/calls/call-logs-table";
import { CALL_LOGS } from "@/lib/mock-data";

export default function CallsPage() {
  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-5">
        Call Logs & Transcripts
      </h2>
      <CallLogsTable logs={CALL_LOGS} />
    </div>
  );
}
