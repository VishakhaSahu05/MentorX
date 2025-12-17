import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

import Body from "./components/Body";
import Landing from "./components/Landing";
import Mentors from "./components/Mentors";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Feed from "./components/Feed";
import MentorDashboard from "./components/MentorDashboard";
import Profile from "./components/Profile";

const App = () => {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          <Route element={<Body />}>
            <Route
              path="/"
              element={
                <>
                  <Landing />
                  <Mentors />
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/profile" element={<Profile />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
