const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="border p-4 rounded">
    <h3>{product.name}</h3>
    <p>SKU: {product.sku}</p>
    <p>Stock: {product.stock}</p>
    <p>Threshold: {product.threshold}</p>
    <p>Expiry: {new Date(product.expiryDate).toLocaleDateString()}</p>
    <button onClick={() => onEdit(product)}>Edit</button>
    <button onClick={() => onDelete(product.id)}>Delete</button>
  </div>
);

export default ProductCard;
