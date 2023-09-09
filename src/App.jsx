import { useState } from 'react'
import './App.css'
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignIn: false,
    name: "",
    email: "",
    password: "",
    picture: "",
    error: "",
    success: false
  });
  // sign In auth
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then(res => {
        const { name, email, picture } = res.additionalUserInfo.profile;
        const credential = res.credential;
        const signedUser = {
          isSignIn: true,
          name: name,
          email: email,
          picture: picture
        }
        setUser(signedUser);
        // console.log(name, email, picture)
        // console.log(res)
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
      })
  }
  // signout auth
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signOutUser = {
          isSignIn: false,
          name: "",
          email: "",
          picture: "",
          // error: ""
        }
        setUser(signOutUser)
      })
      .catch(error => {
        // console.log(error);
      })
  }
  // Email and password auth
  const handleBlur = (event) => {
    // console.log(event.target.name,event.target.value);
    let isFieldValid = true;
    if (event.target.name === "name") {
      isFieldValid = /^[a-zA-Z]+$/.test(event.target.value)
      // console.log(event.target.value);
      // console.log(isFieldValid);
    }
    if (event.target.name === "email") {
      isFieldValid = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(event.target.value);
    }
    if (event.target.name === "password") {
      const isPasswordValid = event.target.value.length > 6;
      const hasNumberPassword = /\d{1}/.test(event.target.value)
      isFieldValid = isPasswordValid && hasNumberPassword;
    }
    if (isFieldValid) {
      const newUser = { ...user }
      newUser[event.target.name] = event.target.value;
      setUser(newUser)
    }
  }
  const handleSubmit = (event) => {
    console.log("in in submit");
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          const newUserInfo = { ...user }
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          const newUserInfo = { ...user }
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in with e p", userCredential);
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false
          setUser(newUserInfo);
        });
    }
    event.preventDefault();
  }
  // update user name
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(() => {
      console.log("update successful");
    }).catch((error) => {
      console.log(error);
    });
  }
  const handleFbSignIn = () => {
    firebase.auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;
        // IdP data available in result.additionalUserInfo.profile.
        // ...

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        console.log("fb user", user);
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(error);
        // ...
      });
  }
  return (
    <>
      {
        user.isSignIn ? <button onClick={handleSignOut}>Sign out</button> : <button onClick={handleSignIn}>Sign in</button>
      } <br />
      <button onClick={handleFbSignIn}>Sign in with facebook</button>
      {
        user.isSignIn && <div>
          <h3>Welcome {user.name}</h3>
          <p>Your Email {user.email}</p>
          <img src={user.picture} alt="" />
        </div>
      }
      <h3>Our Own Authentication</h3>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New user sign up</label>
      {/* <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}
      <form onSubmit={handleSubmit}>
        {newUser && <div><input type="text" name="name" onBlur={handleBlur} placeholder='Your Name' required /><br /></div>}
        <input type="text" name='email' onBlur={handleBlur} placeholder='Your Email' required /> <br />
        <input type="password" onBlur={handleBlur} name="password" placeholder='Your Password' required /> <br />
        <input type="submit" value={newUser ? "Sign Up" : "Sign In"} />
      </form>
      <p style={{ color: "red" }}>{user.error}</p>
      {user.success && <p style={{ color: "green" }}>User {newUser ? 'Created' : "logged In"} Successfully</p>}
    </>
  )
}

export default App
