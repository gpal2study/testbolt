import { useState, useEffect } from 'react';
import { supabase, DocumentType } from '../lib/supabase';
import Modal from '../components/Modal';
import '../styles/DocumentTypeMaster.css';

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
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchText, activeFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('document_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments(data || []);
    }
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

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (selectedDoc) {
      const { error: updateError } = await supabase
        .from('document_types')
        .update({
          name: formData.name,
          description: formData.description,
          is_active: formData.isActive,
          updated_by: user?.id
        })
        .eq('id', selectedDoc.id);

      if (updateError) {
        if (updateError.code === '23505') {
          setError('Name must be unique');
        } else {
          setError('Error updating document type');
        }
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('document_types')
        .insert({
          name: formData.name,
          description: formData.description,
          is_active: formData.isActive,
          created_by: user?.id,
          updated_by: user?.id
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Name must be unique');
        } else {
          setError('Error creating document type');
        }
        return;
      }
    }

    setIsModalOpen(false);
    fetchDocuments();
  };

  return (
    <div className="doc-type-master">
      <div className="page-header">
        <h1>Document Type Master</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add New
        </button>
      </div>

      <div className="search-filters">
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
