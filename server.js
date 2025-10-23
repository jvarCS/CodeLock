// server.js
import express from "express";  // Used to create server
import axios from "axios";      // Used to 
import cors from "cors";        // Used to access endpoints across different origins?

const app = express();  // Create the server
app.use(cors());        // Enable cross origin

async function solvedToday(username) {  // Create a function with async tag that allows the use of await 
  const url = "https://leetcode.com/graphql";   // Define the url to be visited
  // The query to be used by the graphql api
  // Gets recent submissions by $username and their status (accepted or failed), and their timestamp
  const query = `       
    query recentSubmissions($username: String!) {
      recentSubmissionList(username: $username) {
        statusDisplay
        timestamp
      }
    }
  `;

  try {
    const response = await axios.post(url, {    // sends a POST request to LeetCode’s GraphQL API. awaits for the apis response before progressing
      query,                    // Defines a query which is the query we made above
      variables: { username },  // List of variables, this replaces $username with an actual username
    });

    // Stores the status and timestamp of recent submissions if there are any, otherwise initializes to empty list                                                      
    const list = response.data?.data?.recentSubmissionList || [];   
    const today = new Date(); // Makes new date
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    for (const sub of list) { // For submissions previously retrieved
      if (sub.statusDisplay === "Accepted") { // If the submission was accepted
        const t = new Date(sub.timestamp * 1000);
        const tUTC = new Date(
          Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())
        );
        if (tUTC.getTime() === todayUTC.getTime()) return true;
      }
    }
    return false; // Returns false if list is empty or if after going through all submissions, there is no accepted submission
  } catch (err) {
    console.error("LeetCode API error:", err.message);
    return false;
  }
}

app.get("/", (req, res) => {
  res.send(`
    <h1>CodeLock Backend</>
    <p>Welcome to CodeLock! The leetcode consistancy enforcer</p>
    <pre>/check?user=your_leetcode_username</pre>
    `);
});

app.get("/check", async (req, res) => { // Defines a route at /check
  const user = req.query.user;
  if (!user) return res.status(400).json({ error: "Missing ?user=" });

  const solved = await solvedToday(user);
  res.json({ username: user, solvedToday: solved });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
