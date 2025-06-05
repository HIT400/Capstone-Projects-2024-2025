import React, { useState } from "react";
import axios from "axios";

const ProductCreationPage = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
  });
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("product", JSON.stringify(productData));

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/products/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Product created successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      setMessage("Error creating product");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Create New Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={productData.category}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Product Images:</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>

        <button type="submit">Create Product</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ProductCreationPage;
