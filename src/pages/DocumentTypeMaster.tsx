import { useState, useEffect } from 'react';
import { DocumentType } from '../lib/supabase';
import { initialDocumentTypes } from '../data/documentTypes';
import Modal from '../components/Modal';
import '../styles/DocumentTypeMaster.css';

const STORAGE_KEY = 'document_types';

const getDocumentsFromStorage = (): DocumentType[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Load initial dummy data if localStorage is empty
  saveDocumentsToStorage(initialDocumentTypes);
  return initialDocumentTypes;
};

const saveDocumentsToStorage = (documents: DocumentType[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function DocumentTypeMaster() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Active' | 'Inactive'>('Active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchText, activeFilter]);

  const loadDocuments = () => {
    setLoading(true);
    // Load from localStorage (which includes initial dummy data on first load)
    const data = getDocumentsFromStorage();
    const sortedData = data.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setDocuments(sortedData);
    setLoading(false);
  };

  const filterDocuments = () => {
    let filtered = documents.filter(doc =>
      activeFilter === 'Active' ? doc.is_active : !doc.is_active
    );

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(search) ||
        doc.description.toLowerCase().includes(search)
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleAdd = () => {
    setSelectedDoc(null);
    setFormData({ name: '', description: '', isActive: true });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setFormData({ name: doc.name, description: doc.description, isActive: doc.is_active });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const allDocs = getDocumentsFromStorage();
    const currentUser = 'admin';

    if (selectedDoc) {
      const nameExists = allDocs.some(
        doc => doc.name.toLowerCase() === formData.name.toLowerCase() && doc.id !== selectedDoc.id
      );

      if (nameExists) {
        setError('Name must be unique');
        return;
      }

      const updatedDocs = allDocs.map(doc =>
        doc.id === selectedDoc.id
          ? {
              ...doc,
              name: formData.name,
              description: formData.description,
              is_active: formData.isActive,
              updated_at: new Date().toISOString(),
              updated_by: currentUser
            }
          : doc
      );

      saveDocumentsToStorage(updatedDocs);
    } else {
      const nameExists = allDocs.some(
        doc => doc.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (nameExists) {
        setError('Name must be unique');
        return;
      }

      const newDoc: DocumentType = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        is_active: formData.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: currentUser,
        updated_by: currentUser
      };

      allDocs.push(newDoc);
      saveDocumentsToStorage(allDocs);
    }

    setIsModalOpen(false);
    loadDocuments();
  };

  return (
    <div className="doc-type-master">
      <div className="search-filters">
        <button className="btn-primary" onClick={handleAdd}>
          Add
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="filter-dropdown"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as 'Active' | 'Inactive')}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className={!doc.is_active ? 'inactive-row' : ''}>
                  <td>{doc.name}</td>
                  <td>{doc.description}</td>
                  <td>
                    <span className={`status-badge ${doc.is_active ? 'status-active' : 'status-inactive'}`}>
                      {doc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => handleEdit(doc)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={4} className="no-data">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDoc ? 'Edit Document Type' : 'Add Document Type'}
      >
        <div className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter document type name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              rows={4}
            />
          </div>
          <div className="form-group checkbox-group">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Active</label>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {selectedDoc ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
