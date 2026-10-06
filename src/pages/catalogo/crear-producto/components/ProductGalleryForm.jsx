import DropzoneFormInput from '@/components/form/DropzoneFormInput';
const ProductGalleryForm = () => {
  return <DropzoneFormInput label="Galería del producto" labelClassName="fs-14 mb-1" iconProps={{
    icon: 'bx:cloud-upload',
    height: 36,
    width: 36
  }} text="Arrastra los archivos aquí o haz clic para seleccionarlos" helpText={<span className="text-muted fs-13">
          (Esta zona de carga es solo una demostración. Los archivos seleccionados <strong>no</strong> se suben realmente.)
        </span>} showPreview />;
};
export default ProductGalleryForm;