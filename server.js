// server.js
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

async function solvedToday(username) {
  const url = "https://leetcode.com/graphql";
  const query = `
    query recentSubmissions($username: String!) {
      recentSubmissionList(username: $username) {
        statusDisplay
        timestamp
      }
    }
  `;

  try {
    const response = await axios.post(url, {
      query,
      variables: { username },
    });

    const list = response.data?.data?.recentSubmissionList || [];
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    for (const sub of list) {
      if (sub.statusDisplay === "Accepted") {
        const t = new Date(sub.timestamp * 1000);
        const tUTC = new Date(
          Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())
        );
        if (tUTC.getTime() === todayUTC.getTime()) return true;
      }
    }
    return false;
  } catch (err) {
    console.error("LeetCode API error:", err.message);
    return false;
  }
}

app.get("/check", async (req, res) => {
  const user = req.query.user;
  if (!user) return res.status(400).json({ error: "Missing ?user=" });

  const solved = await solvedToday(user);
  res.json({ username: user, solvedToday: solved });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
