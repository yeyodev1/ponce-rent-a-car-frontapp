import { refId, type Vehicle, type VehicleStatus } from '@/types/admin'

/** Formulario de unidad: la categoría viaja como id, no poblada. */
export interface VehicleForm {
  category: string
  brand: string
  model: string
  year: number
  plate: string
  color: string
  transmission: 'automatic' | 'manual'
  images: string[]
  status: VehicleStatus
  owner: string
  notes: string
  isActive: boolean
}

export const emptyVehicle = (): VehicleForm => ({
  category: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: '',
  transmission: 'automatic',
  images: [],
  status: 'available',
  owner: '',
  notes: '',
  isActive: true,
})

export const vehicleToForm = (v: Vehicle): VehicleForm => ({
  ...emptyVehicle(),
  ...JSON.parse(JSON.stringify(v)),
  category: refId(v.category),
})

export const vehicleToBody = (f: VehicleForm) => ({ ...f, plate: f.plate.toUpperCase() })
