import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { strapiGet, strapiPost } from '@/lib/strapiClient';
import {
    Loader2, FileText, Upload, CheckCircle2, Clock,
    Stethoscope, Microscope, Atom, Dna, Paperclip, ExternalLink,
    ClipboardList, FlaskConical, ChevronDown, ChevronUp
} from 'lucide-react';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

// ── Types ──
type NoteAttachment = {
    id: number;
    name: string;
    url: string;
    ext: string;
    mime: string;
    size: number;
};

type SpecialistNote = {
    id: number;
    documentId: string;
    specialty: string;
    title: string;
    findings: any;
    notes: string;
    status: 'pending' | 'completed';
    createdAt: string | null;
    updatedAt: string | null;
    doctor: {
        id: number;
        documentId: string;
        fullName: string;
        specialty: string;
    } | null;
    attachments: NoteAttachment[];
};

type HistoryEntry = {
    id: number;
    date: string;
    type: string;
    value: number;
    unit: string;
    notes: string | null;
    createdAt: string | null;
    doctor?: {
        id: number;
        documentId: string;
        fullName: string;
        specialty: string;
    } | null;
};

// Unified row
type UnifiedRow = {
    id: string;
    date: string;
    kind: 'measurement' | 'specialist_note';
    doctorName: string;
    specialty: string;
    diagnosis: string;    // test type or note title
    treatment: string;    // test value or findings summary
    notes: string;
    status?: string;
    attachments: NoteAttachment[];
    rawNote?: SpecialistNote;
};

const specialtyIcons: Record<string, React.ReactNode> = {
    Cardiology: <Stethoscope className="w-3.5 h-3.5" />,
    Hematology: <Microscope className="w-3.5 h-3.5" />,
    NuclearMedicine: <Atom className="w-3.5 h-3.5" />,
    Genetics: <Dna className="w-3.5 h-3.5" />,
};

const specialtyColors: Record<string, string> = {
    Cardiology: 'text-red-600 bg-red-50 border-red-200',
    Hematology: 'text-purple-600 bg-purple-50 border-purple-200',
    NuclearMedicine: 'text-amber-600 bg-amber-50 border-amber-200',
    Genetics: 'text-green-600 bg-green-50 border-green-200',
};

const specialtyLabels: Record<string, string> = {
    Cardiology: 'Cardiology',
    Hematology: 'Hematology',
    NuclearMedicine: 'Nuclear Medicine',
    Genetics: 'Genetics',
};

const testTypeLabels: Record<string, string> = {
    NT_PRO_BNP: 'NT-proBNP',
    GFR: 'GFR',
    BNP: 'BNP',
    EF: 'Ejection Fraction',
    LVH: 'LV Wall Thickness',
};

type Props = {
    patientDocumentId: string;
    historyRows: HistoryEntry[];
};

