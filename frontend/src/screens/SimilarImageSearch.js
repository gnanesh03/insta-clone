import { useState } from "react";
import axios from "axios";
const SimilarImageSearch = () => {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);

  const formData = new FormData();
  if (image) {
    formData.append("image", image);
  }

  const handleSearch = async () => {
    try {
      const url = process.env.REACT_APP_BACKEND_URL;

      const response = await axios.post(
        url + "/search-similar-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
      setImages(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>input your image</h1>
      <input
        type="file"
        onChange={(e) => {
          setImage(e.target.files[0]);
        }}
        accept="image/*"
      />

      <button onClick={handleSearch}>Search</button>

      {images.length > 1 && (
        <div>
          <div style={{ marginLeft: "400px" }}>
            <h1>Your query image</h1>
            <img src={images[0].url} style={{ width: "200px" }} />
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <h1>Results</h1>
          {images.map((e) => {
            return <img style={{ width: "200px" }} key={e.url} src={e.url} />;
          })}
        </div>
      )}
    </div>
  );
};

export default SimilarImageSearch;
