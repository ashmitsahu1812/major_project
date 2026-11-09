import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/helpers';

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/student/history');
        setRecords(res.data.records);
      } catch {
        toast.error('Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const columns = [
    {
      header: 'Date & Time',
      key: 'timestamp',
      render: (row) => (
        <span className="text-xs text-slate-400">{formatDateTime(row.timestamp)}</span>
      ),
    },
    {
      header: 'Course Code',
      key: 'code',
      accessor: (row) => row.session?.course?.code,
      render: (row) => (
        <span className="font-bold text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-500/10">
          {row.session.course.code}
        </span>
      ),
    },
    {
      header: 'Course Title',
      key: 'courseName',
      accessor: (row) => row.session?.course?.name,
      render: (row) => (
        <span className="text-xs font-semibold text-white">{row.session.course.name}</span>
      ),
    },
    {
      header: 'Verification Method',
      key: 'method',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">{row.method}</span>
      ),
    },
    {
      header: 'Recorded Status',
      key: 'status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'PRESENT'
              ? 'emerald'
              : row.status === 'LATE'
              ? 'amber'
              : row.status === 'FLAGGED_PROXY'
              ? 'orange'
              : 'rose'
          }
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <CalendarDays className="w-7 h-7 text-indigo-400" />
          <span>Personal Attendance Ledger</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Historical log of all recorded present, absent, and late lecture timestamps.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Retrieving attendance ledger..." />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          searchPlaceholder="Search history by course code..."
          emptyMessage="No historical records found for this account"
        />
      )}
    </div>
  );
}

