import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Upload, FileText, Image, Trash2, Eye } from 'lucide-react';
import PatientForm, { DoctorOption } from '@/components/PatientForm';
import { getDefaultPatientFormData, validatePatientFormData, PatientFormData } from '@/lib/patientSchema';
import { createPatient } from '@/lib/patientApi';
import { strapiGet } from '@/lib/strapiClient';
import { useUser } from '@/contexts/UserContext';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardiologists, setCardiologists] = useState<DoctorOption[]>([]);
  const [formData, setFormData] = useState<PatientFormData>(getDefaultPatientFormData());

  const [fileUploadData, setFileUploadData] = useState({
    fileName: '',
    category: 'General',
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([
    {
      id: 1,
      name: 'Initial_Assessment.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadDate: '2024-12-17',
      category: 'Assessment'
    },
    {
      id: 2,
      name: 'Patient_ID_Copy.jpg',
      type: 'image',
      size: '320 KB',
      uploadDate: '2024-12-17',
      category: 'Identification'
    }
  ]);

  const [reviewFile, setReviewFile] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let docs = await strapiGet<any>("/api/auth/doctor/all-doctors?specialty=Cardiology").catch(() => null);
        let list = Array.isArray(docs) ? docs : (docs?.doctors || docs?.data || []);
        
        // Fallback: If no Cardiology filtered doctors returned, load all doctors
        if (list.length === 0) {
          docs = await strapiGet<any>("/api/auth/doctor/all-doctors").catch(() => []);
          list = Array.isArray(docs) ? docs : (docs?.doctors || docs?.data || []);
        }

        setCardiologists(list);

        if (currentUser && (currentUser.role === 'Cardiology' || currentUser.role === 'Cardiologist')) {
          setFormData(prev => ({
            ...prev,
            primaryCardiologistDocId: prev.primaryCardiologistDocId || currentUser.documentId || String(currentUser.id)
          }));
        } else if (list.length > 0) {
          const firstVal = list[0].documentId || (list[0].id ? String(list[0].id) : '');
          setFormData(prev => ({
            ...prev,
            primaryCardiologistDocId: prev.primaryCardiologistDocId || firstVal
          }));
        }
      } catch (e) {
        console.warn("Failed to load cardiologists", e);
      }
    })();
  }, [currentUser]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Strict validation using shared schema validator
    const validation = validatePatientFormData(formData);
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    const doctorToken = localStorage.getItem("doctor_token");
    if (!doctorToken) {
      toast.error("Lütfen önce hekim olarak giriş yapın.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPatient({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),

        gender: formData.gender
          ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
          : undefined,

        dateOfBirth: formData.dateOfBirth || undefined,
        contactNumber: formData.contactNumber.trim(),
        phone: formData.contactNumber.trim(),
        email: formData.email?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        allowCaregiver: formData.allowCaregiver,
        statu: formData.statu || "New",

        clinicalFindings: formData.clinicalFindings,
        redFlagSymptoms: formData.redFlagSymptoms,

        assignedCardiologistDocId: formData.primaryCardiologistDocId || undefined,

        caregiver: formData.allowCaregiver ? {
          fullName: formData.caregiverName?.trim() || undefined,
          phone: formData.caregiverPhone.trim(),
          email: formData.caregiverEmail?.trim() || undefined,
          relationToPatient: "Caregiver",
        } : undefined,
      });

      toast.success("Hasta başarıyla kaydedildi!");
      navigate("/patients");
    } catch (e: any) {
      console.error(e);
      let errorMsg = e?.message || "";
      if (!errorMsg || errorMsg.includes("Failed to fetch") || errorMsg.includes("TypeError")) {
        errorMsg = "Sunucuya bağlanılamadı. Lütfen sunucunun açık ve erişilebilir olduğundan emin olun.";
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && fileUploadData.fileName.trim()) {
      Array.from(files).forEach(file => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: fileUploadData.fileName || file.name,
          type: file.type.includes('image') ? 'image' : 'pdf',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          category: fileUploadData.category,
          url: URL.createObjectURL(file)
        };
        setUploadedFiles(prev => [...prev, newFile]);
        setFileUploadData({ fileName: '', category: 'General' });
      });
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } else if (files && !fileUploadData.fileName.trim()) {
      toast.error('Please enter a file name before uploading.');
    }
  };

  // Handle file deletion
  const handleFileDelete = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('File deleted successfully!');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left" style={{ color: '#29a8b6' }}>
            ATTR-CM Patient Registration
          </h1>
        </div>

        {/* Render Unified Shared PatientForm Component */}
        <div className="mb-6 sm:mb-8">
          <PatientForm
            formData={formData}
            setFormData={setFormData}
            cardiologists={cardiologists}
            disabled={isSubmitting}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-3 sm:order-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Patient Files</DialogTitle>
              </DialogHeader>

              {/* File Upload Form */}
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={fileUploadData.fileName}
                      onChange={(e) => setFileUploadData(prev => ({ ...prev, fileName: e.target.value }))}
                      placeholder="Enter file name"
                      className="w-full rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={fileUploadData.category}
                      onChange={(e) => setFileUploadData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-300 rounded-xl bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Lab Results">Lab Results</option>
                      <option value="Imaging">Imaging</option>
                      <option value="Medical History">Medical History</option>
                      <option value="Photos">Photos</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Identification">Identification</option>
                      <option value="Reports">Reports</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-registration"
                  />
                  <label htmlFor="file-upload-registration" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-600">Click to upload files</p>
                      <p className="text-sm text-gray-500">Supports PDF, Images, Documents</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              <div className="max-h-96 overflow-y-auto border rounded-xl">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-gray-50">
                        <TableCell className="flex items-center space-x-2">
                          {file.type === 'image' ? (
                            <Image className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-red-500" />
                          )}
                          <span>{file.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${file.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                            {file.type.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{new Date(file.uploadDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{file.category}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewFile(file)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileDelete(file.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {uploadedFiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No files uploaded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-2 sm:order-2"
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-1 sm:order-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>

        {/* File Review Modal */}
        <Dialog open={reviewFile !== null} onOpenChange={(open) => !open && setReviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center pr-6">
                <span>Review File: {reviewFile?.name}</span>
                <span className="text-xs font-normal text-gray-500">({reviewFile?.category})</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto bg-slate-950/5 p-4 rounded-xl flex items-center justify-center min-h-[300px]">
              {reviewFile?.type === 'image' ? (
                <img
                  src={reviewFile?.url || "/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"}
                  alt={reviewFile?.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                reviewFile?.url ? (
                  <object
                    data={reviewFile.url}
                    type="application/pdf"
                    className="w-full h-[60vh]"
                  >
                    <div className="text-center p-6 space-y-4">
                      <p className="text-gray-600">Your browser does not support inline PDF viewing.</p>
                      <Button asChild>
                        <a href={reviewFile.url} download={reviewFile.name}>
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </object>
                ) : (
                  <div className="text-center p-8 space-y-4 max-w-md bg-white rounded-2xl shadow-sm border border-slate-100">
                    <FileText className="w-16 h-16 mx-auto text-red-400" />
                    <h3 className="font-semibold text-lg text-slate-800">{reviewFile?.name}</h3>
                    <p className="text-sm text-slate-500">
                      Sample document preview.
                    </p>
                  </div>
                )
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
              <Button variant="outline" onClick={() => setReviewFile(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

// React Error Boundary Class for Patient Registration
class PatientRegistrationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PatientRegistration error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="container mx-auto p-6 text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Hasta Kayıt Formu</h2>
              <p className="text-slate-500 text-sm mb-6">
                Sayfa yüklenirken bir güncelleme oluştu. Yenile butonuna basarak hasta kayıt formunu yükleyebilirsiniz.
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-[#089bab] hover:bg-[#06767f] text-white rounded-xl px-6 h-11"
              >
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </Layout>
      );
    }
    return this.props.children;
  }
}

export default function PatientRegistrationWrapped() {
  return (
    <PatientRegistrationErrorBoundary>
      <PatientRegistration />
    </PatientRegistrationErrorBoundary>
  );
}
