import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { strapiGet, strapiPost } from '@/lib/strapiClient';
import {
    Loader2, FileText, Upload, CheckCircle2, Clock,
    Stethoscope, Microscope, Atom, Dna, Paperclip, X, ExternalLink
} from 'lucide-react';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

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

const specialtyConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    Cardiology: { icon: <Stethoscope className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-200', label: 'Cardiology' },
    Hematology: { icon: <Microscope className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Hematology' },
    NuclearMedicine: { icon: <Atom className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Nuclear Medicine' },
    Genetics: { icon: <Dna className="w-4 h-4" />, color: 'text-green-600 bg-green-50 border-green-200', label: 'Genetics' },
};

type Props = {
    patientDocumentId: string;
    currentDoctorSpecialty?: string;
};

export default function SpecialistNotes({ patientDocumentId, currentDoctorSpecialty }: Props) {
    const [notes, setNotes] = useState<SpecialistNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // New note form
    const [showForm, setShowForm] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formFindings, setFormFindings] = useState('');
    const [formStatus, setFormStatus] = useState<'pending' | 'completed'>('pending');

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        loadNotes();
    }, [patientDocumentId]);

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        try {
            let findingsJson: any = {};
            if (formFindings.trim()) {
                try {
                    findingsJson = JSON.parse(formFindings);
                } catch {
                    findingsJson = { summary: formFindings };
                }
            }

            await strapiPost('/api/auth/doctor/specialist-notes', {
                patientDocumentId,
                noteDocumentId: editingNoteId || undefined,
                title: formTitle,
                findings: findingsJson,
                notes: formNotes,
                status: formStatus,
            });

            toast.success(editingNoteId ? 'Note updated!' : 'Note created!');
            setShowForm(false);
            setEditingNoteId(null);
            setFormTitle('');
            setFormNotes('');
            setFormFindings('');
            setFormStatus('pending');
            await loadNotes();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (note: SpecialistNote) => {
        setEditingNoteId(note.documentId);
        setFormTitle(note.title || '');
        setFormNotes(note.notes || '');
        setFormFindings(note.findings ? JSON.stringify(note.findings, null, 2) : '');
        setFormStatus(note.status || 'pending');
        setShowForm(true);
    };

    const handleUpload = async (noteDocumentId: string, files: FileList) => {
        setUploading(noteDocumentId);
        try {
            const formData = new FormData();
            formData.append('noteDocumentId', noteDocumentId);
            for (let i = 0; i < files.length; i++) {
                formData.append('file', files[i]);
            }

            const token = localStorage.getItem('doctor_token');
            const res = await fetch(`${STRAPI_URL}/api/auth/doctor/upload-note-attachment`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            toast.success('File uploaded!');
            await loadNotes();
        } catch (e: any) {
            toast.error(e?.message || 'Upload failed');
        } finally {
            setUploading(null);
        }
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

    if (loading) {
        return (
            <Card className="rounded-2xl mt-6">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-cyan-500" />
                    <span className="text-slate-500">Loading specialist notes...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    Specialist Notes & Attachments
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{notes.length} note(s)</Badge>
                    <Button
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl"
                        onClick={() => {
                            setEditingNoteId(null);
                            setFormTitle('');
                            setFormNotes('');
                            setFormFindings('');
                            setFormStatus('pending');
                            setShowForm(!showForm);
                        }}
                    >
                        {showForm ? 'Cancel' : '+ Add Note'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* New/Edit note form */}
                {showForm && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3 border border-slate-200">
                        <div className="text-sm font-semibold text-slate-700 mb-2">
                            {editingNoteId ? '✏️ Edit Note' : '📝 New Specialist Note'}
                        </div>
                        <Input
                            placeholder="Title (e.g. Hematology Assessment)"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Findings (free text or JSON) — e.g. scintigraphy results, AL discrimination tests, gene mutation..."
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
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formStatus === 'pending'}
                                    onChange={() => setFormStatus('pending')}
                                />
                                <Clock className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Pending</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formStatus === 'completed'}
                                    onChange={() => setFormStatus('completed')}
                                />
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
                            {editingNoteId ? 'Update Note' : 'Save Note'}
                        </Button>
                    </div>
                )}

                {/* Notes list */}
                {notes.length === 0 && !showForm ? (
                    <div className="text-center text-slate-400 py-6">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No specialist notes yet. Click &quot;+ Add Note&quot; to create one.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.map((note) => {
                            const config = specialtyConfig[note.specialty] || specialtyConfig.Cardiology;
                            return (
                                <div
                                    key={note.documentId}
                                    className={`border-2 rounded-xl p-4 ${config.color}`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {config.icon}
                                            <span className="font-semibold text-sm">{config.label}</span>
                                            <Badge
                                                variant={note.status === 'completed' ? 'default' : 'outline'}
                                                className={`text-xs ${note.status === 'completed' ? 'bg-green-500 text-white' : ''}`}
                                            >
                                                {note.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                                            </Badge>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleEdit(note)}>
                                            ✏️ Edit
                                        </Button>
                                    </div>

                                    {/* Title & Doctor */}
                                    <div className="text-sm font-medium text-slate-800 mb-1">{note.title}</div>
                                    {note.doctor && (
                                        <div className="text-xs text-slate-500 mb-2">
                                            By: {note.doctor.fullName} ({note.doctor.specialty})
                                            {note.createdAt && ` • ${new Date(note.createdAt).toLocaleDateString('tr-TR')}`}
                                        </div>
                                    )}

                                    {/* Findings */}
                                    {note.findings && Object.keys(note.findings).length > 0 && (
                                        <div className="bg-white/80 rounded-lg p-3 mb-2 text-xs">
                                            <div className="font-semibold text-slate-600 mb-1">Findings:</div>
                                            {typeof note.findings === 'object' && note.findings.summary ? (
                                                <p className="text-slate-700">{note.findings.summary}</p>
                                            ) : (
                                                <pre className="whitespace-pre-wrap text-slate-700">
                                                    {JSON.stringify(note.findings, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {note.notes && (
                                        <div className="text-sm text-slate-700 mb-2">
                                            <span className="font-medium">Notes: </span>{note.notes}
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {note.attachments && note.attachments.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                                <Paperclip className="w-3 h-3" /> Attachments ({note.attachments.length})
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {note.attachments.map((att) => (
                                                    <a
                                                        key={att.id}
                                                        href={`${STRAPI_URL}${att.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1 text-xs hover:shadow-sm transition-all"
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

                                    {/* Upload button */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi,.webm"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    handleUpload(note.documentId, e.target.files);
                                                }
                                                e.target.value = '';
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs rounded-lg"
                                            disabled={uploading === note.documentId}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {uploading === note.documentId ? (
                                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                            ) : (
                                                <Upload className="w-3 h-3 mr-1" />
                                            )}
                                            Upload File
                                        </Button>
                                        <span className="text-[10px] text-slate-400">
                                            PDF, Excel, Word, Image, Video
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
