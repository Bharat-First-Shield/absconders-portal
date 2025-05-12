import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { addCriminal } from '../services/criminalService';
import { AlertCircle, Upload, X, MapPin } from 'lucide-react';

interface FormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  fatherName: string;
  address: string;
  firNumber: string;
  idProofType: 'aadhar' | 'pan' | 'voter';
  idProofNumber: string;
  identifiableMarks: string[];
  warrantDetails?: string;
  warrantCourt?: string;
  warrantCaseNumber?: string;
  state: string;
  district: string;
  taluka: string;
}

export function CaseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: 'male',
    fatherName: '',
    address: '',
    firNumber: '',
    idProofType: 'aadhar',
    idProofNumber: '',
    identifiableMarks: [''],
    state: '',
    district: '',
    taluka: '',
    policeStation: user?.policeStation || ''
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleIdentifiableMarkChange = (index: number, value: string) => {
    const newMarks = [...formData.identifiableMarks];
    newMarks[index] = value;
    setFormData(prev => ({ ...prev, identifiableMarks: newMarks }));
  };

  const addIdentifiableMark = () => {
    setFormData(prev => ({
      ...prev,
      identifiableMarks: [...prev.identifiableMarks, '']
    }));
  };

  const removeIdentifiableMark = (index: number) => {
    setFormData(prev => ({
      ...prev,
      identifiableMarks: prev.identifiableMarks.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newDocs]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.firNumber.trim()) newErrors.firNumber = 'FIR number is required';
    if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID proof number is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.taluka.trim()) newErrors.taluka = 'Taluka is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'identifiableMarks') {
          formDataToSend.append('identifiableMarks', JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add user's police station
      if (user) {
        formDataToSend.append('policeStation', user.policeStation || '');
      }
      
      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      // Add documents
      documents.forEach(doc => {
        formDataToSend.append('documents', doc);
      });

      const response = await addCriminal(formDataToSend);
      
      if (response?.id) {
        toast.success('Criminal record added successfully');
        navigate('/cases');
      } else {
        throw new Error('Failed to add criminal record: Invalid response format');
      }
    } catch (error: any) {
      if (error.message === 'Network Error') {
        toast.error('Network error: Please check your connection and try again');
      } else if (error.response?.status === 413) {
        toast.error('Files are too large. Please reduce the size of images/documents');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again');
        navigate('/login');
      } else {
        toast.error(`Error: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {id ? 'Edit Criminal Record' : 'Add New Criminal Record'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.age
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter age"
                min="0"
                max="150"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-500">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.fatherName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter father's name"
              />
              {errors.fatherName && (
                <p className="mt-1 text-sm text-red-500">{errors.fatherName}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.address
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter complete address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Case Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                FIR Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firNumber"
                value={formData.firNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.firNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter FIR number"
              />
              {errors.firNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.firNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                ID Proof Type <span className="text-red-500">*</span>
              </label>
              <select
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              >
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="voter">Voter ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                ID Proof Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.idProofNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter ID proof number"
              />
              {errors.idProofNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.idProofNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.state
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.district
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter district"
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-500">{errors.district}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Taluka <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="taluka"
                value={formData.taluka}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.taluka
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } dark:bg-gray-700 transition-colors`}
                placeholder="Enter taluka"
              />
              {errors.taluka && (
                <p className="mt-1 text-sm text-red-500">{errors.taluka}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Identifiable Marks
            </label>
            {formData.identifiableMarks.map((mark, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={mark}
                  onChange={(e) => handleIdentifiableMarkChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                  placeholder="Enter identifiable mark"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeIdentifiableMark(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIdentifiableMark}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              + Add another mark
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Warrant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Warrant Details
              </label>
              <textarea
                name="warrantDetails"
                value={formData.warrantDetails}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                placeholder="Enter warrant details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Court
              </label>
              <input
                type="text"
                name="warrantCourt"
                value={formData.warrantCourt}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                placeholder="Enter court name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Case Number
              </label>
              <input
                type="text"
                name="warrantCaseNumber"
                value={formData.warrantCaseNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
                placeholder="Enter case number"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Photos & Documents</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Photos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Documents
              </label>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm truncate">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload document</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}