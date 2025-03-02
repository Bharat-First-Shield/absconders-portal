import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { addCriminal } from '../services/mongodb';
import toast from 'react-hot-toast';
import { Printer, Upload, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export function CaseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [documents, setDocuments] = React.useState<File[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const addCaseMutation = useMutation({
    mutationFn: (data: any) => {
      setIsSubmitting(true);
      
      // Ensure all required fields are present
      const requiredFields = ['firNumber', 'name', 'age', 'fatherName', 'gender', 'address'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        setIsSubmitting(false);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Add user data
      const enrichedData = {
        ...data,
        createdBy: user?.id,
        state: user?.state || 'Maharashtra',
        district: user?.district || 'Mumbai',
        policeStation: user?.policeStation || 'Central'
      };
      
      return addCriminal(enrichedData);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success('Case added successfully');
      navigate('/cases');
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(error instanceof Error ? error.message : 'Failed to add case');
      console.error('Error adding case:', error);
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    const element = formRef.current;
    if (!element) return;

    const opt = {
      margin: 1,
      filename: 'absconder-case-form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const onSubmit = (data: any) => {
    try {
      // Validate required fields
      const requiredFields = ['firNumber', 'name', 'age', 'fatherName', 'gender', 'address'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Create FormData object
      const formData = new FormData();
      
      // Add basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photo' && key !== 'documents') {
          formData.append(key, value as string);
        }
      });
      
      // Add photo if available
      if (data.photo && data.photo[0]) {
        formData.append('photo', data.photo[0]);
      }
      
      // Add documents
      documents.forEach(doc => {
        formData.append('documents', doc);
      });
      
      // Add warrant data
      if (data['warrants[0].details'] && data['warrants[0].court'] && data['warrants[0].caseNumber']) {
        const warrant = {
          details: data['warrants[0].details'],
          court: data['warrants[0].court'],
          caseNumber: data['warrants[0].caseNumber'],
          issuedDate: new Date(),
          isActive: true
        };
        formData.append('warrants', JSON.stringify([warrant]));
      }
      
      // Add ID proof data
      if (data['idProof.type'] && data['idProof.number']) {
        const idProof = {
          type: data['idProof.type'],
          number: data['idProof.number']
        };
        formData.append('idProof', JSON.stringify(idProof));
      }
      
      // Add state, district, and police station
      formData.append('state', user?.state || 'Maharashtra');
      formData.append('district', user?.district || 'Mumbai');
      formData.append('policeStation', user?.policeStation || 'Central');
      
      // Submit the form
      addCaseMutation.mutate(formData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      console.error('Form submission error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6">Add New Case</h1>
      
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            {photoPreview ? (
              <div className="relative w-32 h-32">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <span className="mt-2 block text-sm text-gray-500">Add Photo</span>
                </div>
                <input
                  type="file"
                  {...register('photo')}
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">FIR Number <span className="text-red-500">*</span></label>
            <input
              {...register('firNumber', { required: 'FIR number is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.firNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.firNumber.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              {...register('age', { required: 'Age is required', min: 0 })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Father's Name <span className="text-red-500">*</span></label>
            <input
              {...register('fatherName', { required: "Father's name is required" })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.fatherName && (
              <p className="text-red-500 text-sm mt-1">{errors.fatherName.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender <span className="text-red-500">*</span></label>
            <select
              {...register('gender', { required: 'Gender is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address <span className="text-red-500">*</span></label>
            <textarea
              {...register('address', { required: 'Address is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              rows={3}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID Proof Type <span className="text-red-500">*</span></label>
            <select
              {...register('idProof.type', { required: 'ID proof type is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            >
              <option value="">Select ID Type</option>
              <option value="aadhar">Aadhar</option>
              <option value="pan">PAN</option>
              <option value="voter">Voter ID</option>
            </select>
            {errors.idProof?.type && (
              <p className="text-red-500 text-sm mt-1">{errors.idProof.type.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID Number <span className="text-red-500">*</span></label>
            <input
              {...register('idProof.number', { required: 'ID number is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.idProof?.number && (
              <p className="text-red-500 text-sm mt-1">{errors.idProof.number.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Identifiable Marks</label>
            <textarea
              {...register('identifiableMarks')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              placeholder="Enter identifiable marks (one per line)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Warrant Details <span className="text-red-500">*</span></label>
            <textarea
              {...register('warrants[0].details', { required: 'Warrant details are required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
              rows={3}
            />
            {errors.warrants?.[0]?.details && (
              <p className="text-red-500 text-sm mt-1">{errors.warrants[0].details.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Court <span className="text-red-500">*</span></label>
            <input
              {...register('warrants[0].court', { required: 'Court name is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.warrants?.[0]?.court && (
              <p className="text-red-500 text-sm mt-1">{errors.warrants[0].court.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Case Number <span className="text-red-500">*</span></label>
            <input
              {...register('warrants[0].caseNumber', { required: 'Case number is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 transition-colors"
            />
            {errors.warrants?.[0]?.caseNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.warrants[0].caseNumber.message as string}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Documents</label>
            <div className="mt-2 space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm truncate">{doc.name}</span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="relative">
                <input
                  type="file"
                  onChange={handleDocumentChange}
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload documents</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Form
          </motion.button>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/cases')}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting || addCaseMutation.isPending}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-colors"
            >
              {isSubmitting || addCaseMutation.isPending ? 'Adding...' : 'Add Case'}
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}