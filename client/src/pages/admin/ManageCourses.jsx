import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Users, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadData = async () => {
    try {
      const [coursesRes, facultyRes, studentsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/faculty"),
        api.get("/courses/students"),
      ]);
      setCourses(coursesRes.data.courses);
      setFacultyList(facultyRes.data.faculty);
      setStudentsList(studentsRes.data.students);
    } catch {
      toast.error("Failed to load courses data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (formData) => {
    try {
      await api.post("/courses", formData);
      toast.success("Course created successfully");
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleEnrollStudent = async (courseId, studentId) => {
    if (!courseId || !studentId) return;
    try {
      await api.post("/courses/enroll", { courseId, studentId });
      toast.success("Student enrolled successfully");
      setEnrollModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll student");
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/courses/${confirmDelete}`);
      toast.success("Course deleted");
      setConfirmDelete(null);
      loadData();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const columns = [
    {
      header: "Code",
      key: "code",
      render: (row) => (
        <span className="font-bold text-indigo-400 text-sm px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
          {row.code}
        </span>
      ),
    },
    {
      header: "Course Name",
      key: "name",
      render: (row) => <span className="font-semibold text-white text-sm">{row.name}</span>,
    },
    {
      header: "Department",
      key: "department",
      render: (row) => <span className="text-xs text-slate-400">{row.department}</span>,
    },
    {
      header: "Faculty",
      key: "faculty",
      accessor: (row) => row.faculty?.name,
      render: (row) => <span className="text-xs text-slate-300">{row.faculty?.name || "Unassigned"}</span>,
    },
    {
      header: "Students",
      key: "enrollments",
      accessor: (row) => row._count?.enrollments || 0,
      render: (row) => (
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          {row._count?.enrollments || 0}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCourse(row);
              setEnrollModalOpen(true);
            }}
            title="Enroll student"
            className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(row.id)}
            title="Delete course"
            className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Course Catalog
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            Configure subjects, assign faculty leads, and manage student batch enrollments.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading course catalog..." />
      ) : (
        <DataTable columns={columns} data={courses} searchPlaceholder="Search courses by code..." />
      )}

      <CreateCourseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        facultyList={facultyList}
        onCreate={handleCreateCourse}
      />

      <EnrollStudentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        course={selectedCourse}
        students={studentsList}
        onEnroll={handleEnrollStudent}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Course"
        message="This action is irreversible. All associated enrollments and attendance records will be removed."
        confirmLabel="Permanently Delete"
        variant="danger"
        onConfirm={handleDeleteCourse}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function CreateCourseModal({ isOpen, onClose, facultyList, onCreate }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    department: "Computer Science",
    facultyId: "",
  });

  // Sync default facultyId when the list loads
  useEffect(() => {
    if (facultyList.length > 0 && !form.facultyId) {
      setForm((prev) => ({ ...prev, facultyId: facultyList[0].id }));
    }
  }, [facultyList]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.facultyId) {
      return;
    }
    onCreate(form);
    // Reset form after submission
    setForm({ code: "", name: "", department: "Computer Science", facultyId: facultyList[0]?.id || "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Course">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Course Code</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="e.g. CS401"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Course Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Advanced Operating Systems"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Department</label>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="input"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics &amp; Comm">Electronics &amp; Comm</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mechanical Eng">Mechanical Eng</option>
          </select>
        </div>
        <div>
          <label className="label">Faculty Lead</label>
          <select
            value={form.facultyId}
            onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
            className="input"
            required
          >
            <option value="">Select faculty...</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.department}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary px-5">
            Save Course
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EnrollStudentModal({ isOpen, onClose, course, students, onEnroll }) {
  const [studentId, setStudentId] = useState("");

  if (!isOpen || !course) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId) return;
    onEnroll(course.id, studentId);
    setStudentId("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enroll Student into ${course.code}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Select Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="input"
            required
          >
            <option value="">Choose a student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.rollNumber || "No Roll"} ({s.department})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!studentId}
            className="btn-primary px-5 disabled:opacity-40"
          >
            Enroll
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDialog({ isOpen, title, message, confirmLabel, variant = "danger", onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-slate-400 space-y-2">
        <p>{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger px-5">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
