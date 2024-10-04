import React, { useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/LoadingCoverScreen/Loading";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="login-page">
          <div className="login-container">
            <div className="login-header">
              <h1>Linggwistiko</h1> 
              <p>Welcome back! Please login to your account.</p>
            </div>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="options">
                <button type="submit" className="primary-button-login">Login</button>
                <p className="forgot-password">Forgot Password?</p>
              </div>
            </form>

            <div className="divider">OR</div>

            <button onClick={handleGoogleLogin} className="google-login-button">
              <i className="fab fa-google"></i> Login with Google
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
