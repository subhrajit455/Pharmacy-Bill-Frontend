import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1e4670');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesApi.getAll();
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setColor('#1e4670');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || '#1e4670');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingCat) {
        await categoriesApi.update(editingCat._id, { name: name.trim(), description, color });
      } else {
        await categoriesApi.create({ name: name.trim(), description, color });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      try {
        await categoriesApi.delete(id);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <Tags className="w-5 h-5 sm:w-6 sm:h-6 text-navy-800" />
            <span>Drug & Product Categories</span>
          </h2>
          <p className="text-xs text-navy-700/70 mt-0.5">
            Organize pharmaceuticals by formulations (Tablets, Syrups, Injections, Ointments, Devices, etc.)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-beige-50 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer border border-navy-700 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-beige-300" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: cat.color || '#1e4670' }}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-navy-950 text-base">{cat.name}</h3>
                  <span
                    style={{ backgroundColor: `${cat.color || '#1e4670'}20`, color: cat.color || '#153354' }}
                    className="text-xs font-black px-2.5 py-0.5 rounded-full"
                  >
                    {cat.itemCount || 0} items
                  </span>
                </div>
                <p className="text-xs text-navy-600 line-clamp-2 min-h-[32px]">
                  {cat.description || 'General pharmaceutical category dosage form'}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-beige-200 flex justify-end gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-navy-700 hover:text-navy-950 hover:bg-beige-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="p-1.5 text-navy-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-beige-50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-beige-200">
            <div className="p-4 border-b border-beige-200 flex justify-between items-center bg-beige-100">
              <h3 className="font-extrabold text-navy-950 text-sm">
                {editingCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400 hover:text-navy-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-navy-900 block mb-1">
                  Category Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Syrups, Injections, Ointments"
                  className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-bold focus:outline-navy-700 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dosage form or classification details..."
                  className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-medium focus:outline-navy-700 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Tag Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-8 rounded-lg border border-beige-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-beige-300 font-mono font-bold text-navy-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-navy-700 hover:bg-beige-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-beige-50 font-black rounded-xl border border-navy-700 shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
