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

const App = () => {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>

          {/* Layout Route (Navbar lives here via Body + Outlet) */}
          <Route element={<Body />}>

            {/* Public Home */}
            <Route
              path="/"
              element={
                <>
                  <Landing />
                  <Mentors />
                </>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student */}
            <Route path="/feed" element={<Feed />} />

            {/* Mentor */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
