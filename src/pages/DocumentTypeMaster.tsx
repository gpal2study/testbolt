import { useState } from 'react';
import { DocumentType } from '../types';
import Modal from '../components/Modal';
import '../styles/DocumentTypeMaster.css';

const initialData: DocumentType[] = [
  {
    id: 1,
    name: 'Prototype',
    description: 'Regulatory docs for approvals'
  },
  {
    id: 2,
    name: 'Clinical Trial Report',
    description: 'Clinical study reporting'
  }
];

export default function DocumentTypeMaster() {
  const [documents, setDocuments] = useState<DocumentType[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ name: '', description: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (doc: DocumentType) => {
    setModalMode('edit');
    setSelectedDoc(doc);
    setFormData({ name: doc.name, description: doc.description });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = (doc: DocumentType) => {
    setModalMode('delete');
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const validateUniqueName = (name: string, excludeId?: number): boolean => {
    return !documents.some(doc =>
      doc.name.toLowerCase() === name.toLowerCase() && doc.id !== excludeId
    );
  };

  const handleSubmit = () => {
    if (modalMode === 'delete') {
      setDocuments(documents.filter(doc => doc.id !== selectedDoc?.id));
      setIsModalOpen(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const excludeId = modalMode === 'edit' ? selectedDoc?.id : undefined;
    if (!validateUniqueName(formData.name, excludeId)) {
      setError('Name must be unique');
      return;
    }

    if (modalMode === 'add') {
      const newId = Math.max(...documents.map(d => d.id), 0) + 1;
      setDocuments([...documents, { id: newId, ...formData }]);
    } else if (modalMode === 'edit' && selectedDoc) {
      setDocuments(documents.map(doc =>
        doc.id === selectedDoc.id ? { ...doc, ...formData } : doc
      ));
    }

    setIsModalOpen(false);
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'add': return 'Add Document Type';
      case 'edit': return 'Edit Document Type';
      case 'delete': return 'Delete Document Type';
    }
  };

  return (
    <div className="doc-type-master">
      <div className="page-header">
        <h1>Document Type Master</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add New
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{doc.id}</td>
                <td>{doc.name}</td>
                <td>{doc.description}</td>
                <td>
                  <button className="btn-action" onClick={() => handleEdit(doc)}>
                    Edit
                  </button>
                  <button className="btn-action btn-danger" onClick={() => handleDelete(doc)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
      >
        {modalMode === 'delete' ? (
          <div className="modal-delete">
            <p>Are you sure you want to delete "{selectedDoc?.name}"?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleSubmit}>
                Delete
              </button>
            </div>
          </div>
        ) : (
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
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                {modalMode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
