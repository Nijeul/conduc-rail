'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { COULEURS_TYPE_MATERIEL } from '../materiel/constants'
import { getSVGMateriel } from '@/lib/materiel-svgs'

interface Vehicule {
  id: string
  type: string
  designation: string
  nombre: number
}

interface RameVisualProps {
  vehicules: Vehicule[]
  selectedIdx: number | null
  onSelect: (idx: number | null) => void
  /** Réorganisation par glisser-déposer (index source → index cible) */
  onReorder?: (from: number, to: number) => void
}

function WagonSortable({
  v,
  isSelected,
  onSelect,
  dragEnabled,
}: {
  v: Vehicule
  isSelected: boolean
  onSelect: () => void
  dragEnabled: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: v.id, disabled: !dragEnabled })

  const bgColor = COULEURS_TYPE_MATERIEL[v.type] || '#5A5A5A'
  const nombre = v.nombre || 1
  const svgContent = getSVGMateriel(v.type, v.designation)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`relative flex flex-col items-center cursor-grab active:cursor-grabbing transition-all shrink-0 ${
        isSelected ? 'ring-2 ring-[#003370] ring-offset-1 rounded' : ''
      }`}
      style={{
        width: '130px',
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        opacity: isDragging ? 0.85 : undefined,
        touchAction: 'none',
      }}
      title="Glisser pour déplacer le véhicule dans la rame"
    >
      {/* SVG ou fallback colore */}
      <div
        className="relative rounded overflow-hidden"
        style={{ width: '130px', height: '80px' }}
      >
        {svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center bg-white/5"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center rounded"
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-white text-[10px] font-bold leading-tight">
              {v.type}
            </span>
          </div>
        )}

        {/* Badge xN en haut a droite */}
        {nombre > 1 && (
          <div
            className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white text-[10px] font-bold"
            style={{
              backgroundColor: '#004489',
              minWidth: '22px',
              height: '22px',
              padding: '0 4px',
            }}
          >
            &times;{nombre}
          </div>
        )}
      </div>

      {/* Label designation sous le bloc */}
      <span className="text-[9px] text-gray-600 leading-tight truncate max-w-[130px] mt-0.5 text-center px-0.5">
        {v.designation
          ? v.designation.length > 18
            ? v.designation.substring(0, 18) + '...'
            : v.designation
          : v.type}
      </span>
    </div>
  )
}

export function RameVisual({ vehicules, selectedIdx, onSelect, onReorder }: RameVisualProps) {
  const sensors = useSensors(
    // distance 6px : un simple clic sélectionne, un glisser déplace
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  if (vehicules.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
        Aucun vehicule
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorder) return
    const from = vehicules.findIndex((v) => v.id === active.id)
    const to = vehicules.findIndex((v) => v.id === over.id)
    if (from === -1 || to === -1) return
    onReorder(from, to)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={vehicules.map((v) => v.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{ minHeight: '100px' }}>
          {vehicules.map((v, i) => (
            <WagonSortable
              key={v.id}
              v={v}
              isSelected={selectedIdx === i}
              onSelect={() => onSelect(selectedIdx === i ? null : i)}
              dragEnabled={!!onReorder}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