export default function CombinedExaminations({ patientDocumentId, historyRows }: Props) {
    const [notes, setNotes] = useState<SpecialistNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<'all' | 'measurements' | 'notes'>('all');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formFindings, setFormFindings] = useState('');
    const [formStatus, setFormStatus] = useState<'pending' | 'completed'>('pending');
    const [formFiles, setFormFiles] = useState<File[]>([]);

    const formFileInputRef = useRef<HTMLInputElement>(null);

    // ── Load specialist notes ──
    const loadNotes = async () => {
        try {
            const data = await strapiGet<SpecialistNote[]>(
                `/api/auth/doctor/specialist-notes?patientDocumentId=${patientDocumentId}`
            );
            setNotes(data || []);
        } catch (e: any) {
            console.error('Failed to load specialist notes:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadNotes(); }, [patientDocumentId]);

    // ── Build unified rows ──
    const rows = useMemo(() => {
        const items: UnifiedRow[] = [];

        // Measurements
        if (filterType !== 'notes') {
            historyRows.forEach((entry) => {
                const label = testTypeLabels[entry.type] || entry.type || 'Test';
                items.push({
                    id: `m-${entry.id}`,
                    date: entry.date || entry.createdAt || '',
                    kind: 'measurement',
                    doctorName: entry.doctor ? `Dr. ${entry.doctor.fullName}` : '—',
                    specialty: entry.doctor?.specialty || '',
                    diagnosis: label,
                    treatment: `${entry.value} ${entry.unit || ''}`.trim(),
                    notes: entry.notes || '',
                    attachments: [],
                });
            });
        }

        // Specialist notes
        if (filterType !== 'measurements') {
            notes.forEach((note) => {
                let findingsSummary = '';
                if (note.findings) {
                    if (typeof note.findings === 'object' && note.findings.summary) {
                        findingsSummary = note.findings.summary;
                    } else if (typeof note.findings === 'object') {
                        findingsSummary = Object.entries(note.findings)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ');
                    }
                }

                items.push({
                    id: `n-${note.documentId}`,
                    date: note.createdAt || '',
                    kind: 'specialist_note',
                    doctorName: note.doctor ? `Dr. ${note.doctor.fullName}` : '—',
                    specialty: note.doctor?.specialty || note.specialty || '',
                    diagnosis: note.title || 'Specialist Note',
                    treatment: findingsSummary,
                    notes: note.notes || '',
                    status: note.status,
                    attachments: note.attachments || [],
                    rawNote: note,
                });
            });
        }

        // Sort newest first
        items.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
        });

        return items;
    }, [historyRows, notes, filterType]);

    // ── Handlers ──
    const toggleExpand = (id: string) => {
        const next = new Set(expandedRows);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpandedRows(next);
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        try {
            let findingsJson: any = {};
            if (formFindings.trim()) {
                try { findingsJson = JSON.parse(formFindings); }
                catch { findingsJson = { summary: formFindings }; }
            }
            const saveResult = await strapiPost<any>('/api/auth/doctor/specialist-notes', {
                patientDocumentId,
                noteDocumentId: editingNoteId || undefined,
                title: formTitle,
                findings: findingsJson,
                notes: formNotes,
                status: formStatus,
            });

            // Upload files if any
            const noteDocId = saveResult?.noteDocumentId || editingNoteId;
            if (noteDocId && formFiles.length > 0) {
                for (const file of formFiles) {
                    const fd = new FormData();
                    fd.append('noteDocumentId', noteDocId);
                    fd.append('file', file);
                    const token = localStorage.getItem('doctor_token');
                    const res = await fetch(`${STRAPI_URL}/api/auth/doctor/upload-note-attachment`, {
                        method: 'POST',
                        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: fd,
                    });
                    if (!res.ok) {
                        toast.error(`Failed to upload ${file.name}`);
                    }
                }
            }

            toast.success(editingNoteId ? 'Note updated!' : 'Note & files saved!');
            resetForm();
            await loadNotes();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingNoteId(null);
        setFormTitle('');
        setFormNotes('');
        setFormFindings('');
        setFormStatus('pending');
        setFormFiles([]);
    };

    const removeFormFile = (idx: number) => {
        setFormFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleFormFileSelect = (files: FileList | null) => {
        if (!files) return;
        setFormFiles(prev => [...prev, ...Array.from(files)]);
    };

    const handleEdit = (note: SpecialistNote) => {
        setEditingNoteId(note.documentId);
        setFormTitle(note.title || '');
        setFormNotes(note.notes || '');
        setFormFindings(note.findings ? JSON.stringify(note.findings, null, 2) : '');
        setFormStatus(note.status || 'pending');
        setShowForm(true);
    };

    const getFileIcon = (mime: string) => {
        if (mime?.startsWith('image/')) return '🖼️';
        if (mime?.includes('pdf')) return '📄';
        if (mime?.includes('spreadsheet') || mime?.includes('excel')) return '📊';
        if (mime?.includes('word') || mime?.includes('document')) return '📝';
        if (mime?.startsWith('video/')) return '🎥';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (d: string | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const totalMeasurements = historyRows.length;
    const totalNotes = notes.length;

    return (
        <Card className="rounded-2xl mt-6">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-cyan-600" />
                        Examinations & Specialist Notes
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Filter pills */}
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                All ({totalMeasurements + totalNotes})
                            </button>
                            <button
                                onClick={() => setFilterType('measurements')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === 'measurements' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <FlaskConical className="w-3 h-3 inline mr-1" />
                                Tests ({totalMeasurements})
                            </button>
                            <button
                                onClick={() => setFilterType('notes')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === 'notes' ? 'bg-white shadow-sm text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <FileText className="w-3 h-3 inline mr-1" />
                                Notes ({totalNotes})
                            </button>
                        </div>

                        <Button
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl"
                            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                        >
                            {showForm ? 'Cancel' : '+ Add Note / Files'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* New/Edit note form */}
                {showForm && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3 border border-slate-200">
                        <div className="text-sm font-semibold text-slate-700 mb-2">
                            {editingNoteId ? '✏️ Edit Note / Files' : '📝 New Specialist Note / Files'}
                        </div>
                        <Input
                            placeholder="Title (e.g. Hematology Assessment)"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Findings — e.g. scintigraphy results, AL discrimination tests, gene mutation..."
                            value={formFindings}
                            onChange={(e) => setFormFindings(e.target.value)}
                            className="min-h-[80px]"
                        />
                        <Textarea
                            placeholder="Notes / Comments..."
                            value={formNotes}
                            onChange={(e) => setFormNotes(e.target.value)}
                            className="min-h-[60px]"
                        />
                        {/* File upload area */}
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 transition-colors hover:border-cyan-400 hover:bg-cyan-50/30">
                            <div className="flex items-center gap-3">
                                <Upload className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => formFileInputRef.current?.click()}
                                        className="text-sm font-medium text-cyan-600 hover:text-cyan-700 underline"
                                    >
                                        Choose files
                                    </button>
                                    <span className="text-xs text-slate-400 ml-2">
                                        PDF, Word, Excel, XML, Image, Video
                                    </span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={formFileInputRef}
                                className="hidden"
                                multiple
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.xml,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.mp4,.mov,.avi,.webm,.mkv"
                                onChange={(e) => { handleFormFileSelect(e.target.files); e.target.value = ''; }}
                            />
                            {formFiles.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    {formFiles.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200">
                                            <span className="text-sm">{getFileIcon(f.type)}</span>
                                            <span className="text-sm text-slate-700 flex-1 truncate">{f.name}</span>
                                            <span className="text-xs text-slate-400">{formatFileSize(f.size)}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFormFile(idx)}
                                                className="text-red-400 hover:text-red-600 text-sm font-bold px-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={formStatus === 'pending'} onChange={() => setFormStatus('pending')} />
                                <Clock className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Pending</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={formStatus === 'completed'} onChange={() => setFormStatus('completed')} />
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Completed</span>
                            </label>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {editingNoteId ? 'Update Note & Files' : 'Save Note & Files'}
                        </Button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin mr-2 text-cyan-500" />
                        <span className="text-slate-500 text-sm">Loading...</span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && rows.length === 0 && !showForm && (
                    <div className="text-center text-slate-400 py-8">
                        <ClipboardList className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">No examinations or notes recorded yet.</p>
                    </div>
                )}

                {/* Table */}
                {!loading && rows.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Examination / Test</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Findings / Value</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Files</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => {
                                    const isNote = row.kind === 'specialist_note';
                                    const isExpanded = expandedRows.has(row.id);
                                    const specLabel = specialtyLabels[row.specialty] || row.specialty;
                                    const specColor = specialtyColors[row.specialty] || 'text-slate-600 bg-slate-50 border-slate-200';
                                    const specIcon = specialtyIcons[row.specialty] || null;

                                    return (
                                        <React.Fragment key={row.id}>
                                            <tr
                                                className={`hover:bg-slate-50 transition-colors ${isNote ? 'cursor-pointer' : ''}`}
                                                onClick={() => isNote && toggleExpand(row.id)}
                                            >
                                                {/* Date */}
                                                <td className="py-3 px-2 whitespace-nowrap">
                                                    <span className="text-slate-700 font-mono text-xs">
                                                        {formatDate(row.date)}
                                                    </span>
                                                </td>

                                                {/* Doctor */}
                                                <td className="py-3 px-2">
                                                    <span className={`text-sm ${row.doctorName === '—' ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                                                        {row.doctorName}
                                                    </span>
                                                </td>

                                                {/* Specialty */}
                                                <td className="py-3 px-2">
                                                    {row.specialty ? (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${specColor}`}>
                                                            {specIcon}
                                                            {specLabel}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>

                                                {/* Examination / Test */}
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-1.5">
                                                        {!isNote && <FlaskConical className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                                                        {isNote && <FileText className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />}
                                                        <span className="font-medium text-slate-800">{row.diagnosis}</span>
                                                        {isNote && row.status && (
                                                            <Badge
                                                                variant={row.status === 'completed' ? 'default' : 'outline'}
                                                                className={`text-[9px] ml-1 ${row.status === 'completed' ? 'bg-green-500 text-white' : ''}`}
                                                            >
                                                                {row.status === 'completed' ? '✓' : '⏳'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Findings / Value */}
                                                <td className="py-3 px-2 max-w-[200px]">
                                                    {row.treatment ? (
                                                        <span className={`text-sm ${!isNote ? 'font-bold text-slate-800' : 'text-slate-600 truncate block'}`}>
                                                            {row.treatment}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>

                                                {/* Notes */}
                                                <td className="py-3 px-2 max-w-[200px]">
                                                    {row.notes ? (
                                                        <span className="text-xs text-slate-600 line-clamp-2">{row.notes}</span>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>

                                                {/* Files */}
                                                <td className="py-3 px-2">
                                                    {row.attachments.length > 0 ? (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            <Paperclip className="w-3 h-3 mr-0.5" />
                                                            {row.attachments.length}
                                                        </Badge>
                                                    ) : isNote ? (
                                                        <span className="text-slate-300 text-xs">—</span>
                                                    ) : null}

                                                    {/* Expand chevron for notes */}
                                                    {isNote && (
                                                        <span className="ml-1 inline-block">
                                                            {isExpanded
                                                                ? <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                                                                : <ChevronDown className="w-4 h-4 text-slate-400 inline" />
                                                            }
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Expanded detail row for specialist notes */}
                                            {isNote && isExpanded && row.rawNote && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 pb-4 pt-1">
                                                        <div className={`rounded-xl p-4 space-y-3 border ${specialtyColors[row.specialty] || 'border-slate-200 bg-slate-50'}`}>
                                                            {/* Findings detail */}
                                                            {row.rawNote.findings && Object.keys(row.rawNote.findings).length > 0 && (
                                                                <div className="bg-white/80 rounded-lg p-3">
                                                                    <div className="font-semibold text-slate-600 text-xs mb-2">📋 Detailed Findings:</div>
                                                                    {typeof row.rawNote.findings === 'object' && row.rawNote.findings.summary ? (
                                                                        <p className="text-sm text-slate-700">{row.rawNote.findings.summary}</p>
                                                                    ) : (
                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                            {Object.entries(row.rawNote.findings).map(([key, val]) => (
                                                                                <div key={key} className="bg-slate-50 rounded-lg px-3 py-2">
                                                                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{key}</div>
                                                                                    <div className="text-sm font-medium text-slate-800">{String(val)}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Full notes */}
                                                            {row.rawNote.notes && (
                                                                <div className="bg-white/60 rounded-lg p-3">
                                                                    <span className="font-semibold text-xs text-slate-600">💬 Notes: </span>
                                                                    <span className="text-sm text-slate-700">{row.rawNote.notes}</span>
                                                                </div>
                                                            )}

                                                            {/* Attachments */}
                                                            {row.attachments.length > 0 && (
                                                                <div>
                                                                    <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                                                        <Paperclip className="w-3 h-3" /> Attachments ({row.attachments.length})
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {row.attachments.map((att) => (
                                                                            <a
                                                                                key={att.id}
                                                                                href={`${STRAPI_URL}${att.url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1 text-xs hover:shadow-sm transition-all"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <span>{getFileIcon(att.mime)}</span>
                                                                                <span className="max-w-[120px] truncate">{att.name}</span>
                                                                                <span className="text-slate-400">({formatFileSize(att.size)})</span>
                                                                                <ExternalLink className="w-3 h-3 text-slate-400" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 pt-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-xs"
                                                                    onClick={(e) => { e.stopPropagation(); handleEdit(row.rawNote!); }}
                                                                >
                                                                    ✏️ Edit / Add Files
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>


        </Card>
    );
}
