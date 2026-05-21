import { useState } from 'react'
import { Pencil, Plus, Trash2, Check, X } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/components/shared/ConfirmModal'
import {
  useWishlistFolders,
  useCreateWishlistFolder,
  useDeleteWishlistFolder,
  useUpdateWishlistFolder,
} from '@/hooks/useWishlistFolders'

const COLORS = ['#FF5771', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']

export default function WishlistFoldersManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const { data: folders = [] } = useWishlistFolders()
  const create = useCreateWishlistFolder()
  const update = useUpdateWishlistFolder()
  const del = useDeleteWishlistFolder()
  const confirm = useConfirm()

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
    <Modal open={open} onClose={onClose} title="Listas de deseos">
      <div className="space-y-4">
        <form onSubmit={handleAdd} className="card p-3 space-y-2">
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Nueva lista (Verano, Regalos…)" value={newName} onChange={(e) => setNewName(e.target.value)} />
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

        {folders.length === 0 && (
          <p className="text-sm text-muted text-center py-4">Aún no tienes listas. Crea la primera arriba.</p>
        )}

        <ul className="divide-y divide-line-soft">
          {folders.map((f) => {
            const editing = editingId === f.id
            return (
              <li key={f.id} className="py-2.5 flex items-center gap-2">
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
                      await update.mutateAsync({ id: f.id, name: editName, color: editColor })
                      setEditingId(null)
                    }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-surface-soft rounded-lg"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full" style={{ background: f.color }} />
                    <span className="flex-1 font-medium">{f.name}</span>
                    <button onClick={() => { setEditingId(f.id); setEditName(f.name); setEditColor(f.color) }}
                      className="p-2 hover:bg-surface-soft rounded-lg"><Pencil className="w-4 h-4 text-muted" /></button>
                    <button
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Eliminar lista',
                          message: `Vas a borrar la lista "${f.name}" y TODOS los deseos que contenga. Esta acción no se puede deshacer.`,
                          confirmText: 'Eliminar',
                          destructive: true,
                        })
                        if (ok) await del.mutateAsync(f.id)
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" />
                    </button>
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
