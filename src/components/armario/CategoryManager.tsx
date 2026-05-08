import { useState } from 'react'
import Modal from '@/components/shared/Modal'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { Pencil, Plus, Trash2, Check, X } from 'lucide-react'

const COLORS = ['#a855f7', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6']

export default function CategoryManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const del = useDeleteCategory()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(COLORS[0])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newName.trim()) return
    await create.mutateAsync({ user_id: user.id, name: newName.trim(), color: newColor })
    setNewName('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Categorías">
      <div className="space-y-4">
        <form onSubmit={handleAdd} className="card p-3 space-y-2">
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Nueva categoría" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn-primary"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setNewColor(c)}
                className="w-7 h-7 rounded-full border-2"
                style={{ background: c, borderColor: newColor === c ? '#1f2937' : 'transparent' }}
              />
            ))}
          </div>
        </form>

        <ul className="divide-y divide-gray-100">
          {categories.map((cat) => {
            const editing = editingId === cat.id
            return (
              <li key={cat.id} className="py-2.5 flex items-center gap-2">
                {editing ? (
                  <>
                    <input className="input flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <div className="flex gap-1">
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setEditColor(c)}
                          className="w-5 h-5 rounded-full border"
                          style={{ background: c, borderColor: editColor === c ? '#1f2937' : 'transparent' }}
                        />
                      ))}
                    </div>
                    <button onClick={async () => {
                      await update.mutateAsync({ id: cat.id, name: editName, color: editColor })
                      setEditingId(null)
                    }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full" style={{ background: cat.color }} />
                    <span className="flex-1">{cat.name}</span>
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color) }}
                      className="p-2 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-600" /></button>
                    <button onClick={async () => { if (confirm(`¿Eliminar "${cat.name}"?`)) await del.mutateAsync(cat.id) }}
                      className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </Modal>
  )
}
