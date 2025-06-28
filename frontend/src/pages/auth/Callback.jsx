import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // The backend redirects with a token. We need to fetch the user profile
      // using this token to get the full user object.
      fetch(`/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user profile');
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        // Save user to local storage and update auth context
        localStorage.setItem('chat-user', JSON.stringify(data));
        setAuthUser(data);
        navigate('/');
      })
      .catch((error) => {
        console.error('Authentication Error:', error);
        navigate('/login');
      });
    } else {
      // If no token is present, redirect to login
      navigate('/login');
    }
  }, [location, navigate, setAuthUser]);

  // Display a loading message while processing the token
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Authenticating, please wait...</p>
    </div>
  );
};

export default Callback;
