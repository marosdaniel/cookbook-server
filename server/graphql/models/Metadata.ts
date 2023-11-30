import { model, Schema } from 'mongoose';

export type TMetadataType = 'level' | 'category' | 'unit' | 'label';
export interface IMetadata {
  key: string;
  label: string;
  type: TMetadataType;
  name: string;
}

const metadataSchema = new Schema<IMetadata>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
});

export const Metadata = model<IMetadata>('Metadata', metadataSchema);
