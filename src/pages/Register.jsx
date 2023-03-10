import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import addAvatar from "../images/addAvatar.png";
import loadingGif from "../images/createAccount.gif";

// Firebase imports
import { auth, storage, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [error, setError] = useState(false);
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const image = e.target[3].files[0];

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const storageRef = ref(storage, displayName);

      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        (error) => {
          setError(true);
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateProfile(res.user, {
              displayName: displayName,
              photoURL: downloadURL,
            });

            await setDoc(doc(db, "Users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            await setDoc(doc(db, "userChats", res.user.uid), {});

            navigate("/");
          });
        }
      );

      //
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <Logo />
        <span className="title">Register</span>

        {loading ? (
          <img src={loadingGif} alt="" width="250" height="250" />
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <input required type="text" placeholder="Display name" />
              <input required type="email" placeholder="Email" />
              <input required type="password" placeholder="Password" />
              <input
                required
                style={{ display: "none" }}
                type="file"
                id="imageFile"
                onChange={(e) => setImg(e.target.files[0])}
              />
              <label htmlFor="imageFile">
                <img
                  src={img ? URL.createObjectURL(img) : addAvatar}
                  alt=""
                ></img>
                <span>Add a avatar (required)</span>
              </label>
              <button>Sign Up</button>
              {error && (
                <span style={{ color: "red" }}>Somting went wrong...</span>
              )}
            </form>
            <p>
              You do have an account? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
