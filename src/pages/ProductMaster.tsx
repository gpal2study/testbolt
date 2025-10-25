import { useState, useEffect } from 'react';
import { Product } from '../types';
import { initialProducts } from '../data/products';
import Modal from '../components/Modal';
import '../styles/ProductMaster.css';

const STORAGE_KEY = 'products';

const getProductsFromStorage = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  saveProductsToStorage(initialProducts);
  return initialProducts;
};

const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const generateId = (): number => {
  const products = getProductsFromStorage();
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

export default function ProductMaster() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    productType: '' as Product['productType'] | '',
    productCode: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    productType: 'All',
    productCode: '',
    productName: '',
    description: '',
    isActive: 'Active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filters]);

  const loadProducts = () => {
    setLoading(true);
    const data = getProductsFromStorage();
    const sortedData = data.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setProducts(sortedData);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = products.filter(product =>
      filters.isActive === 'Active' ? product.isActive : !product.isActive
    );

    if (filters.productType !== 'All') {
      filtered = filtered.filter(product => product.productType === filters.productType);
    }

    if (filters.productCode.trim()) {
      const search = filters.productCode.toLowerCase();
      filtered = filtered.filter(product =>
        product.productCode.toLowerCase().includes(search)
      );
    }

    if (filters.productName.trim()) {
      const search = filters.productName.toLowerCase();
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(search)
      );
    }

    if (filters.description.trim()) {
      const search = filters.description.toLowerCase();
      filtered = filtered.filter(product =>
        product.description.toLowerCase().includes(search)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormData({
      productName: '',
      productType: '',
      productCode: '',
      description: '',
      isActive: true
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productName: product.productName,
      productType: product.productType,
      productCode: product.productCode,
      description: product.description,
      isActive: product.isActive
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleBack = () => {
    const hasChanges = selectedProduct
      ? formData.productName !== selectedProduct.productName ||
        formData.productType !== selectedProduct.productType ||
        formData.productCode !== selectedProduct.productCode ||
        formData.description !== selectedProduct.description ||
        formData.isActive !== selectedProduct.isActive
      : formData.productName !== '' ||
        formData.productType !== '' ||
        formData.productCode !== '' ||
        formData.description !== '';

    if (hasChanges) {
      if (window.confirm('All changes will be removed. Are you sure you want to go back?')) {
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.productName.trim()) {
      return 'Product name is required';
    }

    if (formData.productName.length > 100) {
      return 'Product name exceeds 100 characters';
    }

    if (!formData.productType) {
      return 'Product type is required';
    }

    if (formData.productCode && formData.productCode.length > 15) {
      return 'Product code exceeds 15 characters';
    }

    if (formData.description && formData.description.length > 500) {
      return 'Description exceeds 500 characters';
    }

    const allProducts = getProductsFromStorage();
    const nameExists = allProducts.some(
      product =>
        product.productName.toLowerCase() === formData.productName.toLowerCase() &&
        product.id !== selectedProduct?.id
    );

    if (nameExists) {
      return 'Product name already exists (case-insensitive match)';
    }

    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const allProducts = getProductsFromStorage();
    const currentUser = 'admin';

    if (selectedProduct) {
      const updatedProducts = allProducts.map(product =>
        product.id === selectedProduct.id
          ? {
              ...product,
              productName: formData.productName,
              productType: formData.productType as Product['productType'],
              productCode: formData.productCode,
              description: formData.description,
              isActive: formData.isActive,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser
            }
          : product
      );

      saveProductsToStorage(updatedProducts);
    } else {
      const newProduct: Product = {
        id: generateId(),
        productName: formData.productName,
        productType: formData.productType as Product['productType'],
        productCode: formData.productCode,
        description: formData.description,
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser,
        updatedBy: currentUser
      };

      allProducts.push(newProduct);
      saveProductsToStorage(allProducts);
    }

    setIsModalOpen(false);
    loadProducts();
  };

  return (
    <div className="product-master">
      <div className="search-filters">
        <button className="btn-primary" onClick={handleAdd}>
          Add
        </button>

        <div className="filter-row">
          <select
            className="filter-dropdown"
            value={filters.productType}
            onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
          >
            <option value="All">All</option>
            <option value="Small Molecule">Small Molecule</option>
            <option value="Biologic">Biologic</option>
            <option value="Device">Device</option>
            <option value="Combination">Combination</option>
          </select>

          <input
            type="text"
            className="filter-input"
            placeholder="Product Code"
            value={filters.productCode}
            onChange={(e) => setFilters({ ...filters, productCode: e.target.value })}
          />

          <input
            type="text"
            className="filter-input"
            placeholder="Product Name"
            value={filters.productName}
            onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
          />

          <select
            className="filter-dropdown status-filter"
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-row-full">
          <input
            type="text"
            className="filter-input-full"
            placeholder="Description"
            value={filters.description}
            onChange={(e) => setFilters({ ...filters, description: e.target.value })}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Type</th>
                <th>Product Code</th>
                <th>Product Name</th>
                <th>Description</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className={!product.isActive ? 'inactive-row' : ''}>
                  <td>{product.productType}</td>
                  <td>{product.productCode}</td>
                  <td>{product.productName}</td>
                  <td>{product.description}</td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => handleEdit(product)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="no-data">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleBack}
        title={selectedProduct ? 'Product Master - Update' : 'Product Master - Add'}
      >
        <div className="modal-form">
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              id="productName"
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="Enter product name"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="productType">Product Type *</label>
            <select
              id="productType"
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value as Product['productType'] })}
            >
              <option value="">Select product type</option>
              <option value="Small Molecule">Small Molecule</option>
              <option value="Biologic">Biologic</option>
              <option value="Device">Device</option>
              <option value="Combination">Combination</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="productCode">Product Code</label>
            <input
              id="productCode"
              type="text"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              placeholder="Enter product code"
              maxLength={15}
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
              maxLength={500}
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
            <button className="btn-secondary" onClick={handleBack}>
              Back
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
