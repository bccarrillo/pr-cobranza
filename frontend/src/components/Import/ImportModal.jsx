import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, X, FileSpreadsheet } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    // Nota: El backend espera 'tenant_id'. En un entorno real se tomaría del auth user, aquí simulamos.
    formData.append('tenant_id', 1); 

    setUploading(true);
    setError(null);

    try {
      await axios.post('/api/v1/imports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploading(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al subir el archivo.");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden transform transition-all">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-light-text-primary">Importar Cartera</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100 transition-colors">
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <UploadCloud size={40} className="text-light-blue mb-3" />
            <p className="text-sm font-medium text-light-text-primary text-center">
              {file ? file.name : "Haz clic o arrastra un archivo aquí"}
            </p>
            <p className="text-xs text-light-text-secondary mt-1">.CSV, .XLS o .XLSX (Máx. 10MB)</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-4 text-center font-medium">{error}</p>
          )}

          {file && !error && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-light-blue-soft rounded-lg">
              <FileSpreadsheet className="text-light-blue" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-blue truncate">{file.name}</p>
                <p className="text-xs text-light-blue/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              !file || uploading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-light-blue hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {uploading ? 'Procesando...' : 'Importar Datos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
