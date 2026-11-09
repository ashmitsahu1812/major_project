import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/helpers';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.logs);
      } catch {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      key: 'timestamp',
      render: (row) => (
        <span className="text-xs text-slate-400">{formatDateTime(row.timestamp)}</span>
      ),
    },
    {
      header: 'Action Type',
      key: 'action',
      render: (row) => (
        <Badge
          variant={
            row.action.includes('ADMIN') ? 'indigo' : row.action === 'MANUAL' ? 'amber' : 'slate'
          }
          size="sm"
        >
          {row.action}
        </Badge>
      ),
    },
    {
      header: 'Student Target',
      key: 'studentName',
      render: (row) => (
        <div>
          <p className="font-semibold text-white text-sm">{row.studentName}</p>
          <p className="text-xs text-slate-400">Roll: {row.studentRoll}</p>
        </div>
      ),
    },
    {
      header: 'Course',
      key: 'courseCode',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-200 text-xs">{row.courseCode}</p>
          <p className="text-xs text-slate-400">{row.courseName}</p>
        </div>
      ),
    },
    {
      header: 'Status Granted',
      key: 'statusAssigned',
      render: (row) => (
        <Badge variant={row.statusAssigned === 'PRESENT' ? 'emerald' : 'rose'} size="sm">
          {row.statusAssigned}
        </Badge>
      ),
    },
    {
      header: 'Performed By',
      key: 'performedBy',
      render: (row) => (
        <span className="text-xs font-medium text-slate-300">{row.performedBy}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-indigo-400" />
          <span>System Audit & Override Logs</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically recorded ledger of faculty manual overrides, medical leaves, and admin interventions.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Retrieving immutable audit trail..." />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Search audit trail by student or course..."
          emptyMessage="No manual overrides recorded in audit trail"
        />
      )}
    </div>
  );
}

